"use client";
import { ReactNode, useEffect } from "react";
import { useI18n } from "@/lib/i18n";

export default function Modal({ open, onClose, children }: { open: boolean; onClose: ()=>void; children: ReactNode }) {
  const { t } = useI18n();
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
        <div className="bg-[var(--surface)] text-[var(--foreground)] rounded-xl shadow-2xl ring-1 ring-[var(--border)] max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
          <div className="sticky top-0 z-10 flex justify-end p-3 bg-[var(--surface)]/70 backdrop-blur rounded-t-xl">
            <button className="pill-btn" onClick={onClose} aria-label={t('modal.close')}>
              {t('modal.close')}
            </button>
          </div>
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
