// MarkdownEditorPanel — Admin editor with rich toolbar
// Goal: match the provided toolbar layout (word-processor like), while still editing Markdown/HTML.
// - Provide common formatting buttons (B/I/U/刪除線、字色、底色、對齊、清單、縮排)
// - Provide insert dialogs (link / image / media / table)
// - Provide special char / emoji quick insert
// - Provide undo/redo
// - Provide code/preview toggle

import { useCallback, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Bookmark,
  Code2,
  Eye,
  Highlighter,
  Image as ImageIcon,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link2,
  List,
  ListOrdered,
  Omega,
  Paintbrush,
  PlaySquare,
  Redo2,
  Smile,
  Strikethrough,
  Table,
  Underline,
  Undo2,
} from "lucide-react";


function toYouTubeEmbedUrl(input: string): string {
  try {
    const u = new URL(input.trim());
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "").trim();
      return id ? `https://www.youtube.com/embed/${id}` : input;
    }
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/embed/")) return input;
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : input;
    }
    return input;
  } catch {
    return input;
  }
}

function insertAtCursor(textarea: HTMLTextAreaElement | null, current: string, snippet: string) {
  if (!textarea) return current + "\n" + snippet;
  const start = textarea.selectionStart ?? current.length;
  const end = textarea.selectionEnd ?? current.length;
  const next = current.slice(0, start) + snippet + current.slice(end);
  requestAnimationFrame(() => {
    try {
      textarea.focus();
      const pos = start + snippet.length;
      textarea.setSelectionRange(pos, pos);
    } catch {}
  });
  return next;
}

function wrapSelection(
  textarea: HTMLTextAreaElement | null,
  current: string,
  left: string,
  right: string,
  fallbackText = "文字",
) {
  if (!textarea) return current + left + fallbackText + right;
  const start = textarea.selectionStart ?? current.length;
  const end = textarea.selectionEnd ?? current.length;
  const sel = current.slice(start, end) || fallbackText;
  const next = current.slice(0, start) + left + sel + right + current.slice(end);
  requestAnimationFrame(() => {
    try {
      textarea.focus();
      const pos = start + left.length + sel.length + right.length;
      textarea.setSelectionRange(pos, pos);
    } catch {}
  });
  return next;
}

function transformLines(
  textarea: HTMLTextAreaElement | null,
  current: string,
  fn: (line: string) => string,
) {
  if (!textarea) return current;
  const start = textarea.selectionStart ?? current.length;
  const end = textarea.selectionEnd ?? current.length;

  const before = current.slice(0, start);
  const target = current.slice(start, end);
  const after = current.slice(end);

  const nextTarget = target
    .split("\n")
    .map((l) => fn(l))
    .join("\n");

  const next = before + nextTarget + after;
  requestAnimationFrame(() => {
    try {
      textarea.focus();
      textarea.setSelectionRange(start, start + nextTarget.length);
    } catch {}
  });
  return next;
}

function insertListPrefix(textarea: HTMLTextAreaElement | null, current: string, ordered: boolean) {
  return transformLines(textarea, current, (line) => {
    const trimmed = line.trim();
    if (!trimmed) return ordered ? "1. " : "- ";
    if (ordered) {
      if (/^\d+\.\s+/.test(trimmed)) return line;
      return line.replace(/^\s*/, (m) => m + "1. ");
    }
    if (/^-\s+/.test(trimmed)) return line;
    return line.replace(/^\s*/, (m) => m + "- ");
  });
}

function indentLines(textarea: HTMLTextAreaElement | null, current: string, dir: "in" | "out") {
  return transformLines(textarea, current, (line) => {
    if (dir === "in") return line ? `  ${line}` : "  ";
    return line.replace(/^\s{1,2}/, "");
  });
}

function alignBlock(textarea: HTMLTextAreaElement | null, current: string, align: "left" | "center" | "right") {
  const style = `text-align:${align};`;
  return wrapSelection(textarea, current, `<div style=\"${style}\">`, "</div>", "對齊文字");
}

function buildTable(cols = 3, rows = 3) {
  const header = `| ${Array.from({ length: cols }).map((_, i) => `欄位${i + 1}`).join(" | ")} |`;
  const sep = `| ${Array.from({ length: cols }).map(() => "---").join(" | ")} |`;
  const body = Array.from({ length: rows }).map(() => `| ${Array.from({ length: cols }).map(() => "內容").join(" | ")} |`);
  return "\n" + [header, sep, ...body].join("\n") + "\n";
}

const EMOJIS = ["😀", "😎", "✨", "🔥", "🎉", "✅", "📌", "📷", "🎬", "🔗", "🧰", "⚠️"];
const SPECIAL_CHARS = ["©", "®", "™", "•", "→", "←", "↑", "↓", "✓", "★", "☆", "※", "●", "◎", "■", "□", "▲", "▼", "◆", "◇"];

