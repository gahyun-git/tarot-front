import Link from "next/link";
import fs from "fs/promises";
import path from "path";
// static route (server) — i18n handled by querystring per item URL

async function listContent(lang: string) {
  const base = path.join(process.cwd(), "public", "content", lang);
  const out: { href: string; title: string; cat: string }[] = [];
  const walk = async (dir: string, prefix: string[] = []) => {
    let entries: string[] = [];
    try { entries = await fs.readdir(dir); } catch { return; }
    for (const name of entries) {
      const p = path.join(dir, name);
      const stat = await fs.stat(p);
      if (stat.isDirectory()) await walk(p, [...prefix, name]);
      else if (name.endsWith('.md')) {
        const slug = [...prefix, name.replace(/\.md$/, '')];
        const cat = prefix[0] || "misc";
        out.push({ href: `/content/${slug.join('/') }?lang=${lang}`, title: slug.join(' / '), cat });
      }
    }
  };
  await walk(base, []);
  return out.sort((a,b)=> a.title.localeCompare(b.title));
}

export default async function ContentIndex({ searchParams }: { searchParams: Promise<{ lang?: string; q?: string; cat?: string }> }) {
  const sp = await searchParams;
  const lang = (sp?.lang || 'ko').toLowerCase();
  const items = await listContent(lang);
  // 목록만 보여주도록 단순화 (검색/필터 폼 제거)
  return (
    <main className="space-panel p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-3">Content</h1>
      <ul className="grid gap-2">
        {items.map((it)=> (
          <li key={it.href} className="flex items-center gap-2">
            <span className="space-chip">{it.cat}</span>
            <Link className="space-chip" href={it.href}>{it.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}


