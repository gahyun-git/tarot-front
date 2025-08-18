"use client";
import Link from "next/link";
import NextImage, { type ImageLoader } from "next/image";
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { useI18n } from "@/lib/i18n";
import { getCard, getCardMeanings } from "@/lib/api";

type SortKey = "id-asc" | "id-desc" | "name-asc" | "name-desc" | "arcana-major" | "arcana-minor";

const passthroughLoader: ImageLoader = ({ src }) => {
  if (src.startsWith("/static/")) return `/api/tarot${src}`;
  return src;
};

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

export default function CardsGrid({ initialCards, sort }: { initialCards: Array<{ id: number; name: string; arcana: string; image_url?: string | null }>; sort: SortKey }) {
  const [items, setItems] = useState(initialCards);
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState<{ id: number; name: string; image_url?: string | null } | null>(null);
  const [upright, setUpright] = useState<string[]>([]);
  const [reversed, setReversed] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (initialCards && initialCards.length > 0) return; // SSR filled → skip
    (async () => {
      try {
        const res = await fetch("/api/tarot/cards/", { cache: "no-store" });
        const data = await res.json();
        const arr = Array.isArray(data?.items) ? (data.items as Array<{ id: number; name: string; arcana: string; image_url?: string | null }>) : [];
        setItems(sortCards(arr, sort));
      } catch {
        setItems([]);
      }
    })();
  }, [initialCards, sort]);

  async function showDetail(card: { id: number; name: string; image_url?: string | null }) {
    setFocus(card);
    setOpen(true);
    setLoading(true);
    try {
      const m = await getCardMeanings(card.id, { lang: locale });
      let up = Array.isArray(m.upright) ? m.upright : [];
      let rv = Array.isArray(m.reversed) ? m.reversed : [];
      // Fallback: 카드 원본의 의미 필드 사용
      if ((!up || up.length === 0) && (!rv || rv.length === 0)) {
        try {
          const c = await getCard(card.id);
          up = Array.isArray(c.upright_meaning) ? c.upright_meaning : up;
          rv = Array.isArray(c.reversed_meaning) ? c.reversed_meaning : rv;
        } catch {}
      }
      setUpright(up || []);
      setReversed(rv || []);
    } finally { setLoading(false); }
  }

  if (!items || items.length === 0) {
    return <div className="text-sm opacity-80 mt-4">카드를 불러오지 못했습니다. 새로고침하거나 잠시 후 다시 시도해 주세요.</div>;
  }
  return (
    <>
      {/* Sort controls (i18n) */}
      <div className="flex items-center gap-2 text-sm mb-3">
        <span className="opacity-80">{t('label.sort') || '정렬'}</span>
        <nav className="flex flex-wrap gap-1">
          {[
            { k: "id-asc", label: t('sort.numberAsc') || '번호↑' },
            { k: "id-desc", label: t('sort.numberDesc') || '번호↓' },
            { k: "name-asc", label: t('sort.nameAsc') || '이름A-Z' },
            { k: "name-desc", label: t('sort.nameDesc') || '이름Z-A' },
            { k: "arcana-major", label: t('sort.majorFirst') || '메이저→마이너' },
            { k: "arcana-minor", label: t('sort.minorFirst') || '마이너→메이저' },
          ].map((opt) => (
            <Link key={opt.k} href={`/cards?sort=${opt.k}`} className={`space-chip ${sort === (opt.k as SortKey) ? 'on' : ''}`}>{opt.label}</Link>
          ))}
        </nav>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {items.map((c) => {
          const src = ("image_url" in c && c.image_url)
            ? (c.image_url || `/static/cards/${String(c.id ?? 0).padStart(2, "0")}.jpg`)
            : `/static/cards/${String(c.id ?? 0).padStart(2, "0")}.jpg`;
          return (
            <button key={c.id} onClick={() => showDetail({ id: c.id, name: c.name, image_url: c.image_url })} className="block text-left group focus:outline-none">
              <div className="relative w-full" style={{ aspectRatio: 2 / 3 }}>
                <NextImage loader={passthroughLoader} src={src} alt={c.name} fill className="object-cover rounded-lg" sizes="(max-width:768px) 33vw, 160px" />
              </div>
              <div className="mt-1 text-sm opacity-90 group-hover:opacity-100 truncate" title={c.name}>{c.name}</div>
            </button>
          );
        })}
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        {!focus ? null : (
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 items-start">
            <div className="relative w-full" style={{ aspectRatio: 2 / 3 }}>
              <NextImage loader={passthroughLoader} src={focus.image_url || `/static/cards/${String(focus.id).padStart(2, "0")}.jpg`} alt={focus.name} fill className="object-cover rounded-lg" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">{focus.name}</h2>
              {loading && <div className="text-sm opacity-70">불러오는 중...</div>}
              {!loading && (
                <div className="space-y-3">
                  <section>
                    <div className="font-medium mb-1">{t('orientation.upright')}</div>
                    {upright && upright.length ? (
                      <ul className="list-disc ml-5 text-sm space-y-1">
                        {upright.map((s, i) => (<li key={i}>{s}</li>))}
                      </ul>
                    ) : (<div className="text-sm opacity-70">-</div>)}
                  </section>
                  {reversed && (
                    <section>
                      <div className="font-medium mb-1">{t('orientation.reversed')}</div>
                      {reversed.length ? (
                        <ul className="list-disc ml-5 text-sm space-y-1">
                          {reversed.map((s, i) => (<li key={i}>{s}</li>))}
                        </ul>
                      ) : (<div className="text-sm opacity-70">-</div>)}
                    </section>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}


