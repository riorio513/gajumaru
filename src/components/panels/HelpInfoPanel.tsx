"use client";

import { useEffect, useRef, useState } from "react";
import { useSyncedList } from "@/lib/useSyncedList";
import { createClient } from "@/lib/supabase/client";
import GuestLockButton from "@/components/GuestLockButton";

type WinEntry = { id: string; entry_date: string; text: string };
type HelpArticle = { id: string; title: string; body: string; sort_order: number };

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function HelpInfoPanel({
  userId,
  isAdmin,
}: {
  userId: string | null;
  isAdmin: boolean;
}) {
  const isGuest = !userId;
  const wins = useSyncedList<WinEntry>(userId, "gajumaru_win_diary", "gajumaru:winDiary:v1", "entry_date");
  const [input, setInput] = useState("");

  const supabaseRef = useRef(createClient());
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [articlesLoaded, setArticlesLoaded] = useState(false);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadArticles() {
    const { data, error } = await supabaseRef.current
      .from("gajumaru_help_articles")
      .select("id, title, body, sort_order")
      .order("sort_order", { ascending: true });
    if (!error && data) setArticles(data as HelpArticle[]);
    setArticlesLoaded(true);
  }

  useEffect(() => {
    loadArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedWins = [...wins.items].sort((a, b) => b.entry_date.localeCompare(a.entry_date));

  async function addWin() {
    const text = input.trim();
    if (!text) return;
    await wins.addItem({ entry_date: todayISO(), text });
    setInput("");
  }

  function startNew() {
    setEditingId("new");
    setFormTitle("");
    setFormBody("");
  }

  function startEdit(article: HelpArticle) {
    setEditingId(article.id);
    setFormTitle(article.title);
    setFormBody(article.body);
  }

  function cancelEdit() {
    setEditingId(null);
    setFormTitle("");
    setFormBody("");
  }

  async function saveArticle() {
    const title = formTitle.trim();
    const body = formBody.trim();
    if (!title || !body) return;
    setSaving(true);
    if (editingId === "new") {
      const nextOrder = articles.length > 0 ? Math.max(...articles.map((a) => a.sort_order)) + 1 : 0;
      const { error } = await supabaseRef.current
        .from("gajumaru_help_articles")
        .insert({ title, body, sort_order: nextOrder });
      if (error) console.error("[help_articles] insert failed", error);
    } else if (editingId) {
      const { error } = await supabaseRef.current
        .from("gajumaru_help_articles")
        .update({ title, body, updated_at: new Date().toISOString() })
        .eq("id", editingId);
      if (error) console.error("[help_articles] update failed", error);
    }
    setSaving(false);
    cancelEdit();
    await loadArticles();
  }

  async function deleteArticle(id: string) {
    const { error } = await supabaseRef.current.from("gajumaru_help_articles").delete().eq("id", id);
    if (error) {
      console.error("[help_articles] delete failed", error);
      return;
    }
    await loadArticles();
  }

  return (
    <>
      <div className="card">
        <h2 className="section-title">🌷 今日できたこと日記</h2>
        <p className="lead">配信の準備は地味な積み重ねです。どんなに小さなことでも、進んだ分だけ記録してみてください。</p>
        <div className="date-input-row">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="例）立ち絵の依頼文を書いた"
            style={{ flex: 1, minWidth: 160 }}
          />
          {isGuest ? (
            <GuestLockButton />
          ) : (
            <button className="btn" onClick={addWin}>記録する</button>
          )}
        </div>
        <div className="record-list">
          {sortedWins.length === 0 ? (
            <div className="empty-note">まだ記録がありません。今日できたことを1つ書いてみましょう。</div>
          ) : (
            sortedWins.map((w) => (
              <div className="record-item" key={w.id}>
                <span>{w.entry_date}　{w.text}</span>
                <button className="del" onClick={() => wins.removeItem(w.id)}>削除</button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="section-title" style={{ fontSize: ".98rem" }}>💌 お役立ち情報</h2>
        <p className="lead">準備期間の不安が少しでも軽くなるよう、運営から届けるお知らせやアドバイスです。</p>

        {isAdmin && editingId !== "new" && (
          <button className="btn secondary" style={{ marginBottom: 14 }} onClick={startNew}>
            + 新しい情報を追加
          </button>
        )}

        {editingId === "new" && (
          <div className="card" style={{ background: "#f3f9f4", marginBottom: 14 }}>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="タイトル"
              style={{ marginBottom: 8 }}
            />
            <textarea
              value={formBody}
              onChange={(e) => setFormBody(e.target.value)}
              placeholder="本文"
              rows={4}
              style={{ marginBottom: 8, width: "100%" }}
            />
            <div className="date-input-row" style={{ marginBottom: 0 }}>
              <button className="btn" onClick={saveArticle} disabled={saving}>
                {saving ? "保存中…" : "公開する"}
              </button>
              <button className="btn secondary" onClick={cancelEdit} disabled={saving}>
                キャンセル
              </button>
            </div>
          </div>
        )}

        {articlesLoaded && articles.length === 0 && editingId !== "new" && (
          <div className="empty-note">まだお知らせはありません。</div>
        )}

        {articles.map((a) =>
          editingId === a.id ? (
            <div className="card" style={{ background: "#f3f9f4", marginBottom: 14 }} key={a.id}>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="タイトル"
                style={{ marginBottom: 8 }}
              />
              <textarea
                value={formBody}
                onChange={(e) => setFormBody(e.target.value)}
                placeholder="本文"
                rows={4}
                style={{ marginBottom: 8, width: "100%" }}
              />
              <div className="date-input-row" style={{ marginBottom: 0 }}>
                <button className="btn" onClick={saveArticle} disabled={saving}>
                  {saving ? "保存中…" : "更新する"}
                </button>
                <button className="btn secondary" onClick={cancelEdit} disabled={saving}>
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <div className="glossary-item" key={a.id}>
              <div className="term">{a.title}</div>
              <div className="desc" style={{ whiteSpace: "pre-wrap" }}>{a.body}</div>
              {isAdmin && (
                <div className="date-input-row" style={{ marginTop: 8, marginBottom: 0 }}>
                  <button className="btn secondary" onClick={() => startEdit(a)}>編集</button>
                  <button className="del" onClick={() => deleteArticle(a.id)}>削除</button>
                </div>
              )}
            </div>
          )
        )}

        <div className="disclaimer">
          ここでの内容は、運営（管理人）が体験談や事務所ブログなどをもとに書いているもので、専門的な医療・カウンセリングの代わりにはなりません。気持ちの不調が続く場合は、事務所の相談窓口や専門機関に相談することも選択肢に入れてくださいね。
        </div>
      </div>
    </>
  );
}
