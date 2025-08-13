import { NextRequest } from "next/server";
export const runtime = 'edge';

const UPSTREAM = (process.env.UPSTREAM_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "").trim();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const search = req.nextUrl.search;
  if (!UPSTREAM) return Response.json({ error: { message: "UPSTREAM not configured" } }, { status: 500 });
  const r = await fetch(`${UPSTREAM.replace(/\/$/, "")}/reading/${id}/result${search}`);
  const data = await r.json().catch(()=> ({}));
  return Response.json(data, { status: r.status });
}


