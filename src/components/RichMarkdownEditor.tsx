// RichMarkdownEditor — used in Admin
// Uses @uiw/react-md-editor for toolbar editing, output is Markdown.

import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

export default function RichMarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <MDEditor
      value={value}
      onChange={(v) => onChange(v ?? "")}
      height={520}
      visibleDragbar={false}
      data-color-mode="dark"
      preview="live"
    />
  );
}
