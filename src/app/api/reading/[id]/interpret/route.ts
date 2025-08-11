import { NextRequest } from "next/server";
export const runtime = 'edge';

function toHex(input: ArrayBuffer | Uint8Array): string {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i].toString(16);
    out += b.length === 1 ? '0' + b : b;
  }
  return out;
}

const UPSTREAM = (process.env.UPSTREAM_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "").trim();

export async function POST(req: NextRequest, context: unknown) {
  const { params } = context as { params: { id: string } };
  if (!UPSTREAM) return Response.json({ error: { message: "UPSTREAM not configured" } }, { status: 500 });
  const body = await req.json().catch(()=> ({}));
  const bodyString = JSON.stringify(body);
  const maxBytes = Number(process.env.MAX_BODY_BYTES || 0);
  if (maxBytes && new TextEncoder().encode(bodyString).length > maxBytes) {
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
    const enc = new TextEncoder();
    const bodyHashBuf = await crypto.subtle.digest('SHA-256', enc.encode(bodyString));
    const bodyHash = toHex(bodyHashBuf);
    const base = `${method}\n${path}\n${ts}\n${bodyHash}`;
    const key = await crypto.subtle.importKey('raw', enc.encode(hmacSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(base));
    const sig = toHex(sigBuf);
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


