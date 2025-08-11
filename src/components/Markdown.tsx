"use client";
import { useMemo } from "react";

// 가벼운 마크다운 렌더러: 기본적인 **굵게**, *기울임*, `코드`, 제목, 리스트만 지원
// 외부 라이브러리 없이 최소 기능으로 구현

function inline(md: string): string {
  return md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

function render(md: string): string {
  const lines = md.replace(/\r/g, "").split("\n");
  const out: string[] = [];
  let inList = false;
  for (const line of lines) {
    const heading = line.match(/^\s*(#{1,6})\s+(.*)$/);
    if (heading) {
      if (inList) { out.push("</ul>"); inList = false; }
      const level = heading[1].length;
      const content = heading[2];
      const tag = level <= 2 ? "h3" : level <= 4 ? "h4" : "h5";
      // 간단 slug: 내용 그대로 id로 사용(따옴표만 제거)
      const id = content.replace(/"/g, "").trim();
      out.push(`<${tag} id="${id}">${inline(content)}</${tag}>`);
    } else if (/^\s*>\s?/.test(line)) {
      if (inList) { out.push("</ul>"); inList = false; }
      out.push(`<blockquote>${inline(line.replace(/^\s*>\s?/, ""))}</blockquote>`);
    } else if (/^\s*[-*]\s+/.test(line)) {
      if (!inList) { out.push("<ul>"); inList = true; }
      out.push(`<li>${inline(line.replace(/^\s*[-*]\s+/, ""))}</li>`);
    } else if (line.trim() === "") {
      if (inList) { out.push("</ul>"); inList = false; }
      out.push("<br/>");
    } else {
      out.push(`<p>${inline(line)}</p>`);
    }
  }
  if (inList) out.push("</ul>");
  return out.join("\n");
}

export default function Markdown({ text }: { text: string }) {
  const html = useMemo(()=> render(text), [text]);
  return <div className="prose prose-invert max-w-none text-[var(--foreground)]" dangerouslySetInnerHTML={{ __html: html }} />;
}


