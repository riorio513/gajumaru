"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ProfileColumn =
  | "debut_date"
  | "prep_start_date"
  | "visit_goal"
  | "checklist_state"
  | "profile_form"
  | "idea_bank";

/**
 * ログイン中は gajumaru_profiles の指定カラムに同期し、
 * ゲスト時は localStorage に保存する「ひとかたまりの値」用フック。
 * チェックリスト状態・デビュー日・自己紹介フォーム・ネタ帳で使う。
 */
export function useSyncedRecord<T>(
  userId: string | null,
  column: ProfileColumn,
  localStorageKey: string,
  defaultValue: T
): [T, (value: T) => void, boolean] {
  const [value, setValueState] = useState<T>(defaultValue);
  const [loaded, setLoaded] = useState(false);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (userId) {
        const { data, error } = await supabaseRef.current
          .from("gajumaru_profiles")
          .select(column)
          .eq("user_id", userId)
          .maybeSingle();
        if (!cancelled) {
          const row = data as Record<string, unknown> | null;
          if (!error && row && row[column] != null) {
            setValueState(row[column] as T);
          } else {
            setValueState(defaultValue);
          }
          setLoaded(true);
        }
      } else {
        try {
          const raw = localStorage.getItem(localStorageKey);
          if (!cancelled) {
            setValueState(raw ? (JSON.parse(raw) as T) : defaultValue);
          }
        } catch {
          if (!cancelled) setValueState(defaultValue);
        }
        if (!cancelled) setLoaded(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, column, localStorageKey]);

  function setValue(next: T) {
    setValueState(next);
    if (userId) {
      supabaseRef.current
        .from("gajumaru_profiles")
        .upsert({ user_id: userId, [column]: next, updated_at: new Date().toISOString() })
        .then(({ error }) => {
          if (error) console.error(`[useSyncedRecord:${column}] upsert failed`, error);
        });
    } else {
      try {
        localStorage.setItem(localStorageKey, JSON.stringify(next));
      } catch (e) {
        console.error(`[useSyncedRecord:${column}] localStorage write failed`, e);
      }
    }
  }

  return [value, setValue, loaded];
}
