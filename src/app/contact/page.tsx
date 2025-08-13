"use client";
import { useI18n } from "@/lib/i18n";
export default function ContactPage() {
  const { t } = useI18n();
  return (
    <main className="prose prose-invert max-w-3xl mx-auto p-6 space-panel">
      <h1>{t('nav.contact')}</h1>
      <p>{t('contact.email')} <a href="mailto:go4it.gh@gmail.com">go4it.gh@gmail.com</a></p>
      <p className="text-sm opacity-70">{t('contact.note')}</p>
    </main>
  );
}


