"use client";
import { useState } from "react";
import type { GroupOrder, ReadingResponse } from "@/lib/api";
import { postReading } from "@/lib/api";

export default function ReadingForm({ onSuccess }: { onSuccess: (data: ReadingResponse) => void }) {
  const [question, setQuestion] = useState("");
  const [order, setOrder] = useState<["A","B","C"] | ["A","C","B"] | ["B","A","C"] | ["B","C","A"] | ["C","A","B"] | ["C","B","A"]>(["A","B","C"]);
  const [shuffleTimes, setShuffleTimes] = useState(3);
  const [seed, setSeed] = useState<string>("");
  const [allowReversed, setAllowReversed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postReading({
        question,
        group_order: order as GroupOrder[],
        shuffle_times: shuffleTimes,
        seed: seed === "" ? null : Number(seed),
        allow_reversed: allowReversed,
      });
      onSuccess(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "request failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4">
      <label className="grid gap-1">
        <span>Question</span>
        <input className="border rounded px-3 py-2" value={question} onChange={(e)=>setQuestion(e.target.value)} placeholder="올해 커리어 방향?" />
      </label>
      <label className="grid gap-1">
        <span>Group Order</span>
        <select className="border rounded px-3 py-2" value={order.join("")}
          onChange={(e)=>{
            const v = e.target.value as "ABC"|"ACB"|"BAC"|"BCA"|"CAB"|"CBA";
            const map: Record<string, ["A","B","C"]|["A","C","B"]|["B","A","C"]|["B","C","A"]|["C","A","B"]|["C","B","A"]> = {
              ABC:["A","B","C"], ACB:["A","C","B"], BAC:["B","A","C"], BCA:["B","C","A"], CAB:["C","A","B"], CBA:["C","B","A"],
            };
            setOrder(map[v]);
          }}>
          {(["ABC","ACB","BAC","BCA","CAB","CBA"] as const).map(o=> <option key={o} value={o}>{o}</option>)}
        </select>
      </label>
      <label className="grid gap-1">
        <span>Shuffle Times</span>
        <input type="number" min={1} max={50} className="border rounded px-3 py-2 w-28" value={shuffleTimes} onChange={(e)=>setShuffleTimes(Number(e.target.value))} />
      </label>
      <label className="grid gap-1">
        <span>Seed (optional)</span>
        <input className="border rounded px-3 py-2 w-40" value={seed} onChange={(e)=>setSeed(e.target.value)} placeholder="e.g. 123" />
      </label>
      <label className="inline-flex items-center gap-2">
        <input type="checkbox" checked={allowReversed} onChange={(e)=>setAllowReversed(e.target.checked)} /> Allow Reversed
      </label>
      <button className="bg-black text-white rounded px-4 py-2 w-40 disabled:opacity-50" onClick={submit} disabled={loading || question.trim().length === 0}>
        {loading ? "Loading..." : "Draw 8 Cards"}
      </button>
      {error && <div className="text-red-600">{error}</div>}
    </div>
  );
}
