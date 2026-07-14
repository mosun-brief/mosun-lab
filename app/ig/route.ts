// 인스타그램 링크인바이오용 추적 리다이렉트.
//
// 인스타 프로필 링크를 https://www.mosunbrief.kr/ig 로 걸어두면,
// 여기 들르는 방문자에게 ref=instagram 쿠키를 심고 구독 폼으로 보냅니다.
// 그 뒤 구독하면 /api/subscribe 가 쿠키를 읽어 signup_source='instagram' 으로
// 저장합니다 → 인스타가 실제로 구독자를 데려오는지 숫자로 확인할 수 있습니다.

export const dynamic = "force-dynamic";

const REF_MAX_AGE = 60 * 60 * 24 * 30; // 30일 귀속 창

export function GET(request: Request) {
  const url = new URL(request.url);
  const isHttps = url.protocol === "https:";
  const location = new URL("/#subscribe", url).toString();

  const cookie = [
    "ref=instagram",
    "Path=/",
    `Max-Age=${REF_MAX_AGE}`,
    "HttpOnly",
    "SameSite=Lax",
    isHttps ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");

  return new Response(null, {
    status: 307,
    headers: {
      Location: location,
      "Set-Cookie": cookie,
    },
  });
}
