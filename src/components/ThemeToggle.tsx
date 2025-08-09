"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(()=>{
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return (
    <button className="border rounded px-3 py-1" onClick={()=>setDark(v=>!v)}>
      {dark ? "Light" : "Dark"}
    </button>
  );
}
