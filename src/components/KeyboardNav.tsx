"use client";
import { useEffect } from "react";

export default function KeyboardNav() {
  useEffect(()=>{
    const handler = (e: KeyboardEvent)=>{
      const cards = Array.from(document.querySelectorAll('[data-card="1"]')) as HTMLElement[];
      // reserved for future: implement grid navigation by arrow keys
    };
    window.addEventListener("keydown", handler);
    return ()=> window.removeEventListener("keydown", handler);
  }, []);
  return null;
}
