import { NextResponse } from "next/server";
import { buildCarouselPlan, slideToCardQuery } from "@/lib/carousel";
import { getLabSubscriberCount } from "@/lib/metrics";
import { getAllPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

// 로그 한 편의 인스타그램 캐러셀 계획을 JSON으로 돌려줍니다.
// 각 슬라이드에는 바로 저장할 수 있는 /api/card 절대 URL이 붙습니다.
//
//  GET /api/carousel?no=1
//  GET /api/carousel?slug=001-experiment-rules
//
// scripts/build-carousel.mjs 가 이 응답을 받아 PNG와 캡션을 폴더로 내려받습니다.

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slugParam = url.searchParams.get("slug");
  const noParam = url.searchParams.get("no");

  let slug = slugParam;
  if (!slug && noParam) {
    const no = Number(noParam);
    slug = getAllPosts().find((post) => post.no === no)?.slug ?? null;
  }

  if (!slug) {
    return NextResponse.json(
      { ok: false, message: "no 또는 slug 파라미터가 필요합니다." },
      { status: 400 }
    );
  }

  const subscriberCount = await getLabSubscriberCount();
  const plan = buildCarouselPlan(slug, { subscriberCount });

  if (!plan) {
    return NextResponse.json(
      { ok: false, message: `로그를 찾을 수 없습니다: ${slug}` },
      { status: 404 }
    );
  }

  const origin = url.origin;
  const slides = plan.slides.map((slide, index) => ({
    index: index + 1,
    kind: slide.kind,
    url: `${origin}/api/card?${slideToCardQuery(slide)}`,
  }));

  return NextResponse.json({
    ok: true,
    slug: plan.slug,
    no: plan.no,
    count: slides.length,
    caption: plan.caption,
    slides,
  });
}
