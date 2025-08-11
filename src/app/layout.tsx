import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// import localFont from "next/font/local";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try{
                  var saved = localStorage.getItem('theme_dark_v1');
                  var dark = saved ? saved === '1' : window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var root = document.documentElement;
                  if(dark){ root.classList.add('dark'); root.classList.remove('light'); }
                  else { root.classList.add('light'); root.classList.remove('dark'); }
                }catch(e){}
              })();
            `,
          }}
        />
        <Providers>
          <div className="p-4 flex justify-end"><div className="max-w-3xl w-full mx-auto"><ThemeToggle /></div></div>
          {children}
        </Providers>
      </body>
    </html>
  );
}
