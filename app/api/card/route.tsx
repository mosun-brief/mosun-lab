import { ImageResponse } from "next/og";

// 인스타그램 카드 생성기 (1080x1350, 4:5)
// 사용법: /api/card?eyebrow=LOG 001&title=첫 줄|둘째 줄&footer=모순책장
//  - title: '|' 로 줄바꿈
//  - 브라우저에서 열고 이미지를 저장하면 바로 업로드용 카드가 됩니다.

export const dynamic = "force-dynamic";

const WIDTH = 1080;
const HEIGHT = 1350;

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const eyebrow = (searchParams.get("eyebrow") || "응급실 밖 기록").slice(
    0,
    40
  );
  const title = (
    searchParams.get("title") ||
    "응급실에서는 환자를 봅니다.|응급실 밖에서는 AI와 함께 회사를 만들어 나갑니다."
  ).slice(0, 240);
  const footer = (
    searchParams.get("footer") || "모순책장 — mosunbrief.kr"
  ).slice(0, 60);

  const lines = title.split("|").map((line) => line.trim());
  const fontText = eyebrow + lines.join("") + footer;
  const fontData = await loadGoogleFont("Noto+Serif+KR:wght@700", fontText);

  // 프로필 그리드(3:4) 크롭을 견디는 안전 영역: 좌우 여백을 넉넉히 두고,
  // 가장 긴 줄이 그 안에 들어가도록 글자 크기를 자동 조절합니다.
  const contentWidth = WIDTH - 150 * 2;
  const longestLine = Math.max(...lines.map((line) => line.length), 1);
  const fontSize = Math.max(
    36,
    Math.min(60, Math.floor(contentWidth / longestLine))
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 150px",
          backgroundColor: "#faf9f5",
          color: "#1f1e1d",
          fontFamily: "NotoSerifKR",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 31,
            color: "#a34e31",
            marginBottom: 40,
          }}
        >
          {eyebrow}
        </div>
        <svg width={300} height={60} viewBox="0 0 240 48">
          <polyline
            points="2,30 70,30 84,30 94,8 106,44 116,30 152,30 238,30"
            fill="none"
            stroke="#c6613f"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
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
        <div
          style={{
            display: "flex",
            marginTop: 80,
            fontSize: 30,
            color: "#6f6a5f",
          }}
        >
          {footer}
        </div>
      </div>
    ),
    {
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
    }
  );
}
