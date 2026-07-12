import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, formatLogNo } from "@/lib/posts";

export const metadata: Metadata = {
  title: "공방 일지",
  description: "응급실 밖에서 AI와 1인 기업을 만드는 전 과정의 기록",
};

export default function LogListPage() {
  const posts = getAllPosts();

  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <p className="hero-eyebrow">Workshop Log</p>
          <h1>공방 일지</h1>
          <p className="hero-desc">
            숫자 공개, 실패 기록, 재현 가능한 과정 — 세 가지 규칙으로 쓰는
            기록의 전부입니다.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <ul className="log-list">
            {posts.map((post) => (
              <li className="log-item" key={post.slug}>
                <Link className="log-link" href={`/log/${post.slug}`}>
                  <span className="log-no">{formatLogNo(post.no)}</span>
                  <span className="log-title">{post.title}</span>
                  <span className="log-meta">
                    {post.date} · {post.summary}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
