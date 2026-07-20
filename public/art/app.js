// ═══════════════════════════════════════════════════════════
// 공용 스크립트 — 저장소 계층(Store) + UI 헬퍼
//
// 이중 모드:
//  · 원격 모드 — supabase-config.js에 키가 있고 수강생 토큰(?t= 또는
//    저장된 토큰)이 있으면 Supabase RPC로 읽고 씁니다.
//  · 로컬 모드 — 그 외에는 localStorage (데모/개발용).
// 화면 코드는 Store 함수만 호출하므로 모드를 몰라도 됩니다.
// 사용 전 반드시 await Store.init() 필요 (페이지 스크립트는 module).
// ═══════════════════════════════════════════════════════════

const Store = {
  mode: "local",
  token: null,
  cache: null,

  async init() {
    if (this._inited) return;
    this._inited = true;
    const fromUrl = new URLSearchParams(location.search).get("t");
    const token = fromUrl || localStorage.getItem("artcourse_token");
    const configured = typeof SUPABASE_URL !== "undefined" && SUPABASE_URL && SUPABASE_ANON_KEY;
    if (token && configured) {
      try {
        this.cache = await this.rpc("art_student_state", { p_token: token });
        this.token = token;
        this.mode = "remote";
        localStorage.setItem("artcourse_token", token);
      } catch (e) {
        console.warn("원격 모드 진입 실패 — 로컬 모드로 진행합니다:", e.message);
        if (fromUrl) showToast("링크가 유효하지 않습니다 — 코치에게 문의해주세요");
      }
    }
  },

  async rpc(fn, params) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": "Bearer " + SUPABASE_ANON_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(body.includes("SESSION_LOCKED") ? "이전 세션을 먼저 완료해주세요"
        : body.includes("INVALID_TOKEN") ? "유효하지 않은 링크입니다"
        : body.includes("NOT_FINISHED") ? "12세션을 모두 마쳐야 추리할 수 있습니다"
        : "저장에 실패했습니다 — 잠시 후 다시 시도해주세요");
    }
    return res.json();
  },

  key(n, f) { return `artcourse_s${n}_${f}`; },

  studentName() { return this.mode === "remote" ? this.cache.name : null; },

  getMemo(n) {
    if (this.mode === "remote") return this.cache.submissions[n]?.memo || "";
    return localStorage.getItem(this.key(n, "memo")) || "";
  },
  isDone(n) {
    if (this.mode === "remote") return !!this.cache.submissions[n];
    return localStorage.getItem(this.key(n, "done")) !== null;
  },
  doneDate(n) {
    if (this.mode === "remote") return this.cache.submissions[n]?.date || "";
    return localStorage.getItem(this.key(n, "done")) || "";
  },
  async saveMemo(n, text) {
    if (this.mode === "remote") {
      this.cache = await this.rpc("art_submit_memo", { p_token: this.token, p_session: n, p_memo: text });
      return;
    }
    localStorage.setItem(this.key(n, "memo"), text);
    localStorage.setItem(this.key(n, "done"), new Date().toISOString().slice(0, 10));
  },

  isPaid() { return this.mode === "remote"; },
  // 무료 체험은 세션 1까지 — 전체 진행은 정식 수강생(원격 모드)만.
  // (개발용 우회: localStorage에 artcourse_dev=1)
  isUnlocked(n) {
    if (n === 1) return true;
    if (!this.isPaid() && !localStorage.getItem("artcourse_dev")) return false;
    return this.isDone(n - 1);
  },
  doneCount() { let c = 0; for (let i = 1; i <= 12; i++) if (this.isDone(i)) c++; return c; },

  hintUnlocked(i) { return this.isDone(i); },
  // 원격 모드에선 열린 힌트만 서버가 내려줌. 로컬 모드는 데모 힌트 사용.
  getHint(i) {
    if (this.mode === "remote") return this.cache.hints[i] || null;
    return HINTS[i - 1];
  },

  getGuess() {
    if (this.mode === "remote") return this.cache.guess || "";
    return localStorage.getItem("artcourse_guess") || "";
  },
  async saveGuess(t) {
    if (this.mode === "remote") {
      this.cache = await this.rpc("art_submit_guess", { p_token: this.token, p_guess: t });
      return;
    }
    localStorage.setItem("artcourse_guess", t);
  },

  getLetter() { return this.mode === "remote" ? (this.cache.letter || null) : null; },
  getArtwork() { return this.mode === "remote" ? (this.cache.artwork || null) : null; },

  exportMarkdown() {
    const today = new Date().toISOString().slice(0, 10);
    const name = this.studentName();
    let md = `# ${name ? name + "님의 " : "나의 "}미술 노트 — 그림이 읽히는 눈\n\n내보낸 날짜: ${today}\n`;
    for (const s of COURSE) {
      md += `\n## 세션 ${s.id}. ${s.title}`;
      md += this.isDone(s.id) ? ` (${this.doneDate(s.id)} 완료)\n` : ` (미완료)\n`;
      const memo = this.getMemo(s.id);
      if (memo) md += `\n${memo}\n`;
      const h = this.hintUnlocked(s.id) ? this.getHint(s.id) : null;
      if (h) md += `\n> 🕵️ 힌트 ${s.id}: ${h}\n`;
    }
    const guess = this.getGuess();
    if (guess) md += `\n## 🔍 나의 추리\n\n${guess}\n`;
    const letter = this.getLetter();
    if (letter) {
      const art = this.getArtwork() || {};
      md += `\n## 🎁 나의 그림${art.title ? " — 「" + art.title + "」" : ""}\n`;
      if (art.meta) md += `\n${art.meta}\n`;
      md += `\n### 코치의 편지\n\n${letter}\n`;
    }
    return md;
  }
};

// ── 토스트 ──
let _toastTimer;
function showToast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  requestAnimationFrame(() => t.classList.add("show"));
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

// ── 마크다운 다운로드 ──
function downloadMarkdown() {
  const md = Store.exportMarkdown();
  const today = new Date().toISOString().slice(0, 10);
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `미술노트_${today}.md`;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast("마크다운 파일이 저장되었습니다 📄");
}

// ── 클립보드 복사 ──
async function copyText(text, okMsg) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(okMsg || "복사 완료");
  } catch {
    showToast("복사 실패 — 길게 눌러 직접 복사해주세요");
  }
}
