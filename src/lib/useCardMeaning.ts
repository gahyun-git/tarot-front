"use client";
import { useQuery } from "@tanstack/react-query";
import { getMeaning, type CardMeaning } from "@/lib/meanings";
import { getCard } from "@/lib/api";

export function useCardMeaning(id?: number, name?: string) {
  const local = getMeaning(id, name);
  const q = useQuery<{ meaning: CardMeaning | null }>({
    queryKey: ["card-meaning", id ?? name],
    queryFn: async () => {
      if (!id && !name) return { meaning: null };
      // 1) 백엔드 카드 상세의 의미 필드 사용
      if (id !== undefined) {
        try {
          const c = await getCard(id);
          if ((c.upright_meaning && c.upright_meaning.length) || (c.reversed_meaning && c.reversed_meaning.length)) {
            return {
              meaning: {
                keywords: [],
                upright: (c.upright_meaning || []).join(", "),
                reversed: c.reversed_meaning ? c.reversed_meaning.join(", ") : undefined,
              },
            };
          }
        } catch {}
      }
      // 2) 로컬 목 API(없으면 null)
      const params = new URLSearchParams();
      if (id !== undefined) params.set("id", String(id));
      if (name) params.set("name", name);
      const r = await fetch(`/api/meaning?${params.toString()}`).catch(()=>null);
      if (!r || !r.ok) return { meaning: null };
      return r.json();
    },
    staleTime: 1000 * 60 * 60,
  });

  const merged: CardMeaning | null = q.data?.meaning
    ? {
        keywords: q.data.meaning.keywords?.length ? q.data.meaning.keywords : (local?.keywords ?? []),
        upright: q.data.meaning.upright || local?.upright || "",
        reversed: q.data.meaning.reversed || local?.reversed,
      }
    : local;

  return { ...q, meaning: merged };
}


