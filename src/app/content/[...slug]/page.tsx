import Markdown from "@/components/Markdown";
import { loadMarkdown } from "@/lib/content";

export default async function ContentPage({ params, searchParams }: { params: { slug: string[] }, searchParams: { lang?: string } }) {
  const lang = (searchParams?.lang || "ko").toLowerCase();
  const slugParts = Array.isArray(params.slug) ? params.slug : [params.slug];
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


