// 인스타그램 캐러셀 한 벌을 폴더로 내려받습니다.
//
//   npm run carousel -- 1                 (LOG 001, dev 서버 http://localhost:3000)
//   npm run carousel -- 1 --base https://mosunbrief.kr
//   npm run carousel -- 001-experiment-rules
//
// 결과: carousel-out/<slug>/01-hook.png ... + caption.txt
// dev 서버(npm run dev)나 배포본이 떠 있어야 카드가 렌더됩니다.

import fs from "node:fs/promises";
import path from "node:path";

function parseArgs(argv) {
  const args = { base: "http://localhost:3000", target: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--base") {
      args.base = argv[++i];
    } else if (a.startsWith("--base=")) {
      args.base = a.slice("--base=".length);
    } else if (!args.target) {
      args.target = a;
    }
  }
  return args;
}

async function main() {
  const { base, target } = parseArgs(process.argv.slice(2));

  if (!target) {
    console.error("사용법: npm run carousel -- <로그번호|slug> [--base URL]");
    process.exit(1);
  }

  const isNumber = /^\d+$/.test(target);
  const query = isNumber ? `no=${Number(target)}` : `slug=${encodeURIComponent(target)}`;
  const planUrl = `${base.replace(/\/$/, "")}/api/carousel?${query}`;

  console.log(`계획 요청: ${planUrl}`);
  const res = await fetch(planUrl);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`계획 요청 실패 (${res.status}). ${body}`);
  }
  const plan = await res.json();
  if (!plan.ok) {
    throw new Error(plan.message || "계획 생성 실패");
  }

  const outDir = path.join(process.cwd(), "carousel-out", plan.slug);
  await fs.mkdir(outDir, { recursive: true });

  console.log(`LOG ${String(plan.no).padStart(3, "0")} — 슬라이드 ${plan.count}장`);

  for (const slide of plan.slides) {
    const imgRes = await fetch(slide.url);
    if (!imgRes.ok) {
      throw new Error(`카드 렌더 실패 (${imgRes.status}) — ${slide.kind}\n${slide.url}`);
    }
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const fileName = `${String(slide.index).padStart(2, "0")}-${slide.kind}.png`;
    await fs.writeFile(path.join(outDir, fileName), buf);
    console.log(`  ✓ ${fileName}`);
  }

  await fs.writeFile(path.join(outDir, "caption.txt"), plan.caption, "utf-8");
  console.log(`  ✓ caption.txt`);
  console.log(`\n완료 → ${outDir}`);
  console.log("이미지를 검수한 뒤 인스타그램에 순서대로 올리고, caption.txt 내용을 붙여넣으세요.");
}

main().catch((err) => {
  console.error("\n오류:", err.message);
  process.exit(1);
});
