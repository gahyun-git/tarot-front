"use client";
import { useEffect, useState } from "react";
import { decompressFromEncodedURIComponent } from "lz-string";
import ReadingForm from "@/components/ReadingForm";
import ReadingResult from "@/components/ReadingResult";
import ReadingResultSkeleton from "@/components/ReadingResultSkeleton";
import History from "@/components/History";
import type { ReadingResponse } from "@/lib/api";

export default function Home() {
  const [result, setResult] = useState<ReadingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const m = hash.match(/#reading=(.+)$/);
    if (m && m[1]) {
      try {
        const json = decompressFromEncodedURIComponent(m[1]);
        const obj = JSON.parse(json) as ReadingResponse;
        if (obj && obj.items && Array.isArray(obj.items)) setResult(obj);
      } catch {
        // ignore parse errors
      }
    }
  }, []);
  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6 pb-40">
      <h1 className="text-2xl font-bold">Tarot Reading</h1>
      <ReadingForm onSuccess={(d)=>{ setResult(d); try { import("@/lib/history").then(m=> m.addToHistory(d)); } catch {} }} onLoadingChange={setLoading} />
      {loading && <ReadingResultSkeleton />}
      {!loading && result && <ReadingResult data={result} />}
      {!loading && <History onSelect={setResult} />}
    </main>
  );
}
