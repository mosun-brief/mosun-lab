import { ImageResponse } from "next/og";

export const alt = "모순책장 — 응급실 밖 기록";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LINE_1 = "응급실에서는 환자를 봅니다.";
const LINE_2 = "응급실 밖에서는 AI와 회사를 짓습니다.";
const FOOTER = "모순책장 · 응급실 밖 기록 — mosunbrief.kr";

async function loadGoogleFont(family: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(
    text
  )}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(
    /src: url\((.+?)\) format\('(opentype|truetype)'\)/
  );

  if (!resource) {
    throw new Error("Failed to load font for og image");
  }

  const response = await fetch(resource[1]);
  return response.arrayBuffer();
}

export default async function OgImage() {
  const text = LINE_1 + LINE_2 + FOOTER;
  const fontData = await loadGoogleFont("Noto+Serif+KR:wght@700", text);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 88px",
          backgroundColor: "#faf9f5",
          color: "#1f1e1d",
          fontFamily: "NotoSerifKR",
        }}
      >
        <svg width={280} height={56} viewBox="0 0 240 48">
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
            marginTop: 36,
            fontSize: 58,
            fontWeight: 700,
            lineHeight: 1.45,
            letterSpacing: "-0.02em",
          }}
        >
          <span>{LINE_1}</span>
          <span>{LINE_2}</span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 52,
            fontSize: 27,
            color: "#6f6a5f",
          }}
        >
          {FOOTER}
        </div>
      </div>
    ),
    {
      ...size,
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
