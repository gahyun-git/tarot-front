"use client";
import { useEffect, useState } from "react";
import type { GroupOrder, ReadingResponse } from "@/lib/api";
import GroupOrderPicker from "@/components/GroupOrderPicker";
import { useI18n } from "@/lib/i18n";
import { postReading, getDaily } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function ReadingForm({ onSuccess, onLoadingChange }: { onSuccess: (data: ReadingResponse) => void; onLoadingChange?: (v: boolean)=>void }) {
  const [question, setQuestion] = useState("");
  const [order, setOrder] = useState<["A","B","C"] | ["A","C","B"] | ["B","A","C"] | ["B","C","A"] | ["C","A","B"] | ["C","B","A"]>(["A","B","C"]);
  const [shuffleTimes, setShuffleTimes] = useState(3);
  const [seed] = useState<string>("");
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

  const router = useRouter();
  const [dailyLoading, setDailyLoading] = useState(false);
  const daily = async () => {
    setDailyLoading(true);
    setLoading(true); onLoadingChange?.(true); setError(null);
    try {
      const d: { id?: string; text?: string } = await getDaily({ lang: "auto", use_llm: false });
      if (d?.id) {
        try { router.prefetch(`/reading/${d.id}`); } catch {}
        await router.push(`/reading/${d.id}`);
      } else {
        alert(d?.text || "No content");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "request failed");
    } finally { setLoading(false); onLoadingChange?.(false); setDailyLoading(false); }
  };

  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [selectedSpread, setSelectedSpread] = useState<string | null>(null);
  // 마운트 후에만 텍스트/i18n 값 바인딩 → SSR/CSR 일치 보장
  useEffect(() => { setMounted(true); }, []);
  // 폼 진입 시 선택된 스프레드 적용(데모: eight 선택 시 draw8 그대로, daily는 상단 버튼에서 처리)
  useEffect(()=>{
    try {
      const s = localStorage.getItem('selected_spread');
      if (s) {
        if (s === 'daily') {
          // 폼 대신 상단 daily 버튼에서 처리 → 여기서는 특별히 변경 없음
        } else if (s === 'eight') {
          setShuffleTimes(3); // 그대로 유지하지만 확장을 대비
        }
        setSelectedSpread(s);
      }
      localStorage.removeItem('selected_spread');
    } catch {}
  }, []);
  return (
    <div className="grid gap-4">
      <label className="grid gap-1">
        <input className="space-input" value={question} onChange={(e)=>setQuestion(e.target.value)} placeholder={mounted ? t("form.placeholder.question") : ""} aria-invalid={question.trim().length===0} />
        {question.trim().length===0 && <span className="text-sm text-red-600" suppressHydrationWarning>{mounted ? t("form.validation.questionRequired") : ""}</span>}
      </label>
      <div className="grid gap-1">
        <span suppressHydrationWarning>{mounted ? t("form.groupOrder") : ""}</span>
        <GroupOrderPicker value={order} onChange={(v)=> setOrder(v as typeof order)} />
      </div>
      {selectedSpread && (
        <div className="text-xs text-gray-400 -mb-2" suppressHydrationWarning>
          {mounted ? t('form.selectedSpread') : ''}: {selectedSpread === 'daily' ? t('spread.daily') : t('spread.eight')}
        </div>
      )}
      <label className="inline-flex items-center gap-2" aria-describedby="help-reversed">
        <input type="checkbox" checked={allowReversed} onChange={(e)=>setAllowReversed(e.target.checked)} /> <span suppressHydrationWarning>{mounted ? t("form.reversed") : ""}</span>
      </label>
      <span id="help-reversed" className="text-xs text-gray-400 -mt-2" suppressHydrationWarning>{mounted ? t("form.help.reversed") : ""}</span>
      <div className="flex gap-3 items-center">
      <button className="space-btn w-40 disabled:opacity-50 inline-flex items-center justify-center gap-2" onClick={submit} disabled={loading || mutation.isPending || question.trim().length === 0}>
        {(loading || mutation.isPending) && (<span className="inline-block h-4 w-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />)}
        <span suppressHydrationWarning>{mounted ? (loading || mutation.isPending ? t("form.loading") : t("form.draw8")) : ""}</span>
      </button>
      </div>
      {dailyLoading && (
        <div className="space-progress mt-1" aria-live="polite">
          <div className="bar" style={{ width: '66%' }} />
        </div>
      )}
      {error && (
        <div className="text-red-600 flex items-center gap-2" role="alert" aria-live="assertive">
          <span>{error}</span>
          <button className="btn-outline text-sm" onClick={submit}>재시도</button>
        </div>
      )}
    </div>
  );
}
