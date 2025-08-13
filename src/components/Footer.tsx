"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="space-panel mt-10">
      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap items-center gap-4 text-sm opacity-90">
          <Link href="/about" className="hover:opacity-100 underline-offset-4 hover:underline">{t("nav.about")}</Link>
          <Link href="/privacy" className="hover:opacity-100 underline-offset-4 hover:underline">{t("nav.privacy")}</Link>
          <Link href="/terms" className="hover:opacity-100 underline-offset-4 hover:underline">{t("nav.terms")}</Link>
          <Link href="/contact" className="hover:opacity-100 underline-offset-4 hover:underline">{t("nav.contact")}</Link>
        </nav>
        <div className="text-xs opacity-60">© {new Date().getFullYear()} go4it.site</div>
      </div>
    </footer>
  );
}


