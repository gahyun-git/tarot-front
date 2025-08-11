"use client";
import { useState } from "react";
import type { GroupOrder, ReadingResponse } from "@/lib/api";
import { postReading } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export default function ReadingForm({ onSuccess, onLoadingChange }: { onSuccess: (data: ReadingResponse) => void; onLoadingChange?: (v: boolean)=>void }) {
  const [question, setQuestion] = useState("");
  const [order, setOrder] = useState<["A","B","C"] | ["A","C","B"] | ["B","A","C"] | ["B","C","A"] | ["C","A","B"] | ["C","B","A"]>(["A","B","C"]);
  const [shuffleTimes, setShuffleTimes] = useState(3);
  const [seed, setSeed] = useState<string>("");
  const [allowReversed, setAllowReversed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (vars: {
      question: string;
      group_order: GroupOrder[];
      shuffle_times: number;
      seed: number | null;
      allow_reversed: boolean;
    }) => postReading(vars),
    onSuccess: (data) => onSuccess(data),
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "request failed";
      setError(message);
    },
    onSettled: () => { setLoading(false); onLoadingChange?.(false); },
  });

  const submit = async () => {
    if (question.trim().length===0) return;
    setLoading(true);
    onLoadingChange?.(true);
    setError(null);
    mutation.mutate({
      question,
      group_order: order as GroupOrder[],
      shuffle_times: shuffleTimes,
      seed: seed === "" ? null : Number(seed),
      allow_reversed: allowReversed,
    });
  };

  return (
    <div className="grid gap-4">
      <label className="grid gap-1">
        <span>Question</span>
        <input className="input" value={question} onChange={(e)=>setQuestion(e.target.value)} placeholder="올해 커리어 방향?" aria-invalid={question.trim().length===0} />
        {question.trim().length===0 && <span className="text-sm text-red-600">질문을 입력해 주세요.</span>}
      </label>
      <label className="grid gap-1">
        <span>Group Order</span>
        <select className="input" value={order.join("")}
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
        <input type="number" min={1} max={50} className="input w-28" value={shuffleTimes} onChange={(e)=>setShuffleTimes(Number(e.target.value))} />
      </label>
      <label className="grid gap-1">
        <span>Seed (optional)</span>
        <input className="input w-40" value={seed} onChange={(e)=>setSeed(e.target.value)} placeholder="e.g. 123" />
      </label>
      <label className="inline-flex items-center gap-2">
        <input type="checkbox" checked={allowReversed} onChange={(e)=>setAllowReversed(e.target.checked)} /> Allow Reversed
      </label>
      <button className="btn w-40 disabled:opacity-50 inline-flex items-center justify-center gap-2" onClick={submit} disabled={loading || mutation.isPending || question.trim().length === 0}>
        {(loading || mutation.isPending) && (<span className="inline-block h-4 w-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />)}
        <span>{loading || mutation.isPending ? "Loading..." : "Draw 8 Cards"}</span>
      </button>
      {error && (
        <div className="text-red-600 flex items-center gap-2" role="alert" aria-live="assertive">
          <span>{error}</span>
          <button className="btn-outline text-sm" onClick={submit}>재시도</button>
        </div>
      )}
    </div>
  );
}
