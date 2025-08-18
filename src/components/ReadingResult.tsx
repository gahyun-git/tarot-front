"use client";
import type { ReadingResponse } from "@/lib/api";
import Modal from "@/components/Modal";
import KeyboardNav from "@/components/KeyboardNav";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { compressToEncodedURIComponent } from "lz-string";
// import { toPng } from "html-to-image";
// import jsPDF from "jspdf";
import { useCardMeaning } from "@/lib/useCardMeaning";
import NextImage, { type ImageLoader } from "next/image";
import { getCard, postInterpretReading, getReadingResult } from "@/lib/api";
import Markdown from "@/components/Markdown";
import { useI18n } from "@/lib/i18n";
import { getSpreadLabels } from "@/lib/spreads";
import { useQuery } from "@tanstack/react-query";

function usePositionLabel() {
  const { t } = useI18n();
  return (pos: number) => t(`position.${pos}`);
}

// Next/Image 커스텀 로더
// - /static/... 형태(프론트에 파일이 없는 경우)를 백엔드 BASE로 프록시
// - 그 외는 원본 그대로 사용
// 이미지 정적 경로는 내부 프록시로 전달
const passthroughLoader: ImageLoader = ({ src }) => {
  if (src.startsWith("/static/")) {
    // 내부 프록시를 통해 백엔드 정적파일을 가져오도록 변경
    return `/api/tarot${src}`;
  }
  return src;
};

