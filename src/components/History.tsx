"use client";
import { useEffect, useState } from "react";
import type { ReadingResponse } from "@/lib/api";
import { getHistory, removeHistory, clearHistory, type HistoryItem } from "@/lib/history";

export default function History({ onSelect }: { onSelect: (data: ReadingResponse)=>void }) {
  const [list, setList] = useState<HistoryItem[]>([]);
  useEffect(()=>{ setList(getHistory()); }, []);

  const handleRemove = (id: string) => { removeHistory(id); setList(getHistory()); };
  const handleClear = () => { clearHistory(); setList([]); };

  if (list.length === 0) return null;
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">History</h2>
        <button className="text-sm underline" onClick={handleClear}>전체 삭제</button>
      </div>
      <ul className="space-y-2">
        {list.map(item=> (
          <li key={item.id} className="flex items-center justify-between border rounded p-2">
            <button className="text-left" onClick={()=> onSelect(item.data)}>
              <div className="text-sm text-gray-500">{new Date(item.createdAt).toLocaleString()}</div>
              <div className="font-medium truncate max-w-[60ch]">{item.data.question}</div>
            </button>
            <button className="text-sm underline" onClick={()=>handleRemove(item.id)}>삭제</button>
          </li>
        ))}
      </ul>
    </section>
  );
}


