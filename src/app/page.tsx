"use client";
import { useState } from "react";
import ReadingForm from "@/components/ReadingForm";
import ReadingResult from "@/components/ReadingResult";
import type { ReadingResponse } from "@/lib/api";

export default function Home() {
  const [result, setResult] = useState<ReadingResponse | null>(null);
  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Tarot Reading</h1>
      <ReadingForm onSuccess={setResult} />
      {result && <ReadingResult data={result} />}
    </main>
  );
}
