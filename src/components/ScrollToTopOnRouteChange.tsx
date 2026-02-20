import { useLayoutEffect } from "react";
import { useLocation } from "wouter";

/**
 * 確保在任何路由或網址變化時（包括 Hash 參數變化），頁面都能置頂。
 */
export default function ScrollToTopOnRouteChange() {
  const [loc] = useLocation();

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    // 禁用瀏覽器的自動捲動恢復功能
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const forceScrollTop = () => {
      // 嘗試所有可能的置頂方式
      window.scrollTo(0, 0);
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
        document.documentElement.scrollTo(0, 0);
      }
      
      if (document.body) {
        document.body.scrollTop = 0;
        document.body.scrollTo(0, 0);
      }
    };

    // 監聽原生的 hashchange，確保即使 path 沒變（只有參數變）也能觸發
    const handleHashChange = () => {
      forceScrollTop();
      // 補償延遲渲染
      setTimeout(forceScrollTop, 50);
      setTimeout(forceScrollTop, 150);
    };

    window.addEventListener("hashchange", handleHashChange);
    
    // 初始與 loc 變化時執行
    forceScrollTop();
    
    // 多重定時保險，應對非同步載入的內容
    const timers = [
      setTimeout(forceScrollTop, 0),
      setTimeout(forceScrollTop, 100),
      setTimeout(forceScrollTop, 300),
      setTimeout(forceScrollTop, 600),
      setTimeout(forceScrollTop, 1000),
    ];

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      timers.forEach(clearTimeout);
    };
  }, [loc, window.location.hash, window.location.search]);

  return null;
}
