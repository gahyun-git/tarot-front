"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useEffect, useState } from "react";

export default function MarketingHome() {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  useEffect(()=> setMounted(true), []);
  return (
    <main className="space-y-6">
      <header className="retro-header">
        <div className="inner max-w-5xl mx-auto px-4 flex items-center justify-between">
          <div className="retro-brand">✨ go4it.site</div>
          <nav className="flex gap-3 text-sm">
            <Link href="/tarot" className="retro-chip">Tarot</Link>
            <Link href="/" className="retro-chip">App</Link>
          </nav>
        </div>
      </header>
      <section className="retro-hero p-6">
        <h1 className="title-retro text-2xl mb-2">{mounted ? "운세/점 서비스 포털" : ""}</h1>
        <p className="mb-3">{mounted ? "AI 기반 다양한 점술을 한 곳에서 경험해 보세요." : ""}</p>
        <div className="flex gap-3 flex-wrap">
          <Link href="/tarot" className="retro-btn">🔮 Tarot</Link>
          <Link href="/about" className="retro-btn-outline">About</Link>
          <Link href="/contact" className="retro-btn-outline">Contact</Link>
        </div>
      </section>
    </main>
  );
}


