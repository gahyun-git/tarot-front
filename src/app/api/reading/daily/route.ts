import { NextRequest } from "next/server";
export const runtime = 'edge';

const UPSTREAM = (process.env.UPSTREAM_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "").trim();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get('lang') || 'auto';
  const use_llm = searchParams.get('use_llm') || 'false';

  if (UPSTREAM) {
    try {
      const upstreamBase = UPSTREAM.replace(/\/$/, "");
      const path = `/reading/daily`;
      const url = `${upstreamBase}${path}?lang=${encodeURIComponent(lang)}&use_llm=${encodeURIComponent(use_llm)}`;
      const headers: Record<string, string> = {};
      const apiKey = (process.env.API_KEY || "").trim();
      if (apiKey) headers["X-API-Key"] = apiKey;
      const r = await fetch(url, { headers });
      const body = await r.json().catch(()=> ({}));
      return Response.json(body, { status: r.status });
    } catch {
      return Response.json({ error: { code: "upstream_unreachable", message: "백엔드 연결 실패" } }, { status: 502 });
    }
  }

  // local mock: 랜덤 카드 한 장 반환
  const pool = [
    { id: 0, name: "The Fool" }, { id: 1, name: "The Magician" }, { id: 2, name: "The High Priestess" },
    { id: 3, name: "The Empress" }, { id: 4, name: "The Emperor" }, { id: 5, name: "The Hierophant" },
    { id: 6, name: "The Lovers" }, { id: 7, name: "The Chariot" }, { id: 8, name: "Strength" },
    { id: 9, name: "The Hermit" }, { id: 10, name: "Wheel of Fortune" }, { id: 11, name: "Justice" },
    { id: 12, name: "The Hanged Man" }, { id: 13, name: "Death" }, { id: 14, name: "Temperance" },
    { id: 15, name: "The Devil" }, { id: 16, name: "The Tower" }, { id: 17, name: "The Star" },
    { id: 18, name: "The Moon" }, { id: 19, name: "The Sun" }, { id: 20, name: "Judgement" }, { id: 21, name: "The World" }
  ];
  const pick = pool[Math.floor(Math.random()*pool.length)];
  const mock = {
    id: `local-daily-${Date.now()}`,
    question: "오늘의 카드",
    order: ["A","B","C"],
    count: 1,
    items: [
      {
        position: 1,
        is_reversed: Math.random() < 0.5,
        card: {
          id: pick.id,
          name: pick.name,
          arcana: "Major",
          suit: null,
          image_url: null,
          upright_meaning: [],
          reversed_meaning: []
        }
      }
    ]
  };
  return Response.json(mock);
}


