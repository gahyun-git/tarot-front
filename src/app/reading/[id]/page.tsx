"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ReadingResult from "@/components/ReadingResult";
import type { ReadingResponse } from "@/lib/api";
import { getHistoryById } from "@/lib/history";

export default function ReadingDetail() {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || "";
  const [data, setData] = useState<ReadingResponse | null>(null);

  useEffect(()=>{
    const item = id ? getHistoryById(id) : null;
    if (!item) { router.replace("/"); return; }
    setData(item.data);
  }, [id, router]);

  if (!data) return null;
  return (
    <main className="p-6 max-w-5xl mx-auto">
      <ReadingResult data={data} />
    </main>
  );
}


