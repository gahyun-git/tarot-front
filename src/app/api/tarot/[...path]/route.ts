import { NextRequest, NextResponse } from "next/server";

const RESOLVED_BASE = (
  process.env.TAROT_API_BASE_URL ||
  process.env.UPSTREAM_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  ""
).replace(/\/$/, "");
const API_KEY = (process.env.TAROT_API_KEY || "").trim();
const HMAC_SECRET = (process.env.TAROT_HMAC_SECRET || "").trim();
const CLIENT_ID = (process.env.TAROT_CLIENT_ID || "tarot-front").trim();

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

function buildTargetPath(params: { path: string[] }) {
  const joined = `/${params.path.join("/")}`;
  return joined;
}

async function forwardGet(req: NextRequest, targetPath: string) {
  if (!RESOLVED_BASE) {
    return NextResponse.json({ error: { message: "TAROT_API_BASE_URL not set (fallbacks UPSTREAM_API_BASE_URL / NEXT_PUBLIC_API_BASE_URL also empty)" } }, { status: 500 });
  }
  const url = `${RESOLVED_BASE}${targetPath}${req.nextUrl.search}`;
  const r = await fetch(url, { method: "GET", headers: { "content-type": "application/json" } });
  return new NextResponse(r.body, { status: r.status, headers: r.headers });
}

async function forwardWithApiKey(req: NextRequest, targetPath: string) {
  if (!RESOLVED_BASE) {
    return NextResponse.json({ error: { message: "TAROT_API_BASE_URL not set (fallbacks UPSTREAM_API_BASE_URL / NEXT_PUBLIC_API_BASE_URL also empty)" } }, { status: 500 });
  }
  const url = `${RESOLVED_BASE}${targetPath}${req.nextUrl.search}`;
  const bodyText = ["GET", "HEAD"].includes(req.method) ? undefined : await req.text();
  const r = await fetch(url, {
    method: req.method,
    headers: {
      "content-type": "application/json",
      "x-api-key": API_KEY,
    },
    body: bodyText,
  });
  return new NextResponse(r.body, { status: r.status, headers: r.headers });
}

async function forwardWithHmac(req: NextRequest, targetPath: string) {
  const bodyText = ["GET", "HEAD"].includes(req.method) ? "" : await req.text();
  const ts = Date.now().toString();
  const enc = new TextEncoder();
  const bodyHashBuf = await crypto.subtle.digest("SHA-256", enc.encode(bodyText));
  const bodyHash = toHex(bodyHashBuf);
  const base = `${req.method}\n${targetPath}\n${ts}\n${bodyHash}`;
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(HMAC_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(base));
  const sig = toHex(sigBuf);
  const url = `${RESOLVED_BASE}${targetPath}${req.nextUrl.search}`;
  const r = await fetch(url, {
    method: req.method,
    headers: {
      "content-type": "application/json",
      "x-client-id": CLIENT_ID,
      "x-timestamp": ts,
      "x-signature": sig,
    },
    body: ["GET", "HEAD"].includes(req.method) ? undefined : bodyText,
  });
  return new NextResponse(r.body, { status: r.status, headers: r.headers });
}

export async function GET(req: NextRequest, context: unknown) {
  const { params } = context as { params: { path: string[] } };
  const targetPath = buildTargetPath(params);
  // 기본적으로 읽기 엔드포인트는 인증 없이 프록시
  return forwardGet(req, targetPath);
}

export async function POST(req: NextRequest, context: unknown) {
  const { params } = context as { params: { path: string[] } };
  const targetPath = buildTargetPath(params);
  if (!RESOLVED_BASE) return NextResponse.json({ error: { message: "TAROT_API_BASE_URL not set (fallbacks UPSTREAM_API_BASE_URL / NEXT_PUBLIC_API_BASE_URL also empty)" } }, { status: 500 });
  if (API_KEY) return forwardWithApiKey(req, targetPath);
  if (HMAC_SECRET) return forwardWithHmac(req, targetPath);
  // 인증 비활성화 시 단순 프록시 (개발용)
  const url = `${RESOLVED_BASE}${targetPath}${req.nextUrl.search}`;
  const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: await req.text() });
  return new NextResponse(r.body, { status: r.status, headers: r.headers });
}


