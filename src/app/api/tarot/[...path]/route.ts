import { NextRequest, NextResponse } from "next/server";

const RESOLVED_BASE = (
  process.env.TAROT_API_BASE_URL ||
  process.env.UPSTREAM_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  ""
).replace(/\/$/, "");
const API_KEY = (process.env.TAROT_API_KEY || process.env.API_KEY || "").trim();
const HMAC_SECRET = (process.env.TAROT_HMAC_SECRET || process.env.HMAC_SECRET || "").trim();
const CLIENT_ID = (process.env.TAROT_CLIENT_ID || process.env.CLIENT_ID || "tarot-front").trim();

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
  try {
    const r = await fetch(url, { method: "GET" });
    return new NextResponse(r.body, { status: r.status, headers: r.headers });
  } catch (err) {
    return NextResponse.json(
      { error: { message: "Upstream fetch failed", detail: (err as Error)?.message } },
      { status: 502 }
    );
  }
}

async function forwardWithApiKey(req: NextRequest, targetPath: string) {
  if (!RESOLVED_BASE) {
    return NextResponse.json({ error: { message: "TAROT_API_BASE_URL not set (fallbacks UPSTREAM_API_BASE_URL / NEXT_PUBLIC_API_BASE_URL also empty)" } }, { status: 500 });
  }
  const url = `${RESOLVED_BASE}${targetPath}${req.nextUrl.search}`;
  const bodyText = ["GET", "HEAD"].includes(req.method) ? undefined : await req.text();
  try {
    const r = await fetch(url, {
      method: req.method,
      headers: {
        ...(bodyText ? { "content-type": "application/json" } : {}),
        "x-api-key": API_KEY,
      },
      body: bodyText,
    });
    return new NextResponse(r.body, { status: r.status, headers: r.headers });
  } catch (err) {
    return NextResponse.json(
      { error: { message: "Upstream fetch failed", detail: (err as Error)?.message } },
      { status: 502 }
    );
  }
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
  try {
    const r = await fetch(url, {
      method: req.method,
      headers: {
        "x-client-id": CLIENT_ID,
        "x-timestamp": ts,
        "x-signature": sig,
        ...(bodyText ? { "content-type": "application/json" } : {}),
      },
      body: ["GET", "HEAD"].includes(req.method) ? undefined : bodyText,
    });
    return new NextResponse(r.body, { status: r.status, headers: r.headers });
  } catch (err) {
    return NextResponse.json(
      { error: { message: "Upstream fetch failed", detail: (err as Error)?.message } },
      { status: 502 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetPath = buildTargetPath({ path });
  // /reading/:id/interpret 는 POST 전용
  if (/^\/reading\/[^/]+\/interpret$/.test(targetPath)) {
    return NextResponse.json(
      { error: { message: "이 엔드포인트는 POST 메서드만 지원합니다." } },
      { status: 405, headers: { Allow: "POST" } }
    );
  }
  // 로컬 목 결과 조회: /reading/local-daily/result → 간단 텍스트 반환
  if (targetPath === "/reading/local-daily/result") {
    return NextResponse.json({ text: "오늘의 카드", items: [] });
  }
  // 로컬 목 ID 처리: /reading/local-daily → 목 ReadingResponse 반환
  if (targetPath === "/reading/local-daily") {
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
      order: ["A", "B", "C"],
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
            reversed_meaning: [],
          },
        },
      ],
    };
    return NextResponse.json(mock);
  }
  // 개별 리딩 원본 조회 허용: GET /api/tarot/reading/{id}
  if (/^\/reading\/[^/]+$/.test(targetPath)) {
    return forwardGet(req, targetPath);
  }
  // 기본적으로 읽기 엔드포인트는 인증 없이 프록시
  return forwardGet(req, targetPath);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetPath = buildTargetPath({ path });
  if (!RESOLVED_BASE) return NextResponse.json({ error: { message: "TAROT_API_BASE_URL not set (fallbacks UPSTREAM_API_BASE_URL / NEXT_PUBLIC_API_BASE_URL also empty)" } }, { status: 500 });
  if (API_KEY) return forwardWithApiKey(req, targetPath);
  if (HMAC_SECRET) return forwardWithHmac(req, targetPath);
  // 인증 비활성화 시 단순 프록시 (개발용)
  const url = `${RESOLVED_BASE}${targetPath}${req.nextUrl.search}`;
  try {
    const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: await req.text() });
    return new NextResponse(r.body, { status: r.status, headers: r.headers });
  } catch (err) {
    return NextResponse.json(
      { error: { message: "Upstream fetch failed", detail: (err as Error)?.message } },
      { status: 502 }
    );
  }
}


