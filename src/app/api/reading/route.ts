import { NextRequest } from "next/server";
import { createHmac, createHash } from "node:crypto";

const UPSTREAM = (process.env.UPSTREAM_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "").trim();

type GroupOrder = "A" | "B" | "C";

export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => null) as {
    question: string;
    group_order: GroupOrder[];
    shuffle_times: number;
    seed: number | null;
    allow_reversed: boolean;
  } | null;

  if (!payload) {
    return Response.json({ error: { code: "validation_error", message: "invalid body" } }, { status: 400 });
  }

  if (UPSTREAM) {
    try {
      const bodyString = JSON.stringify(payload);
      // Optional pre-check against backend limit to fail fast on client proxy
      const maxBytes = Number(process.env.MAX_BODY_BYTES || 0);
      if (maxBytes && Buffer.byteLength(bodyString, "utf8") > maxBytes) {
        return Response.json({ error: { code: "payload_too_large", message: "요청 바디가 너무 큽니다." } }, { status: 413 });
      }

      const upstreamBase = UPSTREAM.replace(/\/$/, "");
      const method = "POST";
      const path = "/reading"; // NOTE: signature path without trailing slash
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
      const body = await r.json();
      return Response.json(body, { status: r.status });
    } catch (e) {
      return Response.json({ error: { code: "upstream_unreachable", message: "백엔드 연결 실패" } }, { status: 502 });
    }
  }

  // Mock response for local dev when no upstream is configured
  const seed = typeof payload.seed === "number" ? payload.seed : 42;
  const rng = mulberry32(seed);
  const pickReversed = () => payload.allow_reversed && rng() < 0.35;
  const image = (i: number) =>
    `https://raw.githubusercontent.com/vercel/next.js/canary/examples/image-component/public/vercel.png`;

  const items = Array.from({ length: 8 }).map((_, idx) => ({
    position: idx + 1,
    is_reversed: pickReversed(),
    card: {
      id: idx + 1,
      name: `Mock Card ${idx + 1}`,
      arcana: idx < 22 ? "major" : "minor",
      suit: null,
      image_url: image(idx + 1),
    },
  }));

  return Response.json({
    question: payload.question,
    order: payload.group_order,
    count: 8,
    items,
  });
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}


