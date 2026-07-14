import { formatBookNo, getBookRaw } from "./books";
import { formatLogNo, getPostRaw } from "./posts";
import { metrics as configMetrics } from "@/site.config";

// 로그 한 편을 인스타그램 캐러셀 계획(슬라이드 + 캡션)으로 바꿉니다.
//
// 로그 프론트매터에 carousel 블록이 있으면 그대로 씁니다. 없으면 훅·지표·
// CTA 3장을 자동으로 만듭니다. 본문에서 임의로 문장을 뽑아내지는 않습니다 —
// 어떤 문장을 카드로 낼지는 사람이 정하는 게 맞아서, 원하는 문장은
// carousel.slides 에 직접 적습니다.
//
// content/log/00X.md 프론트매터 예:
//   carousel:
//     hook: "구독자 2명. 그래도 회사를 만듭니다."
//     slides:
//       - "접은 아이디어도|여기 남깁니다"
//       - "AI가 못 하는 건|아직 판단입니다"
//     metric: true            # 지표 카드 넣기 (기본 true)
//     cta: "프로필 링크에서|전체 기록과 구독을"
//     caption: "...직접 쓴 캡션..."
//     hashtags: ["#1인기업", "#빌드인퍼블릭"]

export type SlideKind = "hook" | "quote" | "book" | "metric" | "cta";

export type Slide = {
  kind: SlideKind;
  eyebrow?: string;
  title?: string;
  author?: string;
  footer?: string;
  sub?: string;
  ig?: string;
  rev?: string;
  works?: string;
};

export type CarouselPlan = {
  slug: string;
  no: number;
  caption: string;
  slides: Slide[];
};

type CarouselFrontmatter = {
  hook?: string;
  slides?: string[];
  metric?: boolean;
  cta?: string;
  caption?: string;
  hashtags?: string[];
};

const FOOTER = "모순책장 — mosunbrief.kr";
const DEFAULT_HASHTAGS = [
  "#1인기업",
  "#빌드인퍼블릭",
  "#AI활용",
  "#의사창업",
  "#모순책장",
];

export function buildCarouselPlan(
  slug: string,
  opts: { subscriberCount?: number | null; instagramCount?: number | null } = {}
): CarouselPlan | null {
  const raw = getPostRaw(slug);
  if (!raw) return null;

  const { meta, frontmatter } = raw;
  const cfg = ((frontmatter.carousel as CarouselFrontmatter | undefined) ??
    {}) as CarouselFrontmatter;
  const logNo = formatLogNo(meta.no);

  const slides: Slide[] = [];

  // 1) 훅 — 첫 장. carousel.hook 이 있으면 그걸, 없으면 요약을 씁니다.
  slides.push({
    kind: "hook",
    eyebrow: logNo,
    title: cfg.hook || meta.summary || meta.title,
    footer: FOOTER,
  });

  // 2) 본문 인용 — 저자가 직접 고른 문장들.
  for (const line of cfg.slides ?? []) {
    if (!line?.trim()) continue;
    slides.push({ kind: "quote", eyebrow: logNo, title: line, footer: FOOTER });
  }

  // 3) 지표 — 0에서 시작하는 것 자체가 콘텐츠. 기본 포함.
  if (cfg.metric !== false) {
    const count = opts.subscriberCount;
    const igCount = opts.instagramCount;
    slides.push({
      kind: "metric",
      eyebrow: "공개 지표",
      sub: count == null ? "" : String(count),
      ig: igCount == null ? undefined : String(igCount),
      rev: configMetrics.revenue,
      works: configMetrics.works,
      footer: FOOTER,
    });
  }

  // 4) CTA — 마지막 장. 이메일 리스트로 보내는 깔때기.
  slides.push({
    kind: "cta",
    eyebrow: "다음 기록을 놓치지 않으려면",
    title: cfg.cta || "프로필 링크에서|전체 기록과 구독을",
    footer: "mosunbrief.kr",
  });

  const caption =
    cfg.caption ||
    [
      `${logNo} · ${meta.title}`,
      "",
      meta.summary,
      "",
      "전체 기록과 이메일 구독은 프로필 링크(mosunbrief.kr)에서.",
      "",
      (cfg.hashtags ?? DEFAULT_HASHTAGS).join(" "),
    ].join("\n");

  return { slug, no: meta.no, caption, slides };
}

