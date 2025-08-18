import Link from "next/link";
import NextImage, { type ImageLoader } from "next/image";
import { getCard } from "@/lib/api";

const passthroughLoader: ImageLoader = ({ src }) => {
  if (src.startsWith("/static/")) return `/api/tarot${src}`;
  return src;
};

async function fetchAllCards() {
  // 백엔드 목록 엔드포인트가 없을 경우 1..78 범위를 조회
  const items: Array<{ id: number; name: string; arcana: string; image_url?: string | null }> = [];
  for (let i = 1; i <= 78; i++) {
    try {
      const c = await getCard(i);
      if (c && typeof c.id === "number") items.push(c);
    } catch {
      // ignore missing ids
    }
  }
  return items;
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
  return (
    <main className="space-panel p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold">Cards</h1>
        <div className="flex items-center gap-2 text-sm">
          <span className="opacity-80">정렬</span>
          <nav className="flex flex-wrap gap-1">
            {[
              { k: "id-asc", label: "번호↑" },
              { k: "id-desc", label: "번호↓" },
              { k: "name-asc", label: "이름A-Z" },
              { k: "name-desc", label: "이름Z-A" },
              { k: "arcana-major", label: "메이저→마이너" },
              { k: "arcana-minor", label: "마이너→메이저" },
            ].map((opt) => (
              <Link
                key={opt.k}
                href={`/cards?sort=${opt.k}`}
                className={`space-chip ${sort === (opt.k as SortKey) ? "on" : ""}`}
              >
                {opt.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {cards.map((c) => {
          const src = ("image_url" in c && c.image_url) ? (c as { image_url?: string | null }).image_url || `/static/cards/${String(c.id ?? 0).padStart(2, "0")}.jpg` : `/static/cards/${String(c.id ?? 0).padStart(2, "0")}.jpg`;
          return (
            <Link key={c.id} href={`/cards/${c.id}`} className="block group">
              <div className="relative w-full" style={{ aspectRatio: 2 / 3 }}>
                <NextImage loader={passthroughLoader} src={src} alt={c.name} fill className="object-cover rounded-lg" sizes="(max-width:768px) 33vw, 160px" />
              </div>
              <div className="mt-1 text-sm opacity-90 group-hover:opacity-100 truncate" title={c.name}>{c.name}</div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}


