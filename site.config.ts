// 사이트 전역 설정 — 채널 링크와 공개 지표는 여기서만 수정하면 됩니다.

export const site = {
  name: "모순책장",
  tagline:
    "응급실에서는 환자를 봅니다. 응급실 밖에서는 AI와 함께 회사를 만들어 나갑니다.",
  description:
    "응급의학과 의사가 AI와 협업하며 1인 기업을 만들어가는 기록",
  hypothesis:
    "응급실 밖에서, 의사 혼자서도, AI와 협업하면 수익을 내는 1인 기업을 만들 수 있다.",
  author: "모순책장",
  // 기록을 시작한 날 — 선언문 발행일로 맞춰주세요.
  startDate: "2026-07-12",
};

export const channels = [
  {
    name: "네이버 블로그",
    role: "독서 · 서평",
    description: "읽은 책에서 건진 의사결정 프레임들",
    url: "https://blog.naver.com/greenapple_98",
  },
  {
    name: "Mosun Brief",
    role: "첫 작품",
    description: "AI 학습자를 위한 맞춤 브리핑 서비스",
    url: "https://brief.mosunbrief.kr/",
  },
  {
    name: "인스타그램",
    role: "기록 카드",
    description: "기록의 장면들을 카드로",
    url: "https://www.instagram.com/mosun.log",
  },
  {
    name: "쓰레드",
    role: "짧은 생각",
    description: "기록 사이의 메모",
    url: "https://www.threads.net/@mosun.log",
  },
];

// 공개 지표 — 구독자 수와 기록 수는 자동 집계되고, 아래 둘만 직접 갱신합니다.
// 0에서 시작하는 것 자체가 콘텐츠입니다.
export const metrics = {
  revenue: "₩0",
  works: "1개",
};
