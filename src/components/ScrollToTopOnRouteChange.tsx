import { useEffect } from "react";
import { useLocation } from "wouter";

export default function ScrollToTopOnRouteChange() {
  const [loc] = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [loc]);

  return null;
}
