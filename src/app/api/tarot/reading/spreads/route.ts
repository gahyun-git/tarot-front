export const runtime = 'edge';

const UPSTREAM = (process.env.UPSTREAM_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "").trim();

export async function GET() {
  if (UPSTREAM) {
    try {
      const r = await fetch(`${UPSTREAM.replace(/\/$/, '')}/reading/spreads`);
      const body = await r.json().catch(()=> ({}));
      return Response.json(body, { status: r.status });
    } catch {
      return Response.json({ error: { code: 'upstream_unreachable' } }, { status: 502 });
    }
  }
  return Response.json({
    spreads: [
      { id: 'daily', name: 'Daily One Card', count: 1 },
      { id: 'eight', name: '고민 타로점', count: 8 }
    ]
  });
}


