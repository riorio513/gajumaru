import { createClient } from "@/lib/supabase/client";

const RECORD_KEYS = {
  debut_date: "gajumaru:debutDate:v1",
  checklist_state: "gajumaru:checklist:v1",
  profile_form: "gajumaru:profileForm:v1",
  idea_bank: "gajumaru:ideaBank:v1",
} as const;

const LIST_KEYS: { table: string; localKey: string }[] = [
  { table: "gajumaru_stream_logs", localKey: "gajumaru:streamLogs:v1" },
  { table: "gajumaru_visit_logs", localKey: "gajumaru:visitLogs:v1" },
  { table: "gajumaru_win_diary", localKey: "gajumaru:winDiary:v1" },
];

const DISMISSED_KEY = "gajumaru:migrationDismissed:v1";

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function isEmptyValue(v: unknown): boolean {
  if (v == null || v === "") return true;
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object") return Object.keys(v).length === 0;
  return false;
}

/**
 * ログイン後、この端末にゲスト時代のデータが残っていて、
 * かつアカウント側がまだ空であれば「引き継ぐか」を確認する必要があるかを返す。
 * 一度「引き継がない」を選んだ端末では再度聞かない。
 */
export async function checkMigrationEligible(userId: string): Promise<boolean> {
  if (localStorage.getItem(DISMISSED_KEY)) return false;

  const localRecord: Record<string, unknown> = {};
  for (const [column, key] of Object.entries(RECORD_KEYS)) {
    localRecord[column] = readLocal(key, column === "debut_date" ? "" : {});
  }
  const localLists = LIST_KEYS.map((l) => ({ ...l, items: readLocal<unknown[]>(l.localKey, []) }));

  const hasLocalData =
    Object.values(localRecord).some((v) => !isEmptyValue(v)) || localLists.some((l) => l.items.length > 0);
  if (!hasLocalData) return false;

  const supabase = createClient();

  const { data: profile } = await supabase
    .from("gajumaru_profiles")
    .select("debut_date, checklist_state, profile_form, idea_bank")
    .eq("user_id", userId)
    .maybeSingle();

  const remoteIsEmpty =
    !profile ||
    (isEmptyValue(profile.debut_date) &&
      isEmptyValue(profile.checklist_state) &&
      isEmptyValue(profile.profile_form) &&
      isEmptyValue(profile.idea_bank));

  if (!remoteIsEmpty) return false;

  let remoteListsEmpty = true;
  for (const l of localLists) {
    const { count } = await supabase
      .from(l.table)
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if (count && count > 0) {
      remoteListsEmpty = false;
      break;
    }
  }

  return remoteListsEmpty;
}

export async function performMigration(userId: string) {
  const supabase = createClient();

  const localRecord: Record<string, unknown> = {};
  for (const [column, key] of Object.entries(RECORD_KEYS)) {
    localRecord[column] = readLocal(key, column === "debut_date" ? "" : {});
  }
  const localLists = LIST_KEYS.map((l) => ({ ...l, items: readLocal<{ id?: string }[]>(l.localKey, []) }));

  await supabase
    .from("gajumaru_profiles")
    .upsert({ user_id: userId, ...localRecord, updated_at: new Date().toISOString() });

  for (const l of localLists) {
    if (l.items.length === 0) continue;
    const rows = l.items.map(({ id: _id, ...rest }) => ({ ...rest, user_id: userId }));
    await supabase.from(l.table).insert(rows);
  }
}

export function dismissMigration() {
  localStorage.setItem(DISMISSED_KEY, "1");
}
