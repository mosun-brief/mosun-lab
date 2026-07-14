import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// 기록 구독자로 세는 signup_source 값들.
// lab = 거점/브리핑 /lab 폼, both = 브리핑+기록 겸용, instagram = 인스타 /ig 경유.
const LAB_SOURCES = ["lab", "both", "instagram"] as const;

function getAdminClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey);
}

// 공개 지표의 '기록 구독자' 수 — 어느 채널로 들어왔든 기록 구독자를 모두 셉니다.
export async function getLabSubscriberCount(): Promise<number | null> {
  const supabase = getAdminClient();
  if (!supabase) return null;

  try {
    const { count, error } = await supabase
      .from("subscribers")
      .select("id", { count: "exact", head: true })
      .in("signup_source", LAB_SOURCES as unknown as string[])
      .eq("is_active", true);

    if (error) return null;
    return count ?? 0;
  } catch {
    return null;
  }
}

// 특정 유입 채널(예: 'instagram') 구독자 수 — 인스타가 실제로 구독자를
// 데려오는지 확인할 때 씁니다.
export async function getSubscriberCountBySource(
  source: string
): Promise<number | null> {
  const supabase = getAdminClient();
  if (!supabase) return null;

  try {
    const { count, error } = await supabase
      .from("subscribers")
      .select("id", { count: "exact", head: true })
      .eq("signup_source", source)
      .eq("is_active", true);

    if (error) return null;
    return count ?? 0;
  } catch {
    return null;
  }
}
