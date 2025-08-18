"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ReadingResult from "@/components/ReadingResult";
import type { ReadingResponse } from "@/lib/api";
import { addToHistory, getHistoryById } from "@/lib/history";
import { getReadingById } from "@/lib/api";

export default function ReadingDetail() {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || "";
  const [data, setData] = useState<ReadingResponse | null>(null);

  useEffect(()=>{
    (async () => {
      if (!id) { router.replace("/"); return; }
      const item = getHistoryById(id);
      if (item) { setData(item.data); return; }
      try {
        const r = await getReadingById(id);
        setData(r);
        const newLocalId = addToHistory(r);
        if (newLocalId && newLocalId !== id) router.replace(`/reading/${newLocalId}`);
      } catch {
        router.replace("/");
      }
    })();
  }, [id, router]);

  if (!data) return null;
  return (
    <main className="p-6 max-w-5xl mx-auto">
      <ReadingResult data={data} />
    </main>
  );
}


