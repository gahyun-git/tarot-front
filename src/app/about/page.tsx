"use client";
import { useI18n } from "@/lib/i18n";
export default function AboutPage() {
  const { t } = useI18n();
  return (
    <main className="prose prose-invert max-w-3xl mx-auto p-6 space-panel">
      <h1>{t('nav.about')}</h1>
      <p>{t('about.intro')}</p>
      <p>{t('about.disclaimer')}</p>
    </main>
  );
}


