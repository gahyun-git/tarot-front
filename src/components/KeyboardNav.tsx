"use client";
import { useEffect } from "react";

export default function KeyboardNav({ rootId, enabled=true }: { rootId?: string; enabled?: boolean }) {
  useEffect(()=>{
    if (!enabled) return;
    const selector = '[data-card="1"]';
    const root = rootId ? document.getElementById(rootId) : document;
    const focusables = () => Array.from(root?.querySelectorAll(selector) ?? []) as HTMLElement[];
    let idx = 0;
    const focusAt = (i: number) => {
      const list = focusables();
      if (list.length===0) return;
      idx = (i + list.length) % list.length;
      list[idx]?.focus();
    };
    const handler = (e: KeyboardEvent)=>{
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); focusAt(idx+1); }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); focusAt(idx-1); }
      if (e.key === "Home") { e.preventDefault(); focusAt(0); }
      if (e.key === "End") { e.preventDefault(); focusAt(9999); }
      if (e.key === "Enter") { (document.activeElement as HTMLElement)?.click(); }
    };
    window.addEventListener("keydown", handler);
    focusAt(0);
    return ()=> window.removeEventListener("keydown", handler);
  }, [rootId, enabled]);
  return null;
}
