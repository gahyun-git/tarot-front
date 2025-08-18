"use client";
import { useEffect, useState } from "react";
import type { ReadingResponse } from "@/lib/api";
import { getHistory, removeHistory, clearHistory, type HistoryItem } from "@/lib/history";
import { useI18n } from "@/lib/i18n";

export default function History({ onSelect }: { onSelect?: (data: ReadingResponse)=>void }) {
  const [list, setList] = useState<HistoryItem[]>([]);
  useEffect(()=>{
    setList(getHistory());
    const onChange = () => setList(getHistory());
    window.addEventListener("reading-history-updated", onChange);
    return () => window.removeEventListener("reading-history-updated", onChange);
  }, []);

  const handleRemove = (id: string) => { removeHistory(id); setList(getHistory()); };
  const handleClear = () => { clearHistory(); setList([]); };

  const { t } = useI18n();
  if (list.length === 0) return null;
  return (
    <section className="space-panel p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold space-title">{t("history.title")}</h2>
        <button className="text-sm underline" onClick={handleClear}>{t("history.clearAll")}</button>
      </div>
      <ul className="space-y-2">
        {list.map(item=> (
          <li key={item.id} className="flex items-center justify-between space-card">
            <button className="flex-1 text-left p-3 min-w-0" onClick={()=> { try { window.location.href = `/reading/local/${item.id}`; } catch { onSelect?.(item.data); } }}>
              <div className="text-sm opacity-70 whitespace-nowrap overflow-hidden text-ellipsis">{new Date(item.createdAt).toLocaleString(undefined, { hour12: false })}</div>
              <div className="font-medium truncate max-w-full">
                {item.data?.question?.trim()?.length ? item.data.question : (item.data.count === 1 ? t('spread.daily') : t('spread.eight'))}
              </div>
            </button>
            <button className="text-sm underline px-3 shrink-0" onClick={()=>handleRemove(item.id)}>{t("history.delete")}</button>
          </li>
        ))}
      </ul>
    </section>
  );
}


