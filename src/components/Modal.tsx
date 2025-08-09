"use client";
import { ReactNode, useEffect } from "react";

export default function Modal({ open, onClose, children }: { open: boolean; onClose: ()=>void; children: ReactNode }) {
  useEffect(()=>{
    const onKey = (e: KeyboardEvent)=>{ if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", onKey);
    return ()=> window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded shadow max-w-lg w-full p-4">
          <div className="flex justify-end"><button className="px-2 py-1" onClick={onClose}>✕</button></div>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
