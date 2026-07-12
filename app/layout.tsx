import type { Metadata } from "next";
import { Noto_Serif_KR } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { site } from "@/site.config";

const notoSerif = Noto_Serif_KR({
  variable: "--font-noto-serif",
  weight: ["400", "600", "700", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} — 응급실 밖 실험실`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={notoSerif.variable}>
      <body>
        <header className="masthead">
          <div className="wrap masthead-inner">
            <Link href="/" className="brand">
              모순책장<span className="brand-dot">.</span>
            </Link>
            <nav className="nav" aria-label="주요 메뉴">
              <Link href="/log">실험 일지</Link>
              <Link href="/about">소개</Link>
              <Link href="/#subscribe">구독</Link>
            </nav>
          </div>
        </header>

        {children}

        <footer className="footer">
          <div className="wrap footer-inner">
            <span>© {new Date().getFullYear()} 모순책장 · 응급실 밖 실험실</span>
            <span>
              <a href="https://brief.mosunbrief.kr/" rel="noopener">
                Mosun Brief
              </a>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
