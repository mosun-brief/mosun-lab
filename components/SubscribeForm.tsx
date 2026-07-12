"use client";

import { useState } from "react";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const normalized = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setMessage("올바른 이메일 주소를 입력해주세요.");
      setIsError(true);
      return;
    }

    setStatus("loading");
    setMessage("");
    setIsError(false);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setStatus("idle");
        setMessage(data.message || "구독 신청에 실패했습니다.");
        setIsError(true);
        return;
      }

      setStatus("done");
      setMessage(data.message || "구독이 완료되었습니다.");
      setIsError(false);
    } catch {
      setStatus("idle");
      setMessage("구독 신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setIsError(true);
    }
  };

  return (
    <div className="subscribe-box" id="subscribe">
      <h2>기록을 이메일로</h2>
      <p className="subscribe-desc">
        새 글이 나오면 보내드립니다. 광고나 스팸은 없고, 언제든 해지할 수
        있습니다.
      </p>
      <form className="subscribe-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="example@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setMessage("");
          }}
          required
          disabled={status !== "idle"}
          aria-label="이메일 주소"
        />
        <button type="submit" disabled={status !== "idle"}>
          {status === "loading"
            ? "처리 중..."
            : status === "done"
            ? "구독 완료"
            : "구독하기"}
        </button>
      </form>
      {message && (
        <p className={`subscribe-message ${isError ? "error" : "success"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
