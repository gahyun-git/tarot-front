import Markdown from "@/components/Markdown";
import { loadMarkdown } from "@/lib/content";

export default async function ContentPage({ params, searchParams }: { params: Promise<{ slug: string[] }>, searchParams: Promise<{ lang?: string }> }) {
  const p = await params;
  const sp = await searchParams;
  const lang = (sp?.lang || "ko").toLowerCase();
  const slugParts = Array.isArray(p.slug) ? p.slug : [p.slug as unknown as string];
  const md = await loadMarkdown(slugParts, lang);
  if (!md) {
    return (
      <main className="prose prose-invert max-w-3xl mx-auto p-6 retro-hero">
        <h1>Not Found</h1>
        <p>Requested content is not available.</p>
      </main>
    );
  }
  return (
    <main className="prose prose-invert max-w-3xl mx-auto p-6 space-panel">
      {/* Markdown is client component; safe to render here */}
      <Markdown text={md.text} />
    </main>
  );
}