export default function ReadingResult({ data }: { data: ReadingResponse }) {
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(data.items[0]);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const delayFor = (pos: number) => {
    const order = [1,2,3,4,5,6,7,8];
    const idx = order.indexOf(pos);
    return Math.max(0, idx) * 0.06;
  };

  const { isFetching } = useCardMeaning(focus.card.id, focus.card.name);

  // 새 결과가 들어오면 공개상태/포커스를 초기화하여 항상 뒷면부터 보이도록
  useEffect(() => {
    setOpen(false);
    setFocus(data.items[0]);
    // optional: scroll to top of board
    boardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [data]);

  // 내보내기 기능은 필요 시 활성화

  const { t } = useI18n();
  const [copyOpen, setCopyOpen] = useState(false);
  const handleCopyLink = useCallback(async () => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const onReadingPage = pathname.startsWith("/reading/");
    const url = onReadingPage
      ? `${origin}${pathname}`
      : (data.id
        ? `${origin}/reading/${data.id}`
        : `${origin}${pathname}#reading=${compressToEncodedURIComponent(JSON.stringify(data))}`);
    await navigator.clipboard.writeText(url);
    setCopyOpen(true);
  }, [data]);
  const posLabel = usePositionLabel();
  const isDaily = data.count === 1;
  const spreadLabels = getSpreadLabels(data.items.length, t);
  return (
    <section className="space-y-4 pb-28 md:pb-0 space-panel p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold title-retro">{t("result.title")}</h2>
        {/* 뒤로 버튼 제거 */}
      </div>
      <Modal open={copyOpen} onClose={()=>setCopyOpen(false)}>
        <div className="space-y-2">
          <div className="text-lg font-semibold">{t('share.copy')}</div>
          <div className="text-sm opacity-80">{t('share.copied')}</div>
        </div>
      </Modal>
      
      {/* 단일 그리드: md에서 4열, 8번은 우측 컬럼(row2)에 고정. 모바일은 2열 + 8번은 마지막에 표시 */}
      <div id="reading-board" ref={boardRef} className="relative z-10 pb-24 md:pb-0">
        <div className="grid grid-cols-[max-content_max-content_max-content] gap-x-1 gap-y-3 md:grid-cols-3 md:gap-x-2 md:gap-y-5 items-start w-fit mx-auto">
          {data.items
            .slice()
            .sort((a,b)=> a.position-b.position)
            .map((it)=> {
              const base = "";
              const pos = it.position;
              // 동일 좌표를 모바일/데스크톱 모두에 적용
              const posClass = (
                pos===1 ? "col-start-2 row-start-1" :
                pos===2 ? "col-start-3 row-start-1" :
                pos===3 ? "col-start-1 row-start-2" :
                pos===4 ? "col-start-2 row-start-2" :
                pos===5 ? "col-start-3 row-start-2" :
                pos===6 ? "col-start-2 row-start-3" :
                pos===7 ? "col-start-3 row-start-3" :
                /* 8 → [3,0] */ "col-start-1 row-start-4"
              );
              const mobileOrder = pos===8 ? "order-last" : "";
              return (
                <motion.div
                  key={pos}
                   className={`${base} ${posClass} ${mobileOrder}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                   {pos===8 && (
                    <div className="text-xs text-gray-500 mb-1 hidden md:block text-left md:text-left">{t("label.solutionCard")}</div>
                   )}
                  <Card
                    {...it}
                     label={isDaily ? undefined : posLabel(it.position)}
                    delay={delayFor(pos)}
                    onClick={()=>{ setFocus(it); setOpen(true); }}
                  />
                </motion.div>
              );
            })}
        </div>
        <KeyboardNav rootId="reading-board" enabled={!open} />
      </div>
      <Modal open={open} onClose={()=>setOpen(false)}>
        <div className="space-y-2">
          <div className="text-sm text-gray-500">#{focus.position} {posLabel(focus.position)}</div>
          <div className="text-lg font-semibold">{focus.card.name} {focus.is_reversed ? `(${t('badge.reversed')})` : ""}</div>
          <div className="flex flex-wrap gap-2 text-xs opacity-80">
            <span className="space-chip">#{focus.position}</span>
            <span className="space-chip">{spreadLabels[focus.position - 1] || posLabel(focus.position)}</span>
            {focus.is_reversed ? <span className="space-chip">{t('orientation.reversed')}</span> : <span className="space-chip">{t('orientation.upright')}</span>}
          </div>
          <div className="relative w-full aspect-[2/3] md:h-[72vh] md:max-h-[72vh] md:w-auto mx-auto">
            <NextImage
              loader={passthroughLoader}
              src={focus.card.image_url || `/static/cards/${String(focus.card.id ?? 0).padStart(2,'0')}.jpg`}
              alt={focus.card.name}
              fill
              className={`${focus.is_reversed ? "rotate-180" : ""} object-contain`}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
          <div className="mt-2 space-y-1">
           {isFetching && <div className="text-sm text-gray-500">{t("loading.meaning")}</div>}
            <details className="mt-3">
              <summary className="btn-outline cursor-pointer select-none">{t("modal.cardDetail")}</summary>
              <div className="mt-2 space-y-2 text-sm leading-6">
                <CardDetails id={focus.card.id} readingId={data.id ?? undefined} position={focus.position} />
              </div>
            </details>
          </div>
        </div>
      </Modal>

       <section className="mt-6 space-y-3 max-w-5xl mx-auto">
        <h3 className="text-lg font-semibold">{t("result.title")}</h3>
        <div className="divider my-2"></div>
        <ul className="retro-result-list">
          {data.items
            .sort((a,b)=> a.position-b.position)
            .map((it)=> (
              <li key={it.position} className="space-card">
                 <ResultLine position={it.position} label={isDaily ? undefined : posLabel(it.position)} id={it.card.id} name={it.card.name} reversed={it.is_reversed} isDaily={isDaily} />
              </li>
            ))}
        </ul>
           {data.id && (
          <details className="mt-5 accordion">
            <summary>
              <div className="flex items-center justify-between gap-2">
                <span>{t("view.full")}</span>
              </div>
            </summary>
            <div className="accordion-content">
              <section className="grid grid-cols-1 gap-4">
                <div>
                  <FullInterpret readingId={data.id as string} />
                </div>
              </section>
            </div>
          </details>
        )}
      </section>
      {/* Support link + Share */}
      <div className="max-w-5xl mx-auto mt-6 flex items-center justify-center gap-3 flex-wrap">
        <a
          href="https://www.buymeacoffee.com/go4it"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block"
          aria-label="Buy me a coffee"
        >
          <img
            src="https://img.buymeacoffee.com/button-api/?text=Buy%20us%20a%20sweet%20potato&emoji=&slug=go4it&button_colour=6449e9&font_colour=ffffff&font_family=Bree&outline_colour=ffffff&coffee_colour=FFDD00"
            alt="Buy us a sweet potato"
            width={280}
            height={64}
            onError={(e)=>{ e.currentTarget.src = '/bmc-button.svg'; }}
          />
        </a>
        <button className="space-btn" onClick={handleCopyLink}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M3.9 12a5 5 0 0 1 1.46-3.54l3.1-3.1a5 5 0 0 1 7.07 7.07l-1.06 1.06-1.41-1.41 1.06-1.06a3 3 0 1 0-4.24-4.24l-3.1 3.1A3 3 0 0 0 5.9 12a3 3 0 0 0 .88 2.12l1.06 1.06-1.41 1.41-1.06-1.06A5 5 0 0 1 3.9 12zm6.58 6.64l-1.06 1.06a5 5 0 1 1 7.07-7.07l1.06 1.06-1.41 1.41-1.06-1.06a3 3 0 1 0-4.24 4.24l1.06 1.06-1.41 1.41z"/>
          </svg>
          {t("share.copy")}
        </button>
      </div>
    </section>
  );
}

// NOTE: MeaningTabs 컴포넌트는 현재 미사용이라 제거

// overlay 배지는 카드 타일에서는 제거 (요청사항)

function Card(props: { position: number; is_reversed: boolean; label?: string; card: { id?: number; name: string; image_url?: string | null }; delay?: number; onClick?: ()=>void }) {
  return (
    <motion.button
      onClick={props.onClick}
      aria-label={`#${props.position} ${props.card.name}${props.is_reversed? ' (' + 'rev' + ')' : ''}`}
      className="text-left w-24 md:w-32 lg:w-36 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none transition hover:scale-[1.02]"
      data-card="1"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="w-full relative rounded-xl overflow-hidden retro-card" style={{ aspectRatio: 2/3 }}>
        {props.label && (<span className="space-chip absolute top-1 left-1 z-10">{props.label}</span>)}
        <div className="absolute inset-0">
          <NextImage
            loader={passthroughLoader}
            src={props.card.image_url || `/static/cards/${String(props.card.id ?? 0).padStart(2,'0')}.jpg`}
            alt={props.card.name}
            fill
            className={`${props.is_reversed ? "rotate-180" : ""} object-cover`}
            sizes="(max-width: 768px) 100vw, 33vw"
            style={{ filter: "none" }}
          />
        </div>
        <div className="card-namebar text-xs font-medium">{props.card.name}</div>
      </div>
    </motion.button>
  );
}

function ResultLine({ position, label, id, name, reversed, isDaily }: { position: number; label?: string; id: number; name: string; reversed: boolean; isDaily?: boolean }) {
  const { t } = useI18n();
  const { meaning, isFetching } = useCardMeaning(id, name);
  return (
    <div>
      <div className="title-row left-accent">
        <div className="flex items-center gap-3">
          <span className="thumb-wrap">
            <MiniThumb id={id} reversed={reversed} />
          </span>
          <div className="title">{isDaily ? name : `#${position} ${label ?? ''} — ${name}`} {reversed ? `(${t('badge.reversed')})` : ''}</div>
        </div>
        <div className="meta">
          <span className="badge">{reversed ? t('badge.reversed') : t('badge.upright')}</span>
        </div>
      </div>
      {isFetching && <div className="text-sm text-gray-500">{t('loading.meaning')}</div>}
      {meaning && (
        <div className="mt-1 text-sm space-y-1">
           {meaning.keywords?.length && meaning.keywords.length>0 && <div><strong>{t('label.keywords')}</strong>: {meaning.keywords.join(', ')}</div>}
          {meaning.upright && <div><strong>{t('orientation.upright')}</strong>: {meaning.upright}</div>}
          {meaning.reversed && <div><strong>{t('orientation.reversed')}</strong>: {meaning.reversed}</div>}
        </div>
      )}
    </div>
  );
}

function MiniThumb({ id, reversed }: { id: number; reversed: boolean }) {
  const src = `/static/cards/${String(id).padStart(2, '0')}.jpg`;
  return (
    <span className="inline-block relative w-7 h-10 overflow-hidden rounded-[4px] ring-1 ring-black/10 dark:ring-white/10">
      <NextImage loader={passthroughLoader} src={src} alt="" fill sizes="28px" className={`object-cover ${reversed ? 'rotate-180' : ''}`} />
    </span>
  );
}

function CardDetails({ id, readingId, position }: { id: number; readingId?: string; position?: number }) {
  const [text, setText] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const { data: resultData } = useQuery({
    enabled: Boolean(readingId),
    queryKey: ["reading-result", readingId],
    queryFn: async () => await getReadingResult(readingId as string, { lang: "auto", use_llm: true }),
    staleTime: 60_000,
  });

  useEffect(() => {
    let on = true;
    (async () => {
      try {
        // 1) 결과 캐시에서 상세 데이터 우선 사용
        const fromResult = resultData as unknown as {
          items?: Array<{ position?: number; llm_detail?: string; used_meanings?: string[]; card?: { upright_meaning?: string[] | null; reversed_meaning?: string[] | null } }>;
        } | undefined;
        const found = fromResult?.items?.find((it) =>
          typeof position === "number" ? it.position === position : true
        );
        if (found) {
          const uprightArr = found.card?.upright_meaning || [];
          const reversedArr = found.card?.reversed_meaning || [];
          const used = Array.isArray(found.used_meanings) ? found.used_meanings.join(", ") : "";
          const upright = uprightArr.map((s) => `• ${s}`).join("\n");
          const reversed = reversedArr.map((s) => `• ${s}`).join("\n");
          const lines = [
            used ? `키워드: ${used}` : "",
            "정방향",
            upright,
            "",
            "역방향",
            reversed,
            found.llm_detail ? "\n" + found.llm_detail : "",
          ].filter(Boolean);
          if (on) { setText(lines.join("\n")); return; }
        }

        // 2) 폴백: 카드 API로 직접 조회
        const c = await getCard(id);
        const upright = (c.upright_meaning || []).map((s) => `• ${s}`).join("\n");
        const reversed = (c.reversed_meaning || []).map((s) => `• ${s}`).join("\n");
        const t = ["정방향", upright, "", "역방향", reversed].filter(Boolean).join("\n");
        if (on) setText(t || "상세 해설이 없습니다.");
      } catch (e: unknown) {
        const m = e instanceof Error ? e.message : "불러오기 실패";
        if (on) setErr(m);
      }
    })();
    return () => { on = false; };
  }, [id, position, resultData]);

  if (err) return <div className="text-sm text-red-500">{err}</div>;
  if (!text) return <div className="text-sm text-gray-500">불러오는 중...</div>;
  return <pre className="whitespace-pre-wrap text-sm leading-6">{text}</pre>;
}

function FullInterpret({ readingId }: { readingId: string }) {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { locale, t } = useI18n();
  const run = useCallback(async ()=>{
    try {
      setLoading(true); setErr(null);
      const extractText = (result: Record<string, unknown>): string => {
        const items = Array.isArray((result as { items?: unknown }).items)
          ? ((result as { items: Array<Record<string, unknown>> }).items)
          : null;
        const summaryField = (result as { summary?: unknown }).summary;
        const advicesField = (result as { advices?: unknown }).advices;
        const questionField = (result as { question?: unknown }).question;
        const sectionsField = (result as { sections?: Record<string, { card?: string; orientation?: string; analysis?: string }> }).sections;

        const hasStructured = !!items && (typeof summaryField === 'string' || Array.isArray(summaryField));
        if (hasStructured) {
          const rawSummary = Array.isArray(summaryField)
            ? (summaryField as string[]).join('\n')
            : (typeof summaryField === 'string' ? (summaryField as string) : '');
          const summary = rawSummary;
          const advices = Array.isArray(advicesField)
            ? (advicesField as string[]).join('\n')
            : (typeof advicesField === 'string' ? String(advicesField) : '');

          const lines: string[] = [];
          if (typeof questionField === 'string' && questionField.trim()) {
            lines.push(`## ${t('nav.question')}`);
            lines.push(String(questionField));
            lines.push('');
          }

          lines.push(`## ${t('nav.summary')}`);
          if (summary) lines.push(summary);
          // Move advices right under summary and render as paragraphs (not list) so <p> styles apply
          if (advices) {
            lines.push('');
            lines.push(`## ${t('nav.advices')}`);
            const advArr = Array.isArray(advicesField)
              ? (advicesField as string[])
              : (typeof advicesField === 'string' ? [(advicesField as string)] : []);
            for (const a of advArr) {
              const txt = String(a).trim();
              if (txt) { lines.push(txt); lines.push(''); }
            }
          }
          lines.push('');

          lines.push(`## ${t('nav.positions')}`);
          const sorted = [...items].sort((a,b)=>{
            const pa = Number((a as { position?: number }).position ?? 0);
            const pb = Number((b as { position?: number }).position ?? 0);
            return pa - pb;
          });
          for (const it of sorted) {
            const pos = (it as { position?: number }).position ?? 0;
            const role = (it as { role?: string }).role || '';
            const isRev = Boolean((it as { is_reversed?: boolean }).is_reversed);
            const card = (it as { card?: { name?: string; upright_meaning?: string[] | null; reversed_meaning?: string[] | null } }).card || {};
            const name = (card as { name?: string }).name || '';
            const used = Array.isArray((it as { used_meanings?: string[] }).used_meanings)
              ? ((it as { used_meanings: string[] }).used_meanings.join(', '))
              : '';
            const llmDetail = (it as { llm_detail?: string }).llm_detail || '';
            const orientation = isRev ? t('badge.reversed') : t('badge.upright');
            const upright = Array.isArray((card as { upright_meaning?: string[] | null }).upright_meaning) ? (card as { upright_meaning: string[] }).upright_meaning.join(', ') : '';
            const reversed = Array.isArray((card as { reversed_meaning?: string[] | null }).reversed_meaning) ? (card as { reversed_meaning: string[] }).reversed_meaning.join(', ') : '';

            lines.push(`### #${pos} ${role} — ${name} (${orientation})`);
            if (used) lines.push(`- ${t('label.keywords')}: ${used}`);
            if (upright) lines.push(`- ${t('orientation.upright')}: ${upright}`);
            if (reversed) lines.push(`- ${t('orientation.reversed')}: ${reversed}`);
            if (llmDetail) lines.push(`\n${llmDetail}`);
            lines.push('');
          }

          if (sectionsField && typeof sectionsField === 'object') {
            const preferred = ['이슈','과거','현재','근미래','내면','외부','솔루션'];
            const entries = Object.entries(sectionsField as Record<string, { card?: string; orientation?: string; analysis?: string }>);
            entries.sort((a,b)=> preferred.indexOf(a[0]) - preferred.indexOf(b[0]));
            for (const [title, info] of entries) {
              lines.push(`### ${title}`);
              const meta: string[] = [];
              if (info.card) meta.push(info.card);
              if (info.orientation) meta.push(info.orientation);
              if (meta.length) lines.push(`- ${meta.join(' / ')}`);
              if (info.analysis) lines.push(info.analysis);
              lines.push('');
            }
          }

          // advices were already placed under summary above; do not repeat here
          return lines.join('\n').trim();
        }

        // Fallback: 서버에서 완성 텍스트 제공 시 사용
        const maybeText = (result as { text?: string }).text;
        if (typeof maybeText === 'string' && maybeText.trim().length > 0) return maybeText;

        // 최후의 보루: 요약/조언만이라도 구성
        const summary = Array.isArray(summaryField)
          ? (summaryField as string[]).join('\n')
          : (typeof summaryField === 'string' ? (summaryField as string) : '');
        const advices = Array.isArray(advicesField)
          ? (advicesField as string[]).map((s)=>`- ${s}`).join('\n')
          : '';
        return [
          '# 요약',
          summary,
          '',
          '# 조언',
          advices,
        ].filter(Boolean).join('\n').trim();
      };

      // 1) 캐시 조회 우선 (GET /reading/{id}/result)
      try {
        const cached = await getReadingResult(readingId, { lang: locale, use_llm: true });
        const t1 = extractText(cached as unknown as Record<string, unknown>);
        if (t1 && t1.trim().length > 0) { setText(t1); return; }
      } catch { /* 캐시 미존재 → 생성 시도 */ }

      // 2) 없으면 생성(POST /reading/{id}/interpret) 후 재조회
      await postInterpretReading(readingId, { lang: locale || 'auto', style: 'concise', use_llm: false });
      const created = await getReadingResult(readingId, { lang: locale || 'auto', use_llm: true });
      const t2 = extractText(created as unknown as Record<string, unknown>);
      setText(t2);
  } catch (e: unknown) {
      const m = e instanceof Error ? e.message : '해설 생성 실패';
      setErr(m);
    } finally { setLoading(false); }
  }, [readingId, locale, t]);

  useEffect(()=>{ run(); }, [run]);

  if (loading && !text) {
    return (
      <Modal open={true} onClose={()=>{}}>
        <div className="flex flex-col items-center justify-center gap-4 p-2">
          <div className="space-orb" aria-hidden />
          <div className="text-lg font-semibold">{t('loading.title')}</div>
          <div className="space-progress w-full max-w-md" aria-live="polite">
            <div className="bar" style={{ width: '66%' }} />
          </div>
          <div className="space-steps">
            <span className="space-chip on">{t('loading.checkCache')}</span>
            <span className="space-chip on">{t('loading.request')}</span>
            <span className="space-chip">{t('loading.fetch')}</span>
          </div>
        </div>
      </Modal>
    );
  }
  if (err) return <div className="text-sm text-red-500 p-3">{err}</div>;
  if (!text) return null;
  // 백엔드 응답을 그대로 출력
  return <div className="p-3"><Markdown text={text} /></div>;
}
