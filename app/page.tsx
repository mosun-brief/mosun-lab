import Link from "next/link";
import SubscribeForm from "@/components/SubscribeForm";
import { getAllPosts, formatLogNo } from "@/lib/posts";
import { channels, metrics, site } from "@/site.config";

export default function HomePage() {
  const posts = getAllPosts().slice(0, 5);

  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <p className="hero-eyebrow">응급실 밖 공방 · 모든 과정 공개</p>
          <h1>
            응급실에서는 환자를 봅니다.
            <br />
            응급실 밖에서는 <em>AI와 회사</em>를 짓습니다.
          </h1>
          <p className="hero-desc">
            응급의학과 의사가 AI와 협업하며 1인 기업을 만들어가는 공방입니다.
            숫자는 0부터 전부 공개하고, 실패도 기록하고, 따라 할 수 있게
            씁니다.
          </p>
          <div className="hypothesis">
            <span className="hypothesis-label">이 공방의 가설</span>
            {site.hypothesis}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="section-head">공개 지표 · {metrics.updatedAt} 기준</h2>
          <div className="metrics">
            {metrics.items.map((item) => (
              <div className="metric" key={item.label}>
                <div className="metric-value">{item.value}</div>
                <div className="metric-label">{item.label}</div>
              </div>
            ))}
          </div>
          <p className="metrics-note">
            규칙 1번: 숫자를 전부 공개합니다 — 0인 지금부터.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="section-head">최근 공방 일지</h2>
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

      <section className="section">
        <div className="wrap">
          <h2 className="section-head">공방이 뻗어 있는 곳</h2>
          <div className="channels">
            {channels.map((channel) => (
              <a
                className="channel"
                key={channel.name}
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="channel-role">{channel.role}</span>
                <div className="channel-name">{channel.name}</div>
                <div className="channel-desc">{channel.description}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <SubscribeForm />
        </div>
      </section>
    </main>
  );
}
