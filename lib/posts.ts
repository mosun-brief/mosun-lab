import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const LOG_DIR = path.join(process.cwd(), "content", "log");

export type PostMeta = {
  slug: string;
  no: number;
  title: string;
  date: string;
  summary: string;
};

export type Post = PostMeta & {
  html: string;
};

function readPostFile(fileName: string): { meta: PostMeta; content: string } {
  const slug = fileName.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(LOG_DIR, fileName), "utf-8");
  const { data, content } = matter(raw);

  return {
    meta: {
      slug,
      no: Number(data.no) || 0,
      title: String(data.title || slug),
      date: String(data.date || ""),
      summary: String(data.summary || ""),
    },
    content,
  };
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(LOG_DIR)) return [];

  return fs
    .readdirSync(LOG_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => readPostFile(file).meta)
    .sort((a, b) => b.no - a.no);
}

export function getPost(slug: string): Post | null {
  const filePath = path.join(LOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const { meta, content } = readPostFile(`${slug}.md`);
  const html = marked.parse(content, { async: false });

  return { ...meta, html };
}

export type PostRaw = {
  meta: PostMeta;
  body: string;
  frontmatter: Record<string, unknown>;
};

// 캐러셀 생성기가 프론트매터 전체(carousel 블록 포함)와 원문 본문을 읽을 때 씁니다.
export function getPostRaw(slug: string): PostRaw | null {
  const filePath = path.join(LOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    meta: {
      slug,
      no: Number(data.no) || 0,
      title: String(data.title || slug),
      date: String(data.date || ""),
      summary: String(data.summary || ""),
    },
    body: content,
    frontmatter: data as Record<string, unknown>,
  };
}

export function formatLogNo(no: number) {
  return `LOG ${String(no).padStart(3, "0")}`;
}
