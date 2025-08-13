export type CardMeaning = {
  title?: string;
  keywords?: string[];    // 키워드 칩
  upright?: string;       // 정위 텍스트(조합)
  reversed?: string;      // 역위 텍스트(조합)
  summary?: string;       // 요약
};

// NOTE: 실제 데이터 연결 전까지는 비어 있을 수 있습니다.
// 이후 빌드타임에 주입하거나 백엔드에서 전달받아 머지하도록 설계합니다.
const byId = new Map<number, CardMeaning>();
const byName = new Map<string, CardMeaning>();
let loaded = false;

export function registerMeaning(
  key: { id?: number; name?: string },
  meaning: CardMeaning
) {
  if (key.id !== undefined) byId.set(key.id, meaning);
  if (key.name) byName.set(key.name.toLowerCase(), meaning);
}

export function getMeaning(id?: number, name?: string): CardMeaning | null {
  // SSR 안전: window 존재 시 최초 1회 로드
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    void fetch("/data/meanings.min.json")
      .then((r) => r.json())
      .then((list: Array<{ id?: number; name?: string; keywords?: string[]; upright?: string; reversed?: string }>) => {
        for (const item of list) {
          if (!item.name && item.id === undefined) continue;
          registerMeaning({ id: item.id, name: item.name }, {
            keywords: item.keywords ?? [],
            upright: item.upright ?? "",
            reversed: item.reversed,
          });
        }
      })
      .catch(() => {
        // ignore fetch errors
      });
  }
  if (id !== undefined && byId.has(id)) return byId.get(id)!;
  if (name) {
    const m = byName.get(name.toLowerCase());
    if (m) return m;
  }
  return null;
}


