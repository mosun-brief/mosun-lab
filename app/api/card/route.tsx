import { ImageResponse } from "next/og";

// 인스타그램 카드 생성기 (1080x1350, 4:5) — 캐러셀용 4종 템플릿.
//
// 공통 파라미터: eyebrow, footer, kind
//  - kind=hook   (기본): 큰 선언 문장. title='|' 로 줄바꿈.
//  - kind=quote  : 본문에서 뽑은 인용/한 문장. title='|' 로 줄바꿈.
//  - kind=metric : 공개 지표 3종. sub(구독자 수), rev(수익), works(작품 수).
//  - kind=cta    : 마지막 카드. title(행동유도 문구), footer(도메인)로 알약 버튼.
//
// 예) /api/card?eyebrow=LOG 001&title=첫 줄|둘째 줄&footer=모순책장 — mosunbrief.kr
//     /api/card?kind=metric&sub=2&rev=₩0&works=1개
//     /api/card?kind=cta&title=프로필 링크에서|전체 기록과 구독을&footer=mosunbrief.kr
//
// 브라우저에서 열고 이미지를 저장하면 바로 업로드용 카드가 됩니다.
// (여러 장을 한 번에 만들려면 scripts/build-carousel.mjs 를 쓰세요.)

export const dynamic = "force-dynamic";

const WIDTH = 1080;
const HEIGHT = 1350;

// 브랜드 색 (globals.css / opengraph-image.tsx 와 동일)
const PAPER = "#faf9f5";
const INK = "#1f1e1d";
const CLAY = "#c6613f";
const CLAY_DARK = "#a34e31";
const MUTED = "#6f6a5f";

async function loadGoogleFont(family: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(
    text
  )}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(
    /src: url\((.+?)\) format\('(opentype|truetype)'\)/
  );

  if (!resource) {
    throw new Error("Failed to load font for card image");
  }

  const response = await fetch(resource[1]);
  return response.arrayBuffer();
}

// 프로필 그리드(3:4) 크롭을 견디는 안전 영역 안에서, 가장 긴 줄이
// 들어가도록 글자 크기를 자동 조절합니다.
function autoFontSize(lines: string[], contentWidth: number, min: number, max: number) {
  const longest = Math.max(...lines.map((line) => line.length), 1);
  return Math.max(min, Math.min(max, Math.floor(contentWidth / longest)));
}

function PulseLine({ width = 300, height = 60 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 240 48">
      <polyline
        points="2,30 70,30 84,30 94,8 106,44 116,30 152,30 238,30"
        fill="none"
        stroke={CLAY}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Rendered = { node: React.ReactElement; text: string };

function frame(children: React.ReactElement): React.ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 150px",
        backgroundColor: PAPER,
        color: INK,
        fontFamily: "NotoSerifKR",
      }}
    >
      {children}
    </div>
  );
}

function renderHook(eyebrow: string, title: string, footer: string): Rendered {
  const lines = title.split("|").map((line) => line.trim());
  const fontSize = autoFontSize(lines, WIDTH - 150 * 2, 36, 60);

  return {
    text: eyebrow + lines.join("") + footer,
    node: frame(
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: 31, color: CLAY_DARK, marginBottom: 40 }}>
          {eyebrow}
        </div>
        <PulseLine />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 48,
            fontSize,
            fontWeight: 700,
            lineHeight: 1.6,
            letterSpacing: "-0.02em",
          }}
        >
          {lines.map((line, index) => (
            <span key={index}>{line}</span>
          ))}
        </div>
        <div style={{ display: "flex", marginTop: 80, fontSize: 30, color: MUTED }}>
          {footer}
        </div>
      </div>
    ),
  };
}

