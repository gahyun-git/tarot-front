"use client";
import { useEffect, useState } from "react";
import { decompressFromEncodedURIComponent } from "lz-string";
import ReadingForm from "@/components/ReadingForm";
import ReadingResultSkeleton from "@/components/ReadingResultSkeleton";
import History from "@/components/History";
import SpreadPicker from "@/components/SpreadPicker";
import InlineGuides from "@/components/InlineGuides";
import type { ReadingResponse } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { addToHistory } from "@/lib/history";
// import Link from "next/link";

export default function Home() {
  const [, setResult] = useState<ReadingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const m = hash.match(/#reading=(.+)$/);
    if (m && m[1]) {
      try {
        const json = decompressFromEncodedURIComponent(m[1]);
        const obj = JSON.parse(json) as ReadingResponse;
        if (obj && obj.items && Array.isArray(obj.items)) setResult(obj);
      } catch {
        // ignore parse errors
      }
    }
  }, []);
  return (
    <main className="p-6 max-w-5xl mx-auto space-y-8 pb-40">
      {/* Organization JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'go4it.site',
          url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://go4it.site'),
          contactPoint: [{
            '@type': 'ContactPoint',
            email: 'go4it.gh@gmail.com',
            contactType: 'customer support',
            availableLanguage: ['ko','en','ja','zh']
          }]
        }) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'go4it.site',
          url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://go4it.site'),
          potentialAction: {
            '@type': 'SearchAction',
            target: (process.env.NEXT_PUBLIC_SITE_URL || 'https://go4it.site') + '/?q={search_term_string}',
            'query-input': 'required name=search_term_string'
          }
        }) }}
      />
      
      <section className="space-hero p-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-center relative">
        <div className="space-y-4">
          <div className="text-4xl md:text-5xl font-extrabold leading-tight">
            <div suppressHydrationWarning>{mounted ? t("hero.heading1") : ""}</div>
            <div className="text-yellow-500" suppressHydrationWarning>{mounted ? t("hero.heading2") : ""}</div>
          </div>
        </div>
        <div className="gold-stars" aria-hidden />
      </section>

      <SpreadPicker />

      <section id="form" className="space-panel p-6">
        <h2 className="text-xl font-extrabold mb-3" suppressHydrationWarning>{mounted ? t("form.title") : ""}</h2>
        <ReadingForm onSuccess={(d)=>{ setResult(d); try { const id = addToHistory(d); window.location.href = `/reading/${id}`; } catch { window.location.href = `/reading/local`; } }} onLoadingChange={setLoading} />
      </section>
      {loading && <ReadingResultSkeleton />}

      {/* 방법 선택 → 인라인 가이드 */}
      
      
      {!loading && (
        <section className="space-panel p-6">
          <History onSelect={(d)=>{ const id = addToHistory(d); window.location.href = `/reading/${id}`; }} />
        </section>
      )}

      <InlineGuides />

     
    </main>
  );
}
