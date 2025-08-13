"use client";
import { useI18n } from "@/lib/i18n";
export default function TermsPage() {
  const { t } = useI18n();
  return (
    <main className="prose prose-invert max-w-3xl mx-auto p-6 space-panel">
      <h1>{t('nav.terms')}</h1>
      <p>{t('terms.intro')}</p>
    </main>
  );
}


