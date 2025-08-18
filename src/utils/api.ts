export const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api.go4it.site";

export async function createReading(payload: {
	question: string;
	group_order: ("A" | "B" | "C")[];
	shuffle_times: number;
	seed?: number | null;
	allow_reversed: boolean;
}) {
	const res = await fetch(`${API}/reading/`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	if (!res.ok) throw new Error(`create failed: ${res.status}`);
	return res.json(); // { id, ... }
}

export async function createShare(readingId: string) {
	const res = await fetch(`${API}/reading/${readingId}/share`, { method: "POST" });
	if (!res.ok) throw new Error(`share failed: ${res.status}`);
	return res.json() as Promise<{ slug: string }>; 
}