export default function MarkdownEditorPanel({
  value,
  onChange,
  className,
  height = 560,
  label = "內容",
}: {
  value: string;
  onChange: (next: string) => void;
  className?: string;
  height?: number;
  label?: string;
}) {
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  // simple undo/redo stacks for textarea edits
  const undoRef = useRef<string[]>([]);
  const redoRef = useRef<string[]>([]);

  const commit = useCallback(
    (next: string) => {
      if (next === value) return;
      undoRef.current.push(value ?? "");
      if (undoRef.current.length > 80) undoRef.current.shift();
      redoRef.current = [];
      onChange(next);
    },
    [onChange, value],
  );

  const undo = useCallback(() => {
    const prev = undoRef.current.pop();
    if (typeof prev !== "string") return;
    redoRef.current.push(value ?? "");
    onChange(prev);
    requestAnimationFrame(() => taRef.current?.focus());
  }, [onChange, value]);

  const redo = useCallback(() => {
    const next = redoRef.current.pop();
    if (typeof next !== "string") return;
    undoRef.current.push(value ?? "");
    onChange(next);
    requestAnimationFrame(() => taRef.current?.focus());
  }, [onChange, value]);

  const iconBtn = useCallback(
    (
      icon: React.ReactNode,
      title: string,
      onClick: () => void,
      opts?: { active?: boolean; w?: string },
    ) => (
      <button
        type="button"
        title={title}
        onClick={onClick}
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-md border border-transparent px-2 text-foreground/90 transition",
          "hover:border-border/70 hover:bg-secondary/40",
          opts?.active && "border-accent/50 bg-accent/15",
          opts?.w,
        )}
      >
        {icon}
      </button>
    ),
    [],
  );

  const toolbar = useMemo(() => {
    return (
      <div className="border-b border-border/70 bg-background/40">
        {/* Menu strip (visual parity) */}
        <div className="flex flex-wrap gap-6 px-3 py-2 text-sm text-muted-foreground">
          {[
            "檔案",
            "編輯",
            "查看",
            "插入",
            "格式",
            "工具",
            "表格",
          ].map((t) => (
            <div key={t} className="select-none">
              {t}
            </div>
          ))}
          <div className="ml-auto text-xs text-muted-foreground/80">{label}</div>
        </div>

        {/* Icon toolbar */}
        <div className="flex flex-wrap items-center gap-1 px-3 pb-2">
          {iconBtn(<Bold className="h-5 w-5" />, "粗體", () => commit(wrapSelection(taRef.current, value ?? "", "**", "**", "粗體")))}
          {iconBtn(<Italic className="h-5 w-5" />, "斜體", () => commit(wrapSelection(taRef.current, value ?? "", "*", "*", "斜體")))}
          {iconBtn(
            <Underline className="h-5 w-5" />,
            "底線",
            () => commit(wrapSelection(taRef.current, value ?? "", "<u>", "</u>", "底線")),
          )}
          {iconBtn(
            <Strikethrough className="h-5 w-5" />,
            "刪除線",
            () => commit(wrapSelection(taRef.current, value ?? "", "~~", "~~", "刪除線")),
          )}

          <div className="mx-1 h-7 w-px bg-border/70" />

          <ColorButton
            icon={<Paintbrush className="h-5 w-5" />}
            title="文字顏色"
            onInsert={(snippet) => commit(wrapSelection(taRef.current, value ?? "", snippet, "</span>", "文字"))}
          />
          <HighlightButton
            icon={<Highlighter className="h-5 w-5" />}
            title="底色標記"
            onInsert={(snippet) => commit(wrapSelection(taRef.current, value ?? "", snippet, "</mark>", "重點"))}
          />

          <div className="mx-1 h-7 w-px bg-border/70" />

          {iconBtn(<AlignLeft className="h-5 w-5" />, "靠左", () => commit(alignBlock(taRef.current, value ?? "", "left")))}
          {iconBtn(<AlignCenter className="h-5 w-5" />, "置中", () => commit(alignBlock(taRef.current, value ?? "", "center")))}
          {iconBtn(<AlignRight className="h-5 w-5" />, "靠右", () => commit(alignBlock(taRef.current, value ?? "", "right")))}

          <div className="mx-1 h-7 w-px bg-border/70" />

          {iconBtn(<List className="h-5 w-5" />, "項目符號", () => commit(insertListPrefix(taRef.current, value ?? "", false)))}
          {iconBtn(
            <ListOrdered className="h-5 w-5" />,
            "編號清單",
            () => commit(insertListPrefix(taRef.current, value ?? "", true)),
          )}
          {iconBtn(<IndentDecrease className="h-5 w-5" />, "減少縮排", () => commit(indentLines(taRef.current, value ?? "", "out")))}
          {iconBtn(<IndentIncrease className="h-5 w-5" />, "增加縮排", () => commit(indentLines(taRef.current, value ?? "", "in")))}

          <div className="mx-1 h-7 w-px bg-border/70" />

          <InsertLinkButton onInsert={(snippet) => commit(insertAtCursor(taRef.current, value ?? "", snippet))} iconOnly />
          <InsertImageButton onInsert={(snippet) => commit(insertAtCursor(taRef.current, value ?? "", snippet))} iconOnly />
          <InsertYouTubeButton onInsert={(snippet) => commit(insertAtCursor(taRef.current, value ?? "", snippet))} iconOnly />
          {iconBtn(
            <Table className="h-5 w-5" />,
            "插入表格",
            () => commit(insertAtCursor(taRef.current, value ?? "", buildTable())),
          )}

          <div className="mx-1 h-7 w-px bg-border/70" />

          <PickerButton
            icon={<Omega className="h-5 w-5" />}
            title="特殊符號"
            items={SPECIAL_CHARS}
            onPick={(ch) => commit(insertAtCursor(taRef.current, value ?? "", ch))}
          />
          <PickerButton
            icon={<Smile className="h-5 w-5" />}
            title="表情符號"
            items={EMOJIS}
            onPick={(ch) => commit(insertAtCursor(taRef.current, value ?? "", ch))}
          />
          {iconBtn(<Bookmark className="h-5 w-5" />, "書籤（插入標記）", () => commit(insertAtCursor(taRef.current, value ?? "", "\n<!-- BOOKMARK -->\n")))}

          <div className="mx-1 h-7 w-px bg-border/70" />

          {iconBtn(<Undo2 className="h-5 w-5" />, "復原", undo)}
          {iconBtn(<Redo2 className="h-5 w-5" />, "重做", redo)}


        </div>
      </div>
    );
  }, [commit, iconBtn, label, redo, undo, value]);

  return (
    <div
      data-color-mode="dark"
      className={cn("overflow-hidden rounded-xl border border-border/70 bg-background/10", className)}
    >
      {toolbar}

      <div className="p-3">
        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => {
            commit(e.target.value);
          }}
          className="min-h-[240px] w-full resize-none rounded-xl border border-border/70 bg-background/20 p-4 font-mono text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent"
          style={{ height }}
          placeholder="在此輸入 Markdown/HTML..."
        />
        <div className="mt-2 text-xs text-muted-foreground">
          提示：這是 Markdown/HTML 編輯器；工具列會用 Markdown 或 HTML 片段插入格式（支援 &lt;img&gt; / &lt;iframe&gt; / &lt;div style...&gt;）。
        </div>
      </div>
    </div>
  );
}

