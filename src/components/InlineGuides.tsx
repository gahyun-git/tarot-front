"use client";
import { useEffect, useState } from "react";
import Markdown from "@/components/Markdown";
import { useI18n } from "@/lib/i18n";

type Guide = { id: string; title: string; path: (lang: string) => string };

const guides: Guide[] = [
  { id: "three-cards", title: "오늘의 카드", path: (l)=> `/content/${l}/spread/three-cards.md` },
  { id: "eight-positions", title: "고민 타로점", path: (l)=> `/content/${l}/spread/eight-positions.md` },
];

export default function InlineGuides() {
  const { locale, t } = useI18n();
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  useEffect(()=>{
    let on = true;
    (async () => {
      setLoading(true);
      const next: Record<string, string> = {};
      for (const g of guides) {
        try {
          const res = await fetch(g.path(locale));
          next[g.id] = res.ok ? await res.text() : "";
        } catch { next[g.id] = ""; }
      }
      if (on) { setTexts(next); setLoading(false); }
    })();
    return ()=>{ on = false; };
  }, [locale]);

  return (
    <section id="guides" className="space-panel p-6 space-y-4">
      <h2 className="text-xl font-bold mb-1">{t('spreads.title')}</h2>
      {loading && <div className="text-sm opacity-70">Loading…</div>}
      {!loading && guides.map(g => (
        <details key={g.id} className="accordion" open>
          <summary>
            <div className="flex items-center justify-between">
              <span>{g.id === 'three-cards' ? t('spread.daily') : t('spread.eight')}</span>
            </div>
          </summary>
          <div className="accordion-content">
            {texts[g.id] ? <Markdown text={texts[g.id]} /> : <div className="text-sm opacity-70">No content</div>}
          </div>
        </details>
      ))}
    </section>
  );
}


