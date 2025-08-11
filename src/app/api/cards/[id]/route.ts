import { NextRequest } from "next/server";
export const runtime = 'edge';

const UPSTREAM = (process.env.UPSTREAM_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "").trim();

export async function GET(_req: NextRequest, context: unknown) {
  const { params } = context as { params: { id: string } };
  if (!UPSTREAM) return Response.json({ error: { message: "UPSTREAM not configured" } }, { status: 500 });
  const url = `${UPSTREAM.replace(/\/$/, "")}/cards/${params.id}`;
  const r = await fetch(url);
  const body = await r.json();
  return Response.json(body, { status: r.status });
}


