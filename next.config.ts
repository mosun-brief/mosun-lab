import type { NextConfig } from "next";

// 보안 응답 헤더. CSP는 Next의 인라인 하이드레이션 스크립트('unsafe-inline'),
// 동일 출처 fetch, 브라우저에서의 Supabase 접근(connect-src)을 허용하도록 구성했습니다.
// 'unsafe-eval'은 개발 모드에서만 허용 — React dev 도구가 eval을 요구하며,
// 프로덕션에서는 React가 eval을 쓰지 않으므로 프로덕션 CSP는 그대로 엄격합니다.
const isDev = process.env.NODE_ENV === "development";
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "object-src 'none'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "connect-src 'self' https://*.supabase.co",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  // 두 번째 작품 '그림이 읽히는 눈' — public/art의 정적 사이트로 연결
  async redirects() {
    return [
      { source: "/art", destination: "/art/index.html", permanent: false },
    ];
  },
};

export default nextConfig;
