import { notFound } from "next/navigation";
import ReadingResult from "@/components/ReadingResult";
import type { ReadingResponse } from "@/lib/api";
type Card = { id: number; name: string; arcana: string; image_url?: string | null; upright_meaning?: string[] | null; reversed_meaning?: string[] | null };
type CardWithContext = { position: number; role: string; is_reversed: boolean; used_meanings?: string[] | null; card: Card; llm_detail?: string | null };
type FullReadingResult = {
  id: string; question: string; lang: string;
  items: CardWithContext[]; summary: string; advices: string[]; llm_used: boolean;
  sections?: Record<string, { card: string; orientation: string; analysis: string }>;
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api.go4it.site";

const isUuid = (v: string) =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(v);

async function getData(key: string): Promise<FullReadingResult | null> {
  // 1) 슬러그 시도
  try {
    const r = await fetch(`${API}/reading/s/${encodeURIComponent(key)}/result?use_llm=false`, { cache: "no-store" });
    if (r.ok) return (await r.json()) as FullReadingResult;
  } catch {}
  // 2) UUID 폴백
  if (isUuid(key)) {
    try {
      const r2 = await fetch(`${API}/reading/${key}/result?use_llm=false`, { cache: "no-store" });
      if (r2.ok) return (await r2.json()) as FullReadingResult;
    } catch {}
  }
  return null;
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data) return notFound();
  const mapped: ReadingResponse = {
    id: data.id,
    question: data.question,
    order: ["A","B","C"],
    count: data.items?.length || 0,
    items: (data.items || []).map((it)=>({
      position: it.position,
      is_reversed: it.is_reversed,
      card: {
        id: it.card?.id as number,
        name: it.card?.name as string,
        arcana: it.card?.arcana as string,
        suit: null,
        image_url: it.card?.image_url || null,
        upright_meaning: it.card?.upright_meaning ?? null,
        reversed_meaning: it.card?.reversed_meaning ?? null,
      },
    }))
  };
  return (
    <main className="p-6 max-w-5xl mx-auto">
      <ReadingResult data={mapped} />
    </main>
  );
}


