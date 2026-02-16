import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

export default function ScrollToTopFab() {
  const { scrollY } = useScroll();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const unsub = scrollY.on("change", (v) => {
      setShow(v > 420);
    });
    return () => {
      try {
        unsub();
      } catch {
        // ignore
      }
    };
  }, [scrollY]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-5 right-5 z-[70]"
          initial={{ opacity: 0, y: 14, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: 0.9 }}
          transition={{ duration: 0.18 }}
        >
          <Button
            size="icon"
            className="h-12 w-12 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 neon-pill"
            aria-label="回到頁面頂部"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
