"use client";
import { useEffect, useState } from "react";
import { getDaily, getSpreads } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

type Spread = { id: string; name: string; count: number };

export default function SpreadPicker() {
  const { t, locale } = useI18n();
  const [items, setItems] = useState<Spread[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => { (async () => {
    try {
      const r = await getSpreads() as { spreads?: Spread[] };
      setItems(Array.isArray(r?.spreads) ? r.spreads : []);
    } catch { setItems([]); }
  })(); }, []);

  const runDaily = async () => {
    setLoading(true);
    try {
      const d = await getDaily({ lang: locale, use_llm: false });
      if (d?.id) window.location.href = `/reading/${d.id}`;
    } finally { setLoading(false); }
  };

  const goForm = () => {
    document.querySelector('#form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!items.length) return null;
  return (
    <section className="space-panel p-6">
      <h2 className="text-lg font-bold mb-2">{t('spreads.title')}</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((s) => (
          <li key={s.id} className="space-card flex items-center justify-between gap-3">
            <div className="flex items-center gap-2"><span className="space-chip">{s.count}</span><span>{s.name}</span></div>
            <div className="flex items-center gap-2">
              <Link className="space-btn-ghost" href={`/content?lang=${locale}`}>{t('btn.guide')}</Link>
              {s.id === 'daily' ? (
                <button className="space-btn" onClick={runDaily} disabled={loading}>{t('daily.button')}</button>
              ) : (
                <button className="space-btn" onClick={goForm}>{t('btn.use')}</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}


