import { createClient } from "@supabase/supabase-js";

// 공개 지표의 구독자 수를 Supabase에서 실시간으로 가져옵니다.
// (mosunbrief.kr과 brief.mosunbrief.kr/lab 양쪽에서 모인 기록 구독자 = signup_source 'lab')
export async function getLabSubscriberCount(): Promise<number | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return null;

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { count, error } = await supabase
      .from("subscribers")
      .select("id", { count: "exact", head: true })
      .in("signup_source", ["lab", "both"])
      .eq("is_active", true);

    if (error) return null;
    return count ?? 0;
  } catch {
    return null;
  }
}
