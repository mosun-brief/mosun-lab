import type { Metadata } from "next";
import SubscribeForm from "@/components/SubscribeForm";
import { channels } from "@/site.config";

export const metadata: Metadata = {
  title: "소개",
  description: "모순책장 — 응급의학과 의사, 읽는 사람, 만드는 사람",
};

export default function AboutPage() {
  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <p className="hero-eyebrow">About</p>
          <h1>
            모순처럼 보이는 것들이
            <br />한 사람 안에서 부딪히면
          </h1>
          <p className="hero-desc">
            안녕하세요, 모순책장입니다. 응급의학과 의사이고, 책을 읽고, 읽은
            것을 씁니다. 그리고 지금은 AI와 협업하며 1인 기업을 만드는 실험을
            하고 있습니다.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="post-body">
            <p>
              &lsquo;모순책장&rsquo;이라는 이름은 제 상태를 그대로 옮긴
              것입니다. 생명을 다루는 손으로 수익을 궁리하고, 읽기만 하던
              사람이 만들기 시작했습니다. 서로 안 맞아 보이는 것들을 한 몸에
              담고 있는 사람의 책장 — 그게 이 사이트입니다.
            </p>
            <p>
              제가 돈을 더 벌려는 이유는 단순합니다. 응급실은 최선을 다한
              판단조차 법정으로 이어질 수 있는 곳이고, 소송이 두려운 의사는
              조금씩 방어적으로 변합니다. 경제적 방패가 있어야 소송이 두렵지
              않고, 소송이 두렵지 않아야 신념에 맞는 진료를 끝까지 밀고 갈 수
              있습니다. 응급실 밖의 수입은 사치가 아니라, 응급실 안의 소신을
              지키는 조건입니다.
            </p>
            <p>
              그래서 실험을 시작했습니다. 가설은 하나 — 응급실 밖에서, 의사
              혼자서도, AI와 협업하면 수익을 내는 1인 기업을 만들 수 있다. 그
              과정을 이곳에 전부 기록합니다. 숫자는 0부터 공개하고, 실패도
              남기고, 따라 할 수 있게 씁니다.
            </p>
            <p>
              필명으로 씁니다. 진료실의 나와 실험실의 나를 분리하기
              위해서입니다. 다만 이 실험이 충분히 자라면, 그때는 이름을
              걸겠습니다.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="section-head">여기서 하는 것들</h2>
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
