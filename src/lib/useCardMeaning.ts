"use client";
import { useQuery } from "@tanstack/react-query";
import { getMeaning, type CardMeaning } from "@/lib/meanings";
import { getCard, getCardMeanings } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

export type EnhancedMeaning = CardMeaning & {
  uprightList?: string[];
  reversedList?: string[];
};

export function useCardMeaning(id?: number, name?: string) {
  const { locale } = useI18n();
  const local = getMeaning(id, name);
  const q = useQuery<{ meaning: EnhancedMeaning | null }>({
    queryKey: ["card-meaning", id ?? name],
    queryFn: async () => {
      if (!id && !name) return { meaning: null };
      // 1) 백엔드 카드 의미 API 우선 사용
      if (id !== undefined) {
        try {
          const m = await getCardMeanings(id, { lang: locale });
          if ((m.upright && m.upright.length) || (m.reversed && m.reversed.length)) {
            return {
              meaning: {
                keywords: [],
                upright: (m.upright || []).join(", "),
                reversed: m.reversed?.join(", "),
                uprightList: m.upright || undefined,
                reversedList: m.reversed || undefined,
              } as EnhancedMeaning,
            };
          } else {
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
          }
        } catch {}
      }
      // 2) 로컬 목 API 대체: /api/tarot/cards/{id}/meanings?lang={locale}
      if (id !== undefined) {
        try {
          const m = await getCardMeanings(id, { lang: locale });
          return {
            meaning: {
              keywords: [],
              upright: (m.upright || []).join(", "),
              reversed: m.reversed?.join(", "),
              uprightList: m.upright || undefined,
              reversedList: m.reversed || undefined,
            } as EnhancedMeaning,
          };
        } catch { /* ignore */ }
      }
      return { meaning: null };
    },
    staleTime: 1000 * 60 * 60,
  });

  const merged: EnhancedMeaning | null = q.data?.meaning
    ? {
        keywords: (q.data.meaning.keywords && q.data.meaning.keywords.length ? q.data.meaning.keywords : (local?.keywords ?? [])) as string[],
        upright: q.data.meaning.upright || local?.upright || "",
        reversed: q.data.meaning.reversed || local?.reversed,
        // arrays가 있으면 전달
        uprightList: q.data.meaning.uprightList || undefined,
        reversedList: q.data.meaning.reversedList || undefined,
      }
    : (local as EnhancedMeaning | null);

  return { ...q, meaning: merged };
}