function renderQuote(eyebrow: string, title: string, footer: string): Rendered {
  const lines = title.split("|").map((line) => line.trim());
  const fontSize = autoFontSize(lines, WIDTH - 140 * 2, 38, 60);

  return {
    text: eyebrow + lines.join("") + footer + "“",
    node: frame(
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: 30, color: CLAY_DARK, marginBottom: 8 }}>
          {eyebrow}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 150,
            lineHeight: 1,
            color: CLAY,
            marginBottom: 4,
          }}
        >
          {"“"}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize,
            fontWeight: 700,
            lineHeight: 1.55,
            letterSpacing: "-0.02em",
          }}
        >
          {lines.map((line, index) => (
            <span key={index}>{line}</span>
          ))}
        </div>
        <div style={{ display: "flex", marginTop: 64, fontSize: 28, color: MUTED }}>
          {footer}
        </div>
      </div>
    ),
  };
}

function renderMetric(
  eyebrow: string,
  sub: string,
  rev: string,
  works: string,
  footer: string
): Rendered {
  const subDisplay = sub ? (/^\d+$/.test(sub) ? `${sub}명` : sub) : "—";
  const rows = [
    { value: subDisplay, label: "기록 구독자" },
    { value: rev || "₩0", label: "작품 수익" },
    { value: works || "0개", label: "만든 작품" },
  ];

  return {
    text: eyebrow + footer + rows.map((r) => r.value + r.label).join(""),
    node: frame(
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: 31, color: CLAY_DARK, marginBottom: 40 }}>
          {eyebrow}
        </div>
        <PulseLine />
        <div style={{ display: "flex", flexDirection: "column", marginTop: 56 }}>
          {rows.map((row, index) => (
            <div
              key={index}
              style={{ display: "flex", flexDirection: "column", marginBottom: 44 }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 104,
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                }}
              >
                {row.value}
              </div>
              <div style={{ display: "flex", marginTop: 10, fontSize: 30, color: MUTED }}>
                {row.label}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", marginTop: 12, fontSize: 28, color: MUTED }}>
          {footer}
        </div>
      </div>
    ),
  };
}

function renderCta(eyebrow: string, title: string, footer: string): Rendered {
  const lines = title.split("|").map((line) => line.trim());
  const fontSize = autoFontSize(lines, WIDTH - 150 * 2, 40, 62);
  const pill = `${footer} →`;

  return {
    text: eyebrow + lines.join("") + pill,
    node: frame(
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: 31, color: CLAY_DARK, marginBottom: 40 }}>
          {eyebrow}
        </div>
        <PulseLine />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 48,
            fontSize,
            fontWeight: 700,
            lineHeight: 1.5,
            letterSpacing: "-0.02em",
          }}
        >
          {lines.map((line, index) => (
            <span key={index}>{line}</span>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 72,
            padding: "20px 44px",
            border: `3px solid ${CLAY}`,
            borderRadius: 999,
            color: CLAY_DARK,
            fontSize: 32,
            alignSelf: "flex-start",
          }}
        >
          {pill}
        </div>
      </div>
    ),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const kind = (searchParams.get("kind") || "hook").toLowerCase();
  const eyebrow = (searchParams.get("eyebrow") || "응급실 밖 기록").slice(0, 40);
  const footer = (
    searchParams.get("footer") || "모순책장 — mosunbrief.kr"
  ).slice(0, 60);

  let rendered: Rendered;

  if (kind === "metric") {
    rendered = renderMetric(
      searchParams.get("eyebrow") ? eyebrow : "공개 지표",
      (searchParams.get("sub") || "").slice(0, 20),
      (searchParams.get("rev") || "").slice(0, 20),
      (searchParams.get("works") || "").slice(0, 20),
      footer
    );
  } else {
    const title = (
      searchParams.get("title") ||
      "응급실에서는 환자를 봅니다.|응급실 밖에서는 AI와 함께 회사를 만들어 나갑니다."
    ).slice(0, 240);

    if (kind === "quote") {
      rendered = renderQuote(eyebrow, title, footer);
    } else if (kind === "cta") {
      rendered = renderCta(eyebrow, title, footer);
    } else {
      rendered = renderHook(eyebrow, title, footer);
    }
  }

  const fontData = await loadGoogleFont("Noto+Serif+KR:wght@700", rendered.text);

  return new ImageResponse(rendered.node, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      {
        name: "NotoSerifKR",
        data: fontData,
        weight: 700,
        style: "normal",
      },
    ],
  });
}
