"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ListTable = "gajumaru_stream_logs" | "gajumaru_visit_logs" | "gajumaru_win_diary";

/**
 * ログイン中は指定テーブルへinsert/delete、ゲスト時はlocalStorageの配列に保存する
 * 「追記型リスト」用フック。配信ログ・枠周り記録・できたこと日記で使う。
 * 各アイテムは `id` を持つ（ゲスト時はcrypto.randomUUIDで採番）。
 */
export function useSyncedList<T extends { id: string }>(
  userId: string | null,
  table: ListTable,
  localStorageKey: string,
  orderColumn: string
): {
  items: T[];
  loaded: boolean;
  addItem: (item: Omit<T, "id">) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
} {
  const [items, setItems] = useState<T[]>([]);
  const [loaded, setLoaded] = useState(false);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (userId) {
        const { data, error } = await supabaseRef.current
          .from(table)
          .select("*")
          .eq("user_id", userId)
          .order(orderColumn, { ascending: false });
        if (!cancelled) {
          setItems(!error && data ? (data as T[]) : []);
          setLoaded(true);
        }
      } else {
        try {
          const raw = localStorage.getItem(localStorageKey);
          const parsed: T[] = raw ? JSON.parse(raw) : [];
          if (!cancelled) setItems(parsed);
        } catch {
          if (!cancelled) setItems([]);
        }
        if (!cancelled) setLoaded(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, table, localStorageKey, orderColumn]);

  function persistGuest(next: T[]) {
    setItems(next);
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(next));
    } catch (e) {
      console.error(`[useSyncedList:${table}] localStorage write failed`, e);
    }
  }

  async function addItem(item: Omit<T, "id">) {
    if (userId) {
      const { data, error } = await supabaseRef.current
        .from(table)
        .insert({ ...item, user_id: userId })
        .select()
        .single();
      if (error) {
        console.error(`[useSyncedList:${table}] insert failed`, error);
        return;
      }
      setItems((prev) => [data as T, ...prev]);
    } else {
      const withId = { ...item, id: crypto.randomUUID() } as T;
      persistGuest([withId, ...items]);
    }
  }

  async function removeItem(id: string) {
    if (userId) {
      const { error } = await supabaseRef.current.from(table).delete().eq("id", id);
      if (error) {
        console.error(`[useSyncedList:${table}] delete failed`, error);
        return;
      }
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      persistGuest(items.filter((i) => i.id !== id));
    }
  }

  return { items, loaded, addItem, removeItem };
}
