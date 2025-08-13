import Link from "next/link";
import fs from "fs/promises";
import path from "path";

async function listContent(lang: string) {
  const base = path.join(process.cwd(), "public", "content", lang);
  const out: { href: string; title: string }[] = [];
  const walk = async (dir: string, prefix: string[] = []) => {
    let entries: string[] = [];
    try { entries = await fs.readdir(dir); } catch { return; }
    for (const name of entries) {
      const p = path.join(dir, name);
      const stat = await fs.stat(p);
      if (stat.isDirectory()) await walk(p, [...prefix, name]);
      else if (name.endsWith('.md')) {
        const slug = [...prefix, name.replace(/\.md$/, '')];
        out.push({ href: `/content/${slug.join('/') }?lang=${lang}`, title: slug.join(' / ') });
      }
    }
  };
  await walk(base, []);
  return out.sort((a,b)=> a.title.localeCompare(b.title));
}

export default async function ContentIndex({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const sp = await searchParams;
  const lang = (sp?.lang || 'ko').toLowerCase();
  const items = await listContent(lang);
  return (
    <main className="space-panel p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-3">Guides</h1>
      <ul className="grid gap-2">
        {items.map((it)=> (
          <li key={it.href}><Link className="space-chip" href={it.href}>{it.title}</Link></li>
        ))}
      </ul>
    </main>
  );
}


