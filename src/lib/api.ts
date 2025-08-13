export type GroupOrder = "A" | "B" | "C";
export type ReadingItem = {
  position: number;
  is_reversed: boolean;
  card: {
    id: number;
    name: string;
    arcana: string;
    suit?: string | null;
    image_url?: string | null;
    upright_meaning?: string[] | null;
    reversed_meaning?: string[] | null;
  };
};

export type ReadingResponse = {
  question: string;
  order: GroupOrder[];
  count: number;
  items: ReadingItem[];
  id?: string | null;
};

// 브라우저에서는 내부 프록시 경로만 사용하여 비밀값 노출 방지
const API_BASE = "/api/tarot";

type ErrorBody = { error?: { code?: string; message?: string } };
function isErrorBody(v: unknown): v is ErrorBody {
  return typeof v === "object" && v !== null && Object.prototype.hasOwnProperty.call(v, "error");
}
function localizeError(body: unknown): string {
  const b: ErrorBody | null = isErrorBody(body) ? (body as ErrorBody) : null;
  const code = b?.error?.code;
  if (code === "validation_error") return "입력값을 확인해 주세요.";
  if (code === "rate_limit_exceeded") return "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
  return b?.error?.message || "요청 처리에 실패했습니다.";
}

export async function postReading(params: {
  question: string;
  group_order: GroupOrder[];
  shuffle_times: number;
  seed: number | null;
  allow_reversed: boolean;
}): Promise<ReadingResponse> {
  const endpoint = `${API_BASE.replace(/\/$/, "")}/reading`;
  let r: Response;
  // 인증 헤더 구성(API Key 또는 HMAC) - 브라우저 직접 호출 시 보안상 노출되므로 서버 프록시(/api/reading)를 권장
  const headers: Record<string,string> = { "Content-Type": "application/json" };
  try {
    r = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(params),
    });
  } catch {
    throw new Error("서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
  }
  const body = await r.json().catch(()=> ({}));
  if (!r.ok) throw new Error(localizeError(body));
  return body as ReadingResponse;
}

export async function getCard(id: number) {
  const endpoint = `${API_BASE.replace(/\/$/, "")}/cards/${id}`;
  const r = await fetch(endpoint, { method: "GET" });
  if (!r.ok) throw new Error("카드 정보를 불러오지 못했습니다.");
  return r.json() as Promise<{
    id: number; name: string; arcana: string; suit?: string | null; image_url?: string | null; upright_meaning?: string[] | null; reversed_meaning?: string[] | null;
  }>;
}

export type InterpretResponse = { text?: string } & Record<string, unknown>;
export async function postInterpretReading(
  readingId: string,
  body: { lang?: string; style?: string; use_llm?: boolean }
): Promise<InterpretResponse> {
  const base = API_BASE.replace(/\/$/, "");
  const path = `/reading/${readingId}/interpret`;
  const url = `${base}${path}`;
  // 429 지수 백오프 재시도 (최대 3회)
  const tryFetch = async (attempt: number): Promise<Response> => {
    const payload = {
      lang: body.lang ?? 'auto',
      style: body.style ?? 'concise',
      use_llm: typeof body.use_llm === 'boolean' ? body.use_llm : false,
    };
    const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
  });
    if (r.status === 429 && attempt < 3) {
      const wait = 500 * Math.pow(2, attempt);
      await new Promise((res)=> setTimeout(res, wait));
      return tryFetch(attempt + 1);
    }
    return r;
  };
  const r = await tryFetch(0);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((data as ErrorBody)?.error?.message || `${r.status} ${r.statusText}`);
  return data as InterpretResponse;
}

export type ReadingResultText = { text?: string } & Record<string, unknown>;
export async function getReadingResult(
  readingId: string,
  params: { lang?: string; use_llm?: boolean } = {}
): Promise<ReadingResultText> {
  const search = new URLSearchParams();
  if (params.lang) search.set("lang", params.lang);
  if (typeof params.use_llm === "boolean") search.set("use_llm", String(params.use_llm));
  const q = search.toString();
  const base = API_BASE.replace(/\/$/, "");
  const path = `/reading/${readingId}/result`;
  const url = `${base}${path}${q ? `?${q}` : ""}`;
  const tryFetch = async (attempt: number): Promise<Response> => {
    const r = await fetch(url);
    if (r.status === 429 && attempt < 3) {
      const wait = 500 * Math.pow(2, attempt);
      await new Promise((res)=> setTimeout(res, wait));
      return tryFetch(attempt + 1);
    }
    return r;
  };
  const r = await tryFetch(0);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((data as ErrorBody)?.error?.message || `${r.status} ${r.statusText}`);
  return data as ReadingResultText;
}

export async function getDaily(params: { lang?: string; use_llm?: boolean } = {}) {
  const search = new URLSearchParams();
  if (params.lang) search.set("lang", params.lang);
  if (typeof params.use_llm === "boolean") search.set("use_llm", String(params.use_llm));
  const q = search.toString();
  const base = API_BASE.replace(/\/$/, "");
  const path = `/reading/daily`;
  const url = `${base}${path}${q ? `?${q}` : ""}`;
  const r = await fetch(url);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((data as ErrorBody)?.error?.message || `${r.status} ${r.statusText}`);
  return data as { id?: string; items?: unknown[]; text?: string };
}
