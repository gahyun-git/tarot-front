import { NextRequest } from "next/server";
export const runtime = 'edge';

const UPSTREAM = (process.env.UPSTREAM_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "").trim();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get('lang') || 'auto';
  if (UPSTREAM) {
    try {
      const url = `${UPSTREAM.replace(/\/$/, '')}/cards/${p.id}/meanings?lang=${encodeURIComponent(lang)}`;
      const r = await fetch(url);
      const body = await r.json().catch(()=> ({}));
      return Response.json(body, { status: r.status });
    } catch {
      return Response.json({ error: { code: 'upstream_unreachable' } }, { status: 502 });
    }
  }
  // Fallback: use local static meanings data (Edge runtime safe via fetch)
  try {
    const origin = new URL(req.url).origin;
    const r = await fetch(`${origin}/data/meanings.min.json`);
    const list = (await r.json().catch(()=> [])) as Array<{ id?: number; name?: string; upright?: string[]; reversed?: string[] }>;
    const targetId = Number(p.id);
    const found = list.find((x) => typeof x.id === 'number' && x.id === targetId) || null;
    if (!found) return Response.json({ id: targetId, lang, upright: [], reversed: [] });
    return Response.json({ id: targetId, lang, upright: found.upright || [], reversed: found.reversed || [] });
  } catch {
    return Response.json({ error: { code: 'local_meanings_unavailable' } }, { status: 500 });
  }
}


