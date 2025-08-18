import Link from "next/link";
// no image loader in server file
import { getCard, getCards } from "@/lib/api";
import CardsGrid from "@/components/CardsGrid";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// image loader moved to client grid component

async function fetchAllCards() {
  try {
    const list = await getCards();
    return list.items || [];
  } catch {
    // 폴백: 1..78 개별 조회
    const items: Array<{ id: number; name: string; arcana: string; image_url?: string | null }> = [];
    for (let i = 1; i <= 78; i++) {
      try {
        const c = await getCard(i);
        if (c && typeof c.id === "number") items.push(c);
      } catch {}
    }
    return items;
  }
}

type SortKey = "id-asc" | "id-desc" | "name-asc" | "name-desc" | "arcana-major" | "arcana-minor";

function sortCards<T extends { id: number; name: string; arcana: string }>(cards: Array<T>, key: SortKey): Array<T> {
  const byName = (a: string, b: string) => a.localeCompare(b);
  const arcanaRank = (v: string) => (String(v).toLowerCase() === "major" ? 0 : 1);
  const cloned = [...cards];
  switch (key) {
    case "id-desc":
      return cloned.sort((a, b) => b.id - a.id);
    case "name-asc":
      return cloned.sort((a, b) => byName(a.name, b.name));
    case "name-desc":
      return cloned.sort((a, b) => byName(b.name, a.name));
    case "arcana-major":
      return cloned.sort((a, b) => arcanaRank(a.arcana) - arcanaRank(b.arcana) || a.id - b.id);
    case "arcana-minor":
      return cloned.sort((a, b) => arcanaRank(b.arcana) - arcanaRank(a.arcana) || a.id - b.id);
    case "id-asc":
    default:
      return cloned.sort((a, b) => a.id - b.id);
  }
}

export default async function CardsIndexPage({ searchParams }: { searchParams: Promise<{ sort?: SortKey }> }) {
  const sp = await searchParams;
  const sort = (sp?.sort || "id-asc") as SortKey;
  const cardsRaw = await fetchAllCards();
  const cards = sortCards(cardsRaw, sort);
  const count = Array.isArray(cards) ? cards.length : 0;
  return (
    <main className="space-panel p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold">Cards{count ? ` (${count})` : ""}</h1>
      </div>
      <CardsGrid initialCards={cards} sort={sort} />
    </main>
  );
}


