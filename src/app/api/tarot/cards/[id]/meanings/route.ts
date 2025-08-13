import { NextRequest } from "next/server";
export const runtime = 'edge';

const UPSTREAM = (process.env.UPSTREAM_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "").trim();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get('lang') || 'auto';
  if (UPSTREAM) {
    try {
      const url = `${UPSTREAM.replace(/\/$/, '')}/cards/${params.id}/meanings?lang=${encodeURIComponent(lang)}`;
      const r = await fetch(url);
      const body = await r.json().catch(()=> ({}));
      return Response.json(body, { status: r.status });
    } catch {
      return Response.json({ error: { code: 'upstream_unreachable' } }, { status: 502 });
    }
  }
  return Response.json({ id: Number(params.id), lang, upright: ["sample"], reversed: ["sample"] });
}