// 책장(서평) 캐러셀 — content/book/*.md 한 편을 슬라이드 + 캡션으로.
//
// 프론트매터 예:
//   no: 1
//   book: "AI조차 편향에서|벗어나지 못한다"   ('|' 로 카드 줄바꿈)
//   author: "구리야마 나오코"
//   publisher: "웨일북스"
//   summary: "..."
//   carousel:
//     hook: "..."          # 둘째 장(질문/선언). 없으면 생략
//     slides: [...]        # 인용/프레임 카드들
//     metric: true         # 지표 카드는 책장에선 기본 제외(명시할 때만)
//     cta: "..."
//     caption: |
//       ...직접 쓴 캡션...
//     hashtags: [...]
//
// 큰 그림: 책장 카드는 신뢰 지층 — 책에서 프레임을 꺼내고, AI로 검증하고,
// 프로필 링크(mosunbrief.kr 허브)로 보냅니다. 서평 전문은 네이버 블로그.

const BOOK_HASHTAGS = ["#서평", "#책추천", "#독서스타그램", "#모순책장"];

export function buildBookCarouselPlan(
  slug: string,
  opts: { subscriberCount?: number | null; instagramCount?: number | null } = {}
): CarouselPlan | null {
  const raw = getBookRaw(slug);
  if (!raw) return null;

  const { meta, frontmatter } = raw;
  const cfg = ((frontmatter.carousel as CarouselFrontmatter | undefined) ??
    {}) as CarouselFrontmatter;
  const bookNo = formatBookNo(meta.no);
  const authorLine = [meta.author, meta.publisher].filter(Boolean).join(" · ");
  const plainBook = meta.book.split("|").join(" ").trim();

  const slides: Slide[] = [];

  // 1) 책 표지 카드 — 책장 시리즈의 시그니처 첫 장.
  slides.push({
    kind: "book",
    eyebrow: bookNo,
    title: meta.book,
    author: authorLine,
    footer: FOOTER,
  });

  // 2) 훅 — 질문/선언 한 장.
  if (cfg.hook?.trim()) {
    slides.push({ kind: "hook", eyebrow: bookNo, title: cfg.hook, footer: FOOTER });
  }

  // 3) 프레임·인용 카드들.
  for (const line of cfg.slides ?? []) {
    if (!line?.trim()) continue;
    slides.push({ kind: "quote", eyebrow: bookNo, title: line, footer: FOOTER });
  }

  // 4) 지표 — 책장 캐러셀에선 기본 제외(빌드인퍼블릭 숫자는 LOG의 몫).
  if (cfg.metric === true) {
    slides.push({
      kind: "metric",
      eyebrow: "공개 지표",
      sub: opts.subscriberCount == null ? "" : String(opts.subscriberCount),
      ig: opts.instagramCount == null ? undefined : String(opts.instagramCount),
      rev: configMetrics.revenue,
      works: configMetrics.works,
      footer: FOOTER,
    });
  }

  // 5) CTA — 서평 전문(블로그)과 기록(허브)으로 가는 깔때기.
  slides.push({
    kind: "cta",
    eyebrow: "전체 서평과 검증 노트는",
    title: cfg.cta || "프로필 링크에서|서평 전체를 읽어보세요.",
    footer: "mosunbrief.kr",
  });

  const caption =
    cfg.caption ||
    [
      `${bookNo} · ${plainBook} — ${meta.author}`,
      "",
      meta.summary,
      "",
      "전체 서평은 네이버 블로그(모순책장)에, AI와 함께 1인 회사를 만드는 기록은 프로필 링크 mosunbrief.kr 에 있습니다.",
      "",
      (cfg.hashtags ?? BOOK_HASHTAGS).join(" "),
    ].join("\n");

  return { slug, no: meta.no, caption, slides };
}

// 슬라이드 하나를 /api/card 쿼리스트링으로 바꿉니다.
export function slideToCardQuery(slide: Slide): string {
  const params = new URLSearchParams();
  params.set("kind", slide.kind);
  if (slide.eyebrow) params.set("eyebrow", slide.eyebrow);
  if (slide.title) params.set("title", slide.title);
  if (slide.author) params.set("author", slide.author);
  if (slide.footer) params.set("footer", slide.footer);
  if (slide.sub !== undefined) params.set("sub", slide.sub);
  if (slide.ig !== undefined) params.set("ig", slide.ig);
  if (slide.rev !== undefined) params.set("rev", slide.rev);
  if (slide.works !== undefined) params.set("works", slide.works);
  return params.toString();
}
