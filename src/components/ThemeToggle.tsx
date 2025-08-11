"use client";
import { useEffect, useState } from "react";

const KEY = "theme_dark_v1";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(()=>{
    const saved = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    const initial = saved ? saved === "1" : window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    setDark(initial);
  }, []);
  useEffect(()=>{
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.classList.toggle("light", !dark);
    try { localStorage.setItem(KEY, dark ? "1" : "0"); } catch {}
  }, [dark]);
  return (
    <button className="border rounded px-3 py-1" onClick={()=>setDark(v=>!v)}>
      {dark ? "Light" : "Dark"}
    </button>
  );
}
