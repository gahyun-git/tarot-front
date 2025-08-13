"use client";
import { useI18n } from "@/lib/i18n";
export default function PrivacyPage() {
  const { t } = useI18n();
  return (
    <main className="prose prose-invert max-w-3xl mx-auto p-6 space-panel">
      <h1>{t('nav.privacy')}</h1>
      <p>{t('privacy.intro')}</p>
      <ul>
        <li>{t('privacy.list.local')}</li>
        <li>{t('privacy.list.logs')}</li>
        <li>{t('privacy.list.third')}</li>
      </ul>
      <p>{t('privacy.contact')}<a href="mailto:go4it.gh@gmail.com">go4it.gh@gmail.com</a></p>
    </main>
  );
}


