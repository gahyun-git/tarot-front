import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, VT323, Orbit } from "next/font/google";
// import localFont from "next/font/local";
import "./globals.css";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const vt323 = VT323({
  variable: "--font-retro",
  weight: "400",
  subsets: ["latin"],
});

const orbit = Orbit({
  variable: "--font-orbit",
  weight: ["400"],
  subsets: ["latin"],
});
// const pretendard = localFont({
//   src: [{ path: "../../public/PretendardVariable.woff2", weight: "45 920" }],
//   variable: "--font-pretendard",
//   display: "swap",
// });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://go4it.site"),
  title: {
    default: "Tarot Reading | go4it.site",
    template: "%s | go4it.site",
  },
  description: "AI 기반 타로 리딩: 질문 입력, 카드 배치, 결과 해석까지 한 번에.",
  keywords: ["tarot", "타로", "reading", "AI", "interpretation", "tarot spread"],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  other: {
    'google-adsense-account': 'ca-pub-8015585586602031',
  },
  openGraph: {
    type: "website",
    title: "Tarot Reading",
    description: "AI 기반 타로 리딩",
    url: "/",
    siteName: "go4it.site",
    images: [
      { url: "/card-retro.png", width: 1200, height: 630, alt: "Tarot" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@",
    title: "Tarot Reading",
    description: "AI 기반 타로 리딩",
    images: ["/card-retro.png"],
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // client-only parts inside body
  return (
    <html lang="en" className="theme-space-dark" suppressHydrationWarning>
      <body className={`space-stars ${geistSans.variable} ${geistMono.variable} ${vt323.variable} ${orbit.variable} antialiased`} suppressHydrationWarning>
        <Providers>
          <TopBar />
          {children}
          <Footer />
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8015585586602031"
            crossOrigin="anonymous"
            data-cfasync="false"
          />
        </Providers>
      </body>
    </html>
  );
}
