import NextImage, { type ImageLoader } from "next/image";
import { getCard, getCardMeanings } from "@/lib/api";

type Lang = "ko" | "en" | "ja" | "zh" | "auto";

const labels: Record<Exclude<Lang, "auto">, Record<string, string>> = {
  ko: {
    title: "카드 해설",
    keywords: "키워드",
    upright: "정방향",
    reversed: "역방향",
    example: "해석 사례",
    notFound: "카드를 찾을 수 없습니다.",
  },
  en: {
    title: "Card Meaning",
    keywords: "Keywords",
    upright: "Upright",
    reversed: "Reversed",
    example: "Example Interpretation",
    notFound: "Card not found.",
  },
  ja: {
    title: "カード解説",
    keywords: "キーワード",
    upright: "正位置",
    reversed: "逆位置",
    example: "解釈例",
    notFound: "カードが見つかりません。",
  },
  zh: {
    title: "卡牌解读",
    keywords: "关键词",
    upright: "正位",
    reversed: "逆位",
    example: "解读示例",
    notFound: "未找到该卡牌。",
  },
};

const passthroughLoader: ImageLoader = ({ src }) => {
  if (src.startsWith("/static/")) return `/api/tarot${src}`;
  return src;
};

function exampleFrom(upright?: string[], reversed?: string[], lng: Exclude<Lang, "auto"> = "ko") {
  const top = (upright && upright.length ? upright[0] : (reversed && reversed.length ? reversed[0] : "")).trim();
  if (!top) return "";
  if (lng === "en") return `If this card appears, consider focusing on "${top}" and start with a small step today.`;
  if (lng === "ja") return `このカードが出たら、「${top}」に焦点を当て、まずは小さく行動に移しましょう。`;
  if (lng === "zh") return `若出现此牌，可围绕“${top}”先从小行动开始。`;
  return `이 카드가 나왔다면 오늘은 "${top}"에 초점을 맞춰 작은 실행부터 시작해 보세요.`;
}

export default async function CardDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ lang?: Lang }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const lang = (sp?.lang || "auto").toLowerCase() as Lang;
  const langKey: Exclude<Lang, "auto"> = (lang === "auto" ? "ko" : (lang as Exclude<Lang, "auto">));

  // 데이터 가져오기
  const numId = Number(id);
  if (!Number.isFinite(numId)) {
    return (
      <main className="prose prose-invert max-w-4xl mx-auto p-6 space-panel">
        <h1>{labels[langKey].notFound}</h1>
      </main>
    );
  }
  const card = await getCard(numId);
  const meanings = await getCardMeanings(numId, { lang });

  const uprightList = Array.isArray(meanings.upright) ? meanings.upright : (card.upright_meaning || []);
  const reversedList = Array.isArray(meanings.reversed) ? meanings.reversed : (card.reversed_meaning || []);

  const example = exampleFrom(uprightList, reversedList, langKey);

  const src = card.image_url || `/static/cards/${String(card.id ?? 0).padStart(2, "0")}.jpg`;

  return (
    <main className="space-panel p-6 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6 items-start">
        <div className="w-full max-w-sm mx-auto">
          <div className="relative w-full" style={{ aspectRatio: 2 / 3 }}>
            <NextImage loader={passthroughLoader} src={src} alt={card.name} fill className="object-cover rounded-xl" sizes="(max-width:768px) 100vw, 320px" />
          </div>
        </div>
        <div className="prose prose-invert">
          <h1 className="mb-2">{card.name}</h1>
          <p className="opacity-80 text-sm">{labels[langKey].title}</p>

          <section className="mt-4">
            <h2 className="text-lg font-semibold">{labels[langKey].keywords}</h2>
            {uprightList && uprightList.length ? (
              <div className="flex flex-wrap gap-2 mt-1">
                {uprightList.slice(0, 6).map((k, i) => (
                  <span key={i} className="space-chip" title={k}>{k}</span>
                ))}
              </div>
            ) : (
              <div className="text-sm opacity-70">-</div>
            )}
          </section>

          <section className="mt-4">
            <h2 className="text-lg font-semibold">{labels[langKey].upright}</h2>
            <ul className="list-disc ml-5 mt-1">
              {(uprightList || []).map((t, i) => (<li key={i}>{t}</li>))}
            </ul>
          </section>

          {reversedList && reversedList.length > 0 && (
            <section className="mt-4">
              <h2 className="text-lg font-semibold">{labels[langKey].reversed}</h2>
              <ul className="list-disc ml-5 mt-1">
                {reversedList.map((t, i) => (<li key={i}>{t}</li>))}
              </ul>
            </section>
          )}

          {example && (
            <section className="mt-4">
              <h2 className="text-lg font-semibold">{labels[langKey].example}</h2>
              <blockquote className="opacity-90">{example}</blockquote>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}


