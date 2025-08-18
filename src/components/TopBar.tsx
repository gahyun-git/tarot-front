"use client";
// ThemeToggle removed
import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function TopBar() {
  const { t, locale, setLocale } = useI18n();
  const [mounted, setMounted] = useState(false);
  useEffect(()=>{ setMounted(true); }, []);
  return (
    <header className="space-header">
      <div className="inner max-w-5xl mx-auto px-4 flex items-center justify-between gap-2">
        <nav className="flex items-center gap-3">
          <Link href="/" className="space-brand">
            <span>🔮 Tarot</span>
          </Link>
          <Link href="/cards" className="hidden sm:inline-block hover:underline underline-offset-4 opacity-90 hover:opacity-100">{t("nav.cards")}</Link>
          <Link href="/about" className="hidden sm:inline-block hover:underline underline-offset-4 opacity-90 hover:opacity-100">{t("nav.about")}</Link>
          <Link href="/privacy" className="hidden sm:inline-block hover:underline underline-offset-4 opacity-90 hover:opacity-100">{t("nav.privacy")}</Link>
          <Link href="/terms" className="hidden sm:inline-block hover:underline underline-offset-4 opacity-90 hover:opacity-100">{t("nav.terms")}</Link>
          <Link href="/contact" className="hidden sm:inline-block hover:underline underline-offset-4 opacity-90 hover:opacity-100">{t("nav.contact")}</Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <label className="text-xs md:text-sm" suppressHydrationWarning>{mounted ? t("form.lang") : ""}</label>
          <select
            className="space-select w-28 text-base"
            suppressHydrationWarning
            value={mounted ? locale : undefined}
            defaultValue="ko"
            onChange={(e)=> setLocale(e.target.value as "ko"|"en"|"ja"|"zh")}
          >
            <option value="ko">한국어</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
            <option value="zh">中文</option>
          </select>
          {/* 다크모드 제거 */}
        </div>
      </div>
    </header>
  );
}


