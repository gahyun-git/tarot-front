type Card = { id: number; name: string; arcana: string; image_url?: string | null };
type CardWithContext = { position: number; role: string; is_reversed: boolean; used_meanings?: string[] | null; card: Card; llm_detail?: string | null };
type FullReadingResult = {
  id: string; question: string; lang: string;
  items: CardWithContext[]; summary: string; advices: string[]; llm_used: boolean;
  sections?: Record<string, { card: string; orientation: string; analysis: string }>;
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api.go4it.site";

async function getData(slug: string): Promise<FullReadingResult> {
  const res = await fetch(`${API}/reading/s/${encodeURIComponent(slug)}/result?use_llm=false`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getData(slug);
  return (
    <main style={{ padding: 24, maxWidth: 860, margin: "0 auto" }}>
      <h1>Tarot Reading</h1>
      <p style={{ opacity: .85 }}>Q: {data.question}</p>
      <section>
        <h2>Summary</h2>
        <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{data.summary}</p>
      </section>
      <section>
        <h2>Advices</h2>
        <ol>
          {data.advices.map((a, i) => (<li key={i} style={{ marginBottom: 12, lineHeight: 1.7 }}>{a}</li>))}
        </ol>
      </section>
      <section>
        <h2>Cards</h2>
        <ul>
          {data.items.map(it => (
            <li key={it.position} style={{ margin: "8px 0" }}>
              <b>{it.position}. {it.role}</b> — {it.card.name} {it.is_reversed ? "(역)" : "(정)"}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}


