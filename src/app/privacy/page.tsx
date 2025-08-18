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
      <p className="text-sm opacity-80">Google AdSense는 쿠키 및 광고 식별자를 사용할 수 있으며, 개인 맞춤형 광고를 원치 않으시면 브라우저/구글 광고 설정에서 옵트아웃할 수 있습니다.</p>
      <p>{t('privacy.contact')}<a href="mailto:go4it.gh@gmail.com">go4it.gh@gmail.com</a></p>
    </main>
  );
}


