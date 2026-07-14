import { NextResponse } from "next/server";
import {
  buildBookCarouselPlan,
  buildCarouselPlan,
  slideToCardQuery,
} from "@/lib/carousel";
import { getAllBooks } from "@/lib/books";
import { getLabSubscriberCount, getSubscriberCountBySource } from "@/lib/metrics";
import { getAllPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

// 로그/책장 한 편의 인스타그램 캐러셀 계획을 JSON으로 돌려줍니다.
// 각 슬라이드에는 바로 저장할 수 있는 /api/card 절대 URL이 붙습니다.
//
//  GET /api/carousel?no=1                    (LOG — content/log)
//  GET /api/carousel?slug=001-experiment-rules
//  GET /api/carousel?book=1                  (책장 — content/book, 번호 또는 slug)
//  GET /api/carousel?book=001-ai-bias
//
// scripts/build-carousel.mjs 가 이 응답을 받아 PNG와 캡션을 폴더로 내려받습니다.

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slugParam = url.searchParams.get("slug");
  const noParam = url.searchParams.get("no");
  const bookParam = url.searchParams.get("book");

  const [subscriberCount, instagramCount] = await Promise.all([
    getLabSubscriberCount(),
    getSubscriberCountBySource("instagram"),
  ]);
  const counts = { subscriberCount, instagramCount };

  let plan = null;
  let missing = "";

  if (bookParam) {
    let bookSlug: string | null = bookParam;
    if (/^\d+$/.test(bookParam)) {
      const no = Number(bookParam);
      bookSlug = getAllBooks().find((b) => b.no === no)?.slug ?? null;
    }
    plan = bookSlug ? buildBookCarouselPlan(bookSlug, counts) : null;
    missing = `책을 찾을 수 없습니다: ${bookParam}`;
  } else {
    let slug = slugParam;
    if (!slug && noParam) {
      const no = Number(noParam);
      slug = getAllPosts().find((post) => post.no === no)?.slug ?? null;
    }

    if (!slug) {
      return NextResponse.json(
        { ok: false, message: "no, slug 또는 book 파라미터가 필요합니다." },
        { status: 400 }
      );
    }

    plan = buildCarouselPlan(slug, counts);
    missing = `로그를 찾을 수 없습니다: ${slug}`;
  }

  if (!plan) {
    return NextResponse.json({ ok: false, message: missing }, { status: 404 });
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
