import fs from "fs/promises";
import path from "path";

export async function loadMarkdown(slugParts: string[], lang: string): Promise<{ text: string; lang: string; filePath: string } | null> {
  const base = path.join(process.cwd(), "public", "content");
  const candidates = [
    path.join(base, lang, ...slugParts) + ".md",
    path.join(base, "en", ...slugParts) + ".md",
    path.join(base, "ko", ...slugParts) + ".md",
  ];
  for (const p of candidates) {
    try {
      const text = await fs.readFile(p, "utf8");
      const usedLang = p.split(path.sep)[p.split(path.sep).indexOf("content") + 1];
      return { text, lang: usedLang, filePath: p };
    } catch {}
  }
  return null;
}