function PickerButton({
  icon,
  title,
  items,
  onPick,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  onPick: (item: string) => void;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          title={title}
          className="inline-flex h-10 items-center justify-center rounded-md border border-transparent px-2 text-foreground/90 transition hover:border-border/70 hover:bg-secondary/40"
        >
          {icon}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-8 gap-2">
          {items.map((ch) => (
            <button
              key={ch}
              type="button"
              className="rounded-md border border-border/70 bg-background/20 p-2 text-lg hover:bg-secondary/40"
              onClick={() => onPick(ch)}
            >
              {ch}
            </button>
          ))}
        </div>
        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
}

function ColorButton({
  icon,
  title,
  onInsert,
}: {
  icon: React.ReactNode;
  title: string;
  onInsert: (leftTag: string) => void;
}) {
  const [color, setColor] = useState("#76FFA6");
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          title={title}
          className="inline-flex h-10 items-center justify-center rounded-md border border-transparent px-2 text-foreground/90 transition hover:border-border/70 hover:bg-secondary/40"
        >
          {icon}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="text-xs text-muted-foreground">色碼</div>
            <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="#76FFA6" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md border border-border/70" style={{ background: color }} />
            <div className="text-xs text-muted-foreground">套用於選取文字</div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => onInsert(`<span style=\"color:${color}\">`)}>
            套用
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function HighlightButton({
  icon,
  title,
  onInsert,
}: {
  icon: React.ReactNode;
  title: string;
  onInsert: (leftTag: string) => void;
}) {
  const [color, setColor] = useState("#FFE96B");
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          title={title}
          className="inline-flex h-10 items-center justify-center rounded-md border border-transparent px-2 text-foreground/90 transition hover:border-border/70 hover:bg-secondary/40"
        >
          {icon}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="text-xs text-muted-foreground">底色</div>
            <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="#FFE96B" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md border border-border/70" style={{ background: color }} />
            <div className="text-xs text-muted-foreground">套用於選取文字</div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => onInsert(`<mark style=\"background:${color};padding:0 .2em;border-radius:.2em\">`)}>
            套用
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InsertImageButton({
  onInsert,
  iconOnly,
}: {
  onInsert: (snippet: string) => void;
  iconOnly?: boolean;
}) {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [w, setW] = useState("800");
  const [h, setH] = useState("");

  const build = () => {
    const src = url.trim();
    if (!src) return "";
    const widthAttr = w.trim() ? ` width=\"${w.trim()}\"` : "";
    const heightAttr = h.trim() ? ` height=\"${h.trim()}\"` : "";
    const altAttr = ` alt=\"${(alt || "image").replace(/\"/g, "'")}\"`;
    return `\n<img src=\"${src}\"${altAttr}${widthAttr}${heightAttr} />\n`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {iconOnly ? (
          <button
            type="button"
            title="插入/編輯圖片"
            className="inline-flex h-10 items-center justify-center rounded-md border border-transparent px-2 text-foreground/90 transition hover:border-border/70 hover:bg-secondary/40"
          >
            <ImageIcon className="h-5 w-5" />
          </button>
        ) : (
          <Button type="button" size="sm" variant="secondary" title="插入/編輯圖片">
            <ImageIcon className="mr-2 h-4 w-4" /> 圖片
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>插入/編輯圖片</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div>
            <div className="text-xs text-muted-foreground">圖片連結</div>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">替代說明（alt）</div>
            <Input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="例如：活動照片" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <div className="text-xs text-muted-foreground">寬度（px）</div>
              <Input value={w} onChange={(e) => setW(e.target.value)} placeholder="800" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">高度（px，可留空）</div>
              <Input value={h} onChange={(e) => setH(e.target.value)} placeholder="" />
            </div>
          </div>
          <div className="text-xs text-muted-foreground">建議尺寸：1600×900（16:9），最少 1280×720</div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={() => {
              const snippet = build();
              if (!snippet) return;
              onInsert(snippet);
            }}
          >
            插入
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InsertYouTubeButton({
  onInsert,
  iconOnly,
}: {
  onInsert: (snippet: string) => void;
  iconOnly?: boolean;
}) {
  const [url, setUrl] = useState("");
  const [w, setW] = useState("960");
  const [h, setH] = useState("540");

  const build = () => {
    const src0 = url.trim();
    if (!src0) return "";
    const src = toYouTubeEmbedUrl(src0);
    const width = w.trim() || "960";
    const height = h.trim() || "540";
    return `\n<iframe src=\"${src}\" width=\"${width}\" height=\"${height}\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" allowfullscreen></iframe>\n`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {iconOnly ? (
          <button
            type="button"
            title="插入/編輯媒體（YouTube）"
            className="inline-flex h-10 items-center justify-center rounded-md border border-transparent px-2 text-foreground/90 transition hover:border-border/70 hover:bg-secondary/40"
          >
            <PlaySquare className="h-5 w-5" />
          </button>
        ) : (
          <Button type="button" size="sm" variant="secondary" title="插入/編輯 YouTube 影片">
            <PlaySquare className="mr-2 h-4 w-4" /> 影片
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>插入/編輯媒體（YouTube）</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div>
            <div className="text-xs text-muted-foreground">YouTube 連結</div>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <div className="text-xs text-muted-foreground">寬度（px）</div>
              <Input value={w} onChange={(e) => setW(e.target.value)} placeholder="960" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">高度（px）</div>
              <Input value={h} onChange={(e) => setH(e.target.value)} placeholder="540" />
            </div>
          </div>
          <div className="text-xs text-muted-foreground">建議尺寸：960×540（16:9），最少 640×360</div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={() => {
              const snippet = build();
              if (!snippet) return;
              onInsert(snippet);
            }}
          >
            插入
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InsertLinkButton({
  onInsert,
  iconOnly,
}: {
  onInsert: (snippet: string) => void;
  iconOnly?: boolean;
}) {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");

  const build = () => {
    const u = url.trim();
    if (!u) return "";
    const t = (text.trim() || u).replace(/\]/g, "");
    return `\n[${t}](${u})\n`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {iconOnly ? (
          <button
            type="button"
            title="插入連結"
            className="inline-flex h-10 items-center justify-center rounded-md border border-transparent px-2 text-foreground/90 transition hover:border-border/70 hover:bg-secondary/40"
          >
            <Link2 className="h-5 w-5" />
          </button>
        ) : (
          <Button type="button" size="sm" variant="secondary" title="插入連結">
            <Link2 className="mr-2 h-4 w-4" /> 連結
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>插入連結</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div>
            <div className="text-xs text-muted-foreground">顯示文字（可留空）</div>
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="例如：查看更多" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">連結網址</div>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={() => {
              const snippet = build();
              if (!snippet) return;
              onInsert(snippet);
            }}
          >
            插入
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
