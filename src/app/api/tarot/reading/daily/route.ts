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

  // local mock
  return Response.json({ id: "local-daily", text: "오늘의 카드: The Sun — 좋은 에너지가 함께합니다." });
}


