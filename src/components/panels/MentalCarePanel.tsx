"use client";

import { useState } from "react";
import { useSyncedList } from "@/lib/useSyncedList";

type WinEntry = { id: string; entry_date: string; text: string };

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const MENTAL_MESSAGES = [
  "「準備期間はしんどくて当たり前」——多くの人が同じ道を通っています。今のペースのままで大丈夫です。",
  "毎日投稿できなくても、配信できなくても、それはサボりではありません。休むことも準備のうちです。",
  "完璧な自己紹介や台本じゃなくても、まずは一言話せたらそれで十分なスタートです。",
  "不安を感じるのは、それだけ真剣に向き合っている証拠です。焦らなくて大丈夫。",
  "誰かと比べて落ち込んだ日があってもいい。あなたのペースで進めば十分です。",
  "「楽しい休暇」と思える日も、「しんどい」と思う日も、どちらもあっていい準備期間です。",
];

const SENIOR_QA = [
  { q: "枠周りで人と関わるのが苦手で不安…", a: "「最初はぎこちなくて当然」という声が多くあります。無理に長居せず、一言挨拶するだけでも十分という人も多いです。" },
  { q: "ネタ切れが怖い", a: "話すテーマを事前に3つくらいストックしておくだけで気持ちが楽になった、という体験談があります。「配信ネタ帳」タブも活用してみてください。" },
  { q: "フォロワーが増えず過疎が不安", a: "個人差が大きい部分です。数字より「続けられているか」を基準にする方が心が保ちやすい、という声もあります。" },
  { q: "毎日配信バッジのプレッシャーがつらい", a: "途切れることを気にしすぎて燃え尽きてしまう例も報告されています。無理のないペースを優先しても大丈夫です。" },
];

export default function MentalCarePanel({ userId }: { userId: string | null }) {
  const wins = useSyncedList<WinEntry>(userId, "gajumaru_win_diary", "gajumaru:winDiary:v1", "entry_date");
  const [input, setInput] = useState("");
  const [msgIdx, setMsgIdx] = useState(() => Math.floor(Math.random() * MENTAL_MESSAGES.length));

  const sortedWins = [...wins.items].sort((a, b) => b.entry_date.localeCompare(a.entry_date));

  async function addWin() {
    const text = input.trim();
    if (!text) return;
    await wins.addItem({ entry_date: todayISO(), text });
    setInput("");
  }

  function nextMessage() {
    let idx: number;
    do {
      idx = Math.floor(Math.random() * MENTAL_MESSAGES.length);
    } while (idx === msgIdx && MENTAL_MESSAGES.length > 1);
    setMsgIdx(idx);
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
          <button className="btn" onClick={addWin}>記録する</button>
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
        <h2 className="section-title" style={{ fontSize: ".98rem" }}>💌 気持ちが沈んだときに</h2>
        <p className="lead">準備期間はしんどくて当たり前、と言われています。少し休みたくなったら読んでみてください。</p>
        <div className="result-box">
          <p>{MENTAL_MESSAGES[msgIdx]}</p>
        </div>
        <button className="btn secondary" style={{ marginTop: 10 }} onClick={nextMessage}>
          別の言葉を読む
        </button>
      </div>

      <div className="card">
        <h2 className="section-title" style={{ fontSize: ".98rem" }}>🌙 先輩たちのつまずきポイント</h2>
        {SENIOR_QA.map((qa) => (
          <div className="glossary-item" key={qa.q}>
            <div className="term">Q. {qa.q}</div>
            <div className="desc">A. {qa.a}</div>
          </div>
        ))}
        <div className="disclaimer">
          ここでの内容は、当事者の体験談・事務所ブログなどから見えてきた一般的な傾向を要約したもので、専門的な医療・カウンセリングの代わりにはなりません。気持ちの不調が続く場合は、事務所の相談窓口や専門機関に相談することも選択肢に入れてくださいね。
        </div>
      </div>
    </>
  );
}
