import fs from "fs";
import path from "path";
import matter from "gray-matter";

// 책장(서평) 캐러셀의 원천 데이터 — content/book/*.md
// 서평 원문은 네이버 블로그에 있고, 여기에는 인스타 카드에 필요한
// 최소 정보(책·저자·프레임·슬라이드 문장)만 둡니다.

const BOOK_DIR = path.join(process.cwd(), "content", "book");

export type BookMeta = {
  slug: string;
  no: number;
  book: string; // 책 제목 ('|' 로 카드 줄바꿈)
  author: string;
  publisher: string;
  date: string;
  summary: string;
};

export type BookRaw = {
  meta: BookMeta;
  frontmatter: Record<string, unknown>;
};

function readBookFile(fileName: string): BookRaw {
  const slug = fileName.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(BOOK_DIR, fileName), "utf-8");
  const { data } = matter(raw);

  return {
    meta: {
      slug,
      no: Number(data.no) || 0,
      book: String(data.book || slug),
      author: String(data.author || ""),
      publisher: String(data.publisher || ""),
      date: String(data.date || ""),
      summary: String(data.summary || ""),
    },
    frontmatter: data as Record<string, unknown>,
  };
}

export function getAllBooks(): BookMeta[] {
  if (!fs.existsSync(BOOK_DIR)) return [];

  return fs
    .readdirSync(BOOK_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => readBookFile(file).meta)
    .sort((a, b) => b.no - a.no);
}

export function getBookRaw(slug: string): BookRaw | null {
  const filePath = path.join(BOOK_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  return readBookFile(`${slug}.md`);
}

export function formatBookNo(no: number) {
  return `책장 ${String(no).padStart(3, "0")}`;
}
