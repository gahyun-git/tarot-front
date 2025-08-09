export type GroupOrder = "A" | "B" | "C";
export type ReadingItem = {
  position: number;
  is_reversed: boolean;
  card: { id: number; name: string; arcana: string; suit?: string | null; image_url?: string | null };
};

export type ReadingResponse = {
  question: string;
  order: GroupOrder[];
  count: number;
  items: ReadingItem[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8008";

export async function postReading(params: {
  question: string;
  group_order: GroupOrder[];
  shuffle_times: number;
  seed: number | null;
  allow_reversed: boolean;
}): Promise<ReadingResponse> {
  const r = await fetch(`${API_BASE}/reading/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const body = await r.json();
  if (!r.ok) throw new Error(body?.error?.message || "request failed");
  return body as ReadingResponse;
}
