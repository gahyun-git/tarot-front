"use client";
import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8008";

type ReadingItem = {
  position: number;
  is_reversed: boolean;
  card: { id: number; name: string; arcana: string; suit?: string | null; image_url?: string | null };
};

export default function Home() {
  const [question, setQuestion] = useState("");
  const [order, setOrder] = useState<["A","B","C"] | ["A","C","B"] | ["B","A","C"] | ["B","C","A"] | ["C","A","B"] | ["C","B","A"]>(["A","B","C"]);
  const [shuffleTimes, setShuffleTimes] = useState(3);
  const [seed, setSeed] = useState<string>("");
  const [allowReversed, setAllowReversed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ items: ReadingItem[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await fetch(`${API_BASE}/reading/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          group_order: order,
          shuffle_times: shuffleTimes,
          seed: seed === "" ? null : Number(seed),
          allow_reversed: allowReversed,
        }),
      });
      const body = await r.json();
      if (!r.ok) throw new Error(body?.error?.message || "request failed");
      setResult(body);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "request failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Tarot Reading</h1>
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
        <button className="bg-black text-white rounded px-4 py-2 w-40" onClick={submit} disabled={loading}>
          {loading ? "Loading..." : "Draw 8 Cards"}
        </button>
      </div>

      {error && <div className="text-red-600">{error}</div>}

      {result && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {result.items.map((it)=> (
            <div key={it.position} className="border rounded p-2">
              <div className="text-sm text-gray-500">#{it.position} {it.is_reversed ? "(Reversed)" : ""}</div>
              <div className="font-medium">{it.card.name}</div>
              {it.card.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.card.image_url} alt={it.card.name} className={`mt-2 w-full ${it.is_reversed ? "rotate-180" : ""}`} />
              )}
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
