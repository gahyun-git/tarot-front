"use client";
import { useEffect, useState } from "react";
import { getDaily, getSpreads } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

type Spread = { id: string; name: string; count: number };

export default function SpreadPicker() {
  const { t, locale } = useI18n();
  const [items, setItems] = useState<Spread[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => { (async () => {
    try {
      const r = await getSpreads() as { items?: Array<{ code?: string; name?: string; positions?: Record<number,string> }>; spreads?: Spread[] };
      // 백엔드 표준 응답 { items: [...] }
      if (Array.isArray(r?.items)) {
        const mapped: Spread[] = r.items.map((it)=> ({ id: (it.code || "8-basic"), name: (it.name || "Spread"), count: (it.positions ? Object.keys(it.positions).length : 8) }));
        setItems(mapped);
        return;
      }
      // 구형/임시 응답 { spreads: [...] }
      if (Array.isArray((r as { spreads?: Spread[] }).spreads)) {
        setItems(((r as { spreads?: Spread[] }).spreads) as Spread[]);
        return;
      }
      // 폴백: 정적 목록
      setItems([{ id: "daily", name: "Daily", count: 1 }, { id: "8-basic", name: "Eight Positions", count: 8 }]);
    } catch {
      setItems([{ id: "daily", name: "Daily", count: 1 }, { id: "8-basic", name: "Eight Positions", count: 8 }]);
    }
  })(); }, []);

  const runDaily = async () => {
    setLoading(true);
    try {
      const d = await getDaily({ lang: locale, use_llm: false });
      console.log('Daily response:', d);
      if (d?.id) {
        console.log('Redirecting to:', `/reading/${d.id}`);
        window.location.href = `/reading/${d.id}`;
      } else {
        console.error('No id in daily response');
      }
    } catch (e) {
      console.error('Daily error:', e);
    } finally { 
      setLoading(false); 
    }
  };

  const goForm = (id: string) => {
    try { localStorage.setItem('selected_spread', id); } catch {}
    document.querySelector('#form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!items.length) return null;
  return (
    <section className="space-panel p-6">
      <h2 className="text-lg font-bold mb-2">{t('spreads.title')}</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((s) => (
          <li key={s.id} className="space-card flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate">{s.id === 'daily' ? t('spread.daily') : t('spread.eight')}</span>
            </div>
            <div className="flex items-center gap-2">
              
              {s.id === 'daily' ? (
                <button className="space-btn" onClick={runDaily} disabled={loading}>{t('btn.use')}</button>
              ) : (
                <button className="space-btn" onClick={()=>goForm(s.id)}>{t('btn.use')}</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}


