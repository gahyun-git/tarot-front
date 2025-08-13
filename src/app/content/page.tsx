import Link from "next/link";
import fs from "fs/promises";
import path from "path";

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
  const q = (sp?.q || '').toLowerCase();
  const cat = (sp?.cat || '').toLowerCase();
  const filtered = items.filter(it => (!q || it.title.toLowerCase().includes(q)) && (!cat || it.cat === cat));
  return (
    <main className="space-panel p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold">Guides</h1>
        <form className="flex gap-2" action="/content" method="get">
          <input className="space-input w-48" name="q" placeholder="Search" defaultValue={q} />
          <select className="space-select" name="cat" defaultValue={cat}>
            <option value="">All</option>
            <option value="spread">Spread</option>
            <option value="cards">Cards</option>
          </select>
          <select className="space-select" name="lang" defaultValue={lang}>
            <option value="ko">한국어</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
            <option value="zh">中文</option>
          </select>
          <button className="space-btn">Go</button>
        </form>
      </div>
      <ul className="grid gap-2">
        {filtered.map((it)=> (
          <li key={it.href} className="flex items-center gap-2">
            <span className="space-chip">{it.cat}</span>
            <Link className="space-chip" href={it.href}>{it.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}


