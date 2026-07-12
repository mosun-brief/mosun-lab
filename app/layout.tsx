import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { site } from "@/site.config";

const notoSerif = Noto_Serif_KR({
  variable: "--font-noto-serif",
  weight: ["400", "600", "700", "900"],
  subsets: ["latin"],
});

const notoSans = Noto_Sans_KR({
  variable: "--font-noto-sans",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} — 응급실 밖 기록`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
};

function PulseGlyph() {
  return (
    <svg width={34} height={20} viewBox="0 0 68 40" aria-hidden="true">
      <polyline
        points="2,24 20,24 26,24 32,6 40,36 46,24 54,24 66,24"
        fill="none"
        stroke="var(--clay)"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSerif.variable} ${notoSans.variable}`}>
      <body>
        <header className="masthead">
          <div className="wrap masthead-inner">
            <Link href="/" className="brand">
              <PulseGlyph />
              모순책장<span className="brand-dot">.</span>
            </Link>
            <nav className="nav" aria-label="주요 메뉴">
              <Link href="/log">기록들</Link>
              <Link href="/about">소개</Link>
              <Link href="/#subscribe" className="nav-cta">
                구독
              </Link>
            </nav>
          </div>
        </header>

        {children}

        <footer className="footer">
          <div className="wrap footer-inner">
            <span>© {new Date().getFullYear()} 모순책장 · 응급실 밖 기록</span>
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
