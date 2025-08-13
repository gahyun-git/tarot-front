"use client";
import { useMemo, useCallback } from "react";
import { useI18n } from "@/lib/i18n";

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

function render(md: string, t: (k:string)=>string, normalizeRole: (s:string)=>string): string {
  const lines = md.replace(/\r/g, "").split("\n");
  const out: string[] = [];
  let inList = false;
  let inKv = false;
  const uprightTokens = /^(정|正|正位|upright)$/i;
  const reversedTokens = /^(역|逆|逆位|reversed)$/i;
  const kwTokens = /^(키워드|关键词|キーワード)$/;
  const uprightKeyTokens = /^(정방향(?:\s*의미)?|正位|正位置)$/;
  const reversedKeyTokens = /^(역방향(?:\s*의미)?|逆位|逆位置)$/;
  const orientParens = /[()（）]/; // half/full width

  for (const line of lines) {
    const heading = line.match(/^\s*(#{1,6})\s+(.*)$/);
    if (heading) {
      if (inList) { out.push("</ul>"); inList = false; }
      if (inKv) { out.push("</div>"); inKv = false; }
      const level = heading[1].length;
      const content = heading[2].trim();
      const tag = level <= 3 ? "h3" : level <= 5 ? "h4" : "h5";
      // 간단 slug: 내용 그대로 id로 사용(따옴표만 제거)
      const id = content.replace(/"/g, "").trim();
      // 예: "#3 과거 — Four of Wands (역)" 형태를 배지/칩 UI로 변환 (h3/h4 모두 적용)
      if (/^#\s*\d+/.test(content)) {
        const m = content.match(/^#\s*(\d+)\s+(.+)$/);
        const num = m ? m[1] : "";
        const rest = m ? m[2] : content;
        const parts = rest.split(/[—-]/);
        const role = parts.length > 1 ? parts[0].trim() : "";
        const rawTitle = parts.length > 1 ? parts.slice(1).join("—").trim() : rest.trim();
        const orientMatch = rawTitle.match(new RegExp(`${orientParens.source}(.*)${orientParens.source}\s*$`));
        const orientationRaw = orientMatch ? (orientMatch[1] || '').trim() : "";
        const orientation = orientationRaw
          ? (uprightTokens.test(orientationRaw) ? t("badge.upright") : reversedTokens.test(orientationRaw) ? t("badge.reversed") : orientationRaw)
          : "";
        const title = orientMatch ? rawTitle.replace(new RegExp(`${orientParens.source}.*${orientParens.source}\s*$`), "").trim() : rawTitle;
        out.push(
          `<h3 id="${id}" class="retro-h">`
          + `<span class="pos-badge">#${num}</span>`
          + (role ? `<span class="role-chip">${inline(normalizeRole(role))}</span>` : "")
          + (orientation ? `<span class="orient-chip">${orientation}</span>` : "")
          + `<span class="title">${inline(title)}</span>`
          + `</h3>`
        );
      } else {
        out.push(`<${tag} id="${id}">${inline(content)}</${tag}>`);
      }
    } else if (/^\s*>\s?/.test(line)) {
      if (inList) { out.push("</ul>"); inList = false; }
      if (inKv) { out.push("</div>"); inKv = false; }
      out.push(`<blockquote>${inline(line.replace(/^\s*>\s?/, ""))}</blockquote>`);
    } else if (/^\s*[-*]\s+/.test(line)) {
      if (!inList) { out.push("<ul>"); inList = true; }
      out.push(`<li>${inline(line.replace(/^\s*[-*]\s+/, ""))}</li>`);
    } else if (line.trim() === "") {
      if (inList) { out.push("</ul>"); inList = false; }
      if (inKv) { out.push("</div>"); inKv = false; }
      out.push("<br/>");
    } else {
      const kv = line.match(/^\s*(.+?)\s*[:：]\s*(.*)$/);
      if (kv) {
        if (!inKv) { out.push('<div class="kv-table">'); inKv = true; }
        const rawKey = (kv[1] || '').trim();
        const value = kv[2];
        let keyLabel = rawKey;
        if (kwTokens.test(rawKey)) keyLabel = t('label.keywords');
        else if (uprightKeyTokens.test(rawKey)) keyLabel = t('orientation.upright');
        else if (reversedKeyTokens.test(rawKey)) keyLabel = t('orientation.reversed');
        const chips = value.split(/[、,，]\s*/).filter(Boolean).map(v=>`<span class="kv-chip">${inline(v)}</span>`).join(" ");
        out.push(`<div class="kv-row"><div class="kv-key">${keyLabel}</div><div class="kv-val">${chips || inline(value)}</div></div>`);
      } else {
        if (inKv) { out.push("</div>"); inKv = false; }
        out.push(`<p>${inline(line)}</p>`);
      }
    }
  }
  if (inList) out.push("</ul>");
  if (inKv) out.push("</div>");
  return out.join("\n");
}

export default function Markdown({ text }: { text: string }) {
  const { t, locale } = useI18n();
  const translateToken = useCallback((token: string): string => {
    const src = token.trim().toLowerCase();
    const mapCommon: Record<string, { ko:string; en:string; ja:string; zh:string }> = {
      // virtues / states
      "인내": { ko:"인내", en:"Patience", ja:"忍耐", zh:"耐心" },
      "impatience": { ko:"성급함", en:"Impatience", ja:"性急", zh:"急躁" },
      "낭비": { ko:"낭비", en:"Waste", ja:"浪費", zh:"浪費" },
      "waste": { ko:"낭비", en:"Waste", ja:"浪費", zh:"浪費" },
      "평가": { ko:"평가", en:"Evaluation", ja:"評価", zh:"评价" },
      "인내심": { ko:"인내", en:"Patience", ja:"忍耐", zh:"耐心" },
      "소식": { ko:"소식", en:"News", ja:"知らせ", zh:"消息" },
      "학습": { ko:"학습", en:"Learning", ja:"学習", zh:"学习" },
      "미숙": { ko:"미숙", en:"Immaturity", ja:"未熟", zh:"不成熟" },
      "불안정": { ko:"불안정", en:"Instability", ja:"不安定", zh:"不稳定" },
      "혼란": { ko:"혼란", en:"Confusion", ja:"混乱", zh:"混乱" },
      "과대평가": { ko:"과대평가", en:"Overestimation", ja:"過大評価", zh:"过度评价" },
      "선택": { ko:"선택", en:"Choice", ja:"選択", zh:"选择" },
      "균형": { ko:"균형", en:"Balance", ja:"バランス", zh:"平衡" },
      "정의": { ko:"정의", en:"Justice", ja:"正義", zh:"正义" },
      "진실": { ko:"진실", en:"Truth", ja:"真実", zh:"真相" },
      "편향": { ko:"편향", en:"Bias", ja:"偏り", zh:"偏见" },
      "불공정": { ko:"불공정", en:"Unfairness", ja:"不公平", zh:"不公平" },
      "new beginnings": { ko:"새 출발", en:"New Beginnings", ja:"新たな始まり", zh:"新的开始" },
      "freedom": { ko:"자유", en:"Freedom", ja:"自由", zh:"自由" },
    };
    const hit = mapCommon[src];
    if (!hit) return token;
    return hit[locale] as string;
  }, [locale]);
  const normalizeRole = useCallback((raw: string): string => {
    const s = raw.toLowerCase();
    if (/issue|이슈|課題|问题/.test(s)) return t("role.std.issue");
    if (/hidden|숨|隠|潜/.test(s)) return t("role.std.hidden");
    if (/past|과거|過去|过去/.test(s)) return t("role.std.past");
    if (/present|현재|現在|现在/.test(s)) return t("role.std.present");
    if (/near|근미래|近未来|近期/.test(s)) return t("role.std.near");
    if (/inner|내면|内面|内在/.test(s)) return t("role.std.inner");
    if (/external|외부|外部/.test(s)) return t("role.std.external");
    if (/solution|솔루션|解決|解决/.test(s)) return t("role.std.solution");
    return raw;
  }, [t]);
  // 추가 후처리: 역할 칩 정규화
  const html = useMemo(() => {
    // 1) 기본 렌더링 (다국어 키/배지 처리 포함)
    let h = render(text, t, normalizeRole);
    // 2) 역할명 표준화
    h = h.replace(/(<span class=\"role-chip\">)(.*?)(<\/span>)/g, (_m, a, b, c) => a + normalizeRole(b) + c);
    // 3) 키워드/값 토큰 번역(영/한 → 현재 로케일)
    h = h.replace(/(<div class=\"kv-val\">)(.*?)(<\/div>)/gi, (m, a, b, c) => {
      // 칩이 이미 생성된 경우 칩 내부 텍스트만 치환
      const translated = b.replace(/(<span class=\"kv-chip\">)(.*?)(<\/span>)/g, (
        _m2: string,
        aa: string,
        bb: string,
        cc: string
      ) => {
        return aa + translateToken(bb) + cc;
      });
      return a + translated + c;
    });
    return h;
  }, [text, normalizeRole, t, translateToken]);
  return <div className="prose prose-invert max-w-none text-[var(--foreground)] retro-md" dangerouslySetInnerHTML={{ __html: html }} />;
}


