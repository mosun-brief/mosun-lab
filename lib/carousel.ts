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

export type SlideKind = "hook" | "quote" | "metric" | "cta";

export type Slide = {
  kind: SlideKind;
  eyebrow?: string;
  title?: string;
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

// 슬라이드 하나를 /api/card 쿼리스트링으로 바꿉니다.
export function slideToCardQuery(slide: Slide): string {
  const params = new URLSearchParams();
  params.set("kind", slide.kind);
  if (slide.eyebrow) params.set("eyebrow", slide.eyebrow);
  if (slide.title) params.set("title", slide.title);
  if (slide.footer) params.set("footer", slide.footer);
  if (slide.sub !== undefined) params.set("sub", slide.sub);
  if (slide.ig !== undefined) params.set("ig", slide.ig);
  if (slide.rev !== undefined) params.set("rev", slide.rev);
  if (slide.works !== undefined) params.set("works", slide.works);
  return params.toString();
}
