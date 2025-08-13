import type { Metadata } from "next";
import { Geist, Geist_Mono, VT323, Orbit } from "next/font/google";
// import localFont from "next/font/local";
import "./globals.css";
import TopBar from "@/components/TopBar";
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
  title: "Tarot Front",
  description: "Tarot reading UI",
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
        </Providers>
      </body>
    </html>
  );
}
