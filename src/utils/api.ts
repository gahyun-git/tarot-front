export const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api.go4it.site";
const PUBLIC_API_KEY = process.env.NEXT_PUBLIC_API_KEY;

function authHeaders(): Record<string, string> {
	const h: Record<string, string> = { "Content-Type": "application/json" };
	if (PUBLIC_API_KEY && PUBLIC_API_KEY.trim()) {
		h["Authorization"] = `Bearer ${PUBLIC_API_KEY}`;
		h["x-api-key"] = PUBLIC_API_KEY; // 백엔드 설정에 따라 둘 중 하나 사용
	}
	return h;
}

export async function createReading(payload: {
	question: string;
	group_order: ("A" | "B" | "C")[];
	shuffle_times: number;
	seed?: number | null;
	allow_reversed: boolean;
}) {
	const res = await fetch(`${API}/reading/`, {
		method: "POST",
		headers: authHeaders(),
		body: JSON.stringify(payload),
	});
	if (!res.ok) throw new Error(`create failed: ${res.status}`);
	return res.json(); // { id, ... }
}

export async function createShare(readingId: string) {
	const res = await fetch(`${API}/reading/${readingId}/share`, { method: "POST", headers: authHeaders() });
	if (!res.ok) throw new Error(`share failed: ${res.status}`);
	return res.json() as Promise<{ slug: string }>; 
}


