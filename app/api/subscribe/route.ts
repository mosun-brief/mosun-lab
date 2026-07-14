import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// mosun-brief와 같은 Supabase를 씁니다. 기록 구독자는 signup_source='lab'
// 하나의 리스트로 모입니다 (거점 사이트에서 오든 /lab 페이지에서 오든 동일).

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing");
  }

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing");
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 요청 쿠키에서 값 하나를 읽습니다. (/ig 가 심는 ref 귀속 쿠키를 읽으려고)
function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;

  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) {
      return decodeURIComponent(part.slice(eq + 1).trim());
    }
  }
  return null;
}

// 귀속 성공 후 ref 쿠키를 지워, 다음 구독이 잘못 귀속되지 않게 합니다.
const CLEAR_REF = "ref=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax";

export async function POST(request: Request) {
  // 인스타 /ig 경유 방문자는 ref=instagram 쿠키를 갖고 옵니다.
  const ref = readCookie(request, "ref");
  const newSubscriberSource = ref === "instagram" ? "instagram" : "lab";
  const successHeaders = ref ? { "Set-Cookie": CLEAR_REF } : undefined;

  try {
    let body: { email?: string } = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, message: "올바른 이메일을 입력해주세요." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();

    const { data: existing, error: findError } = await supabase
      .from("subscribers")
      .select("id, signup_source")
      .eq("email", email)
      .maybeSingle();

    if (findError) {
      return NextResponse.json(
        {
          ok: false,
          message: `구독자 확인 중 오류가 발생했습니다: ${findError.message}`,
        },
        { status: 500 }
      );
    }

    if (existing?.id) {
      // 브리핑 구독자가 기록도 구독하면 'both'로 승격합니다 (브리핑 발송은 유지).
      const nextSource =
        existing.signup_source === "ai-fu" ? "both" : existing.signup_source;

      const { error: updateError } = await supabase
        .from("subscribers")
        .update({
          is_active: true,
          unsubscribed_at: null,
          signup_source: nextSource,
        })
        .eq("id", existing.id);

      if (updateError) {
        return NextResponse.json(
          {
            ok: false,
            message: `구독 복구 중 오류가 발생했습니다: ${updateError.message}`,
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          ok: true,
          message: "이미 등록된 이메일입니다. 구독이 활성 상태로 유지됩니다.",
        },
        { headers: successHeaders }
      );
    }

    const { error: insertError } = await supabase.from("subscribers").insert({
      email,
      signup_source: newSubscriberSource,
      persona_type: "Lab-Follower",
      job_role: null,
      interest_area: "not_sure",
      purpose: "too_much_info",
      difficulty: "easy",
      ai_emotion: "curious",
      ai_intent: "not_sure",
      blocker: "too_much_info",
      action_time: "30min",
      is_active: true,
      unsubscribed_at: null,
    });

    if (insertError) {
      const message = insertError.message.includes("signup_source")
        ? "subscribers 테이블에 signup_source 컬럼이 없습니다. Supabase SQL Editor에서 마이그레이션을 먼저 실행해주세요."
        : `구독 저장 중 오류가 발생했습니다: ${insertError.message}`;

      return NextResponse.json({ ok: false, message }, { status: 500 });
    }

    return NextResponse.json(
      {
        ok: true,
        message: "구독이 완료되었습니다. 새 기록이 나오면 보내드릴게요.",
      },
      { headers: successHeaders }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";

    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
