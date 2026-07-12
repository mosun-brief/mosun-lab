import Link from "next/link";
import SubscribeForm from "@/components/SubscribeForm";
import { getLabSubscriberCount } from "@/lib/metrics";
import { getAllPosts, formatLogNo } from "@/lib/posts";
import { channels, metrics, site } from "@/site.config";

// 공개 지표(구독자 수)를 최대 5분 간격으로 다시 집계합니다.
export const revalidate = 300;

function PulseMark({ width = 220 }: { width?: number }) {
  return (
    <svg
      className="pulse"
      width={width}
      height={48}
      viewBox="0 0 240 48"
      role="img"
      aria-label="심전도 파형이 그려지는 모순책장 마크"
    >
      <polyline points="2,30 70,30 84,30 94,8 106,44 116,30 152,30 238,30" />
    </svg>
  );
}

export default async function HomePage() {
  const allPosts = getAllPosts();
  const posts = allPosts.slice(0, 5);
  const subscriberCount = await getLabSubscriberCount();

  const metricItems = [
    {
      label: "기록 구독자",
      value: `${subscriberCount ?? 0}명`,
    },
    { label: "작품 수익", value: metrics.revenue },
    { label: "발행한 기록", value: `${allPosts.length}편` },
    { label: "만든 작품", value: metrics.works },
  ];

  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <p className="hero-eyebrow rise">응급실 밖 기록 · 모든 과정 공개</p>
          <PulseMark />
          <h1 className="rise" style={{ animationDelay: "0.1s" }}>
            응급실에서는 환자를 봅니다.
            <br />
            응급실 밖에서는 <em>AI와 회사</em>를 짓습니다.
          </h1>
          <p className="hero-desc rise" style={{ animationDelay: "0.22s" }}>
            응급의학과 의사가 AI와 협업하며 1인 기업을 만들어가는 기록입니다.
            숫자는 0부터 전부 공개하고, 실패도 기록하고, 따라 할 수 있게
            씁니다.
          </p>
          <div className="hypothesis rise" style={{ animationDelay: "0.32s" }}>
            <span className="hypothesis-label">이 기록의 가설</span>
            {site.hypothesis}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="section-head">공개 지표</h2>
          <div className="metrics">
            {metricItems.map((item) => (
              <div className="metric" key={item.label}>
                <div className="metric-value">{item.value}</div>
                <div className="metric-label">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="section-head">최근 기록</h2>
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
          <h2 className="section-head">기록이 뻗어 있는 곳</h2>
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
