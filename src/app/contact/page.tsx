"use client";
import { useI18n } from "@/lib/i18n";
import { useCallback, useMemo, useState } from "react";
export default function ContactPage() {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const target = useMemo(()=>"go4it.gh@gmail.com", []);
  const onSubmit = useCallback(async (e: React.FormEvent)=>{
    e.preventDefault();
    const subject = encodeURIComponent(`[문의] ${name || "무제"}`);
    const body = encodeURIComponent(`From: ${name}\nEmail: ${email}\n\n${message}`);
    const href = `mailto:${target}?subject=${subject}&body=${body}`;
    try {
      window.location.href = href;
    } catch {
      try {
        await navigator.clipboard.writeText(`To: ${target}\nSubject: ${decodeURIComponent(subject)}\n\n${message}`);
        setCopied(true);
      } catch {}
    }
  }, [name, email, message, target]);
  return (
    <main className="prose prose-invert max-w-3xl mx-auto p-6 space-panel">
      <h1>{t('nav.contact')}</h1>
      <p>{t('contact.email')} <a href="mailto:go4it.gh@gmail.com">go4it.gh@gmail.com</a></p>
      <p className="text-sm opacity-70">{t('contact.note')}</p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-3">
        <label className="grid gap-1">
          <span className="text-sm opacity-80">이름</span>
          <input value={name} onChange={(e)=>setName(e.target.value)} className="space-input" placeholder="홍길동" required />
        </label>
        <label className="grid gap-1">
          <span className="text-sm opacity-80">이메일</span>
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="space-input" placeholder="you@example.com" required />
        </label>
        <label className="grid gap-1">
          <span className="text-sm opacity-80">메시지</span>
          <textarea value={message} onChange={(e)=>setMessage(e.target.value)} className="space-textarea" rows={6} placeholder="문의 내용을 적어주세요." required />
        </label>
        <div className="flex items-center gap-2">
          <button type="submit" className="retro-btn">메일 보내기</button>
          {copied && <span className="text-xs opacity-70">메일 클라이언트 실행이 차단되어 내용을 클립보드에 복사했어요.</span>}
        </div>
        <p className="text-xs opacity-60">제출 시 문의 내용이 `mailto`를 통해 기본 메일 클라이언트로 전달됩니다. 개인정보는 서버에 저장하지 않습니다.</p>
      </form>
    </main>
  );
}


