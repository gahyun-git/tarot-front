import { NextRequest } from "next/server";
import { createHmac, createHash } from "node:crypto";

const UPSTREAM = (process.env.UPSTREAM_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "").trim();

export async function POST(req: NextRequest, context: unknown) {
  const { params } = context as { params: { id: string } };
  if (!UPSTREAM) return Response.json({ error: { message: "UPSTREAM not configured" } }, { status: 500 });
  const body = await req.json().catch(()=> ({}));
  const bodyString = JSON.stringify(body);
  const maxBytes = Number(process.env.MAX_BODY_BYTES || 0);
  if (maxBytes && Buffer.byteLength(bodyString, "utf8") > maxBytes) {
    return Response.json({ error: { code: "payload_too_large", message: "요청 바디가 너무 큽니다." } }, { status: 413 });
  }

  const upstreamBase = UPSTREAM.replace(/\/$/, "");
  const method = "POST";
  const path = `/reading/${params.id}/interpret`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const apiKey = (process.env.API_KEY || "").trim();
  const hmacSecret = (process.env.HMAC_SECRET || "").trim();
  if (apiKey) {
    headers["X-API-Key"] = apiKey;
  } else if (hmacSecret) {
    const ts = Date.now().toString();
    const bodyHash = createHash("sha256").update(bodyString).digest("hex");
    const base = `${method}\n${path}\n${ts}\n${bodyHash}`;
    const sig = createHmac("sha256", hmacSecret).update(base).digest("hex");
    headers["X-Client-Id"] = process.env.CLIENT_ID || "tarot-front";
    headers["X-Timestamp"] = ts;
    headers["X-Signature"] = sig;
  }

  const r = await fetch(`${upstreamBase}${path}`, {
    method,
    headers,
    body: bodyString,
  });
  const data = await r.json().catch(()=> ({}));
  return Response.json(data, { status: r.status });
}


