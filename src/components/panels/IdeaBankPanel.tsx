"use client";

import { useState } from "react";
import { useSyncedRecord } from "@/lib/useSyncedRecord";
import GuestLockButton from "@/components/GuestLockButton";

type IdeaBank = Record<string, string[]>;

const CATS: Record<string, string> = { talk: "雑談ネタ", event: "企画ネタ", night: "深夜・大人向け", niche: "ニッチ" };
const SEEDS: Record<string, string[]> = {
  talk: ["今日あった小さな出来事", "好きな食べ物ランキング", "最近ハマってること", "休日の過ごし方", "ペットや動物の話"],
  event: ["○×クイズ企画", "しりとり配信", "お絵かきリクエスト企画", "リスナーと一緒に何か決める投票企画", "目標達成チャレンジ配信"],
  night: ["恋愛トーク", "ちょっと大人な相談コーナー", "本音トーク回", "昔の失敗談"],
  niche: ["特定ジャンルの知識披露", "コレクション自慢", "資格・勉強の進捗報告", "謎解き・パズル配信"],
};
const DEFAULT_BANK: IdeaBank = { talk: [], event: [], night: [], niche: [] };

export default function IdeaBankPanel({ userId }: { userId: string | null }) {
  const isGuest = !userId;
  const [bank, setBank] = useSyncedRecord<IdeaBank>(userId, "idea_bank", "gajumaru:ideaBank:v1", DEFAULT_BANK);
  const [cat, setCat] = useState("talk");
  const [input, setInput] = useState("");
  const [randomPick, setRandomPick] = useState<{ cat: string; text: string } | null>(null);

  const list = bank[cat] || [];

  function addIdea() {
    const text = input.trim();
    if (!text) return;
    setBank({ ...bank, [cat]: [...(bank[cat] || []), text] });
    setInput("");
  }

  function removeIdea(idx: number) {
    setBank({ ...bank, [cat]: (bank[cat] || []).filter((_, i) => i !== idx) });
  }

  function addSeeds() {
    const existing = new Set(bank[cat] || []);
    const toAdd = (SEEDS[cat] || []).filter((s) => !existing.has(s));
    setBank({ ...bank, [cat]: [...(bank[cat] || []), ...toAdd] });
  }

  function pickRandom() {
    const all: { cat: string; text: string }[] = [];
    Object.keys(bank).forEach((c) => (bank[c] || []).forEach((t) => all.push({ cat: c, text: t })));
    if (all.length === 0) {
      setRandomPick(null);
      return;
    }
    setRandomPick(all[Math.floor(Math.random() * all.length)]);
  }

  return (
    <div className="card">
      <h2 className="section-title">💡 配信ネタ帳</h2>
      <p className="lead">「何を話せばいいか分からない」を減らすための、自分専用のネタストックです。カテゴリごとに書き溜めておきましょう。</p>
      <div className="date-input-row">
        {Object.entries(CATS).map(([key, label]) => (
          <button
            key={key}
            className={`chip${cat === key ? " active" : ""}`}
            onClick={() => {
              setCat(key);
              setRandomPick(null);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="date-input-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="思いついたネタを入力…"
          style={{ flex: 1, minWidth: 160 }}
        />
        {isGuest ? (
          <GuestLockButton />
        ) : (
          <>
            <button className="btn" onClick={addIdea}>追加する</button>
            <button className="btn secondary" onClick={addSeeds}>サンプルを追加</button>
          </>
        )}
      </div>
      <div className="record-list">
        {list.length === 0 ? (
          <div className="empty-note">まだネタがありません。「サンプルを追加」か、思いついたネタを追加してみてください。</div>
        ) : (
          list.map((t, i) => (
            <div className="record-item" key={i}>
              <span>{t}</span>
              <button className="del" onClick={() => removeIdea(i)}>削除</button>
            </div>
          ))
        )}
      </div>
      <button className="btn secondary" style={{ marginTop: 10 }} onClick={pickRandom}>
        🎲 保存したネタからランダムに1つ
      </button>
      {randomPick && (
        <div className="result-box">
          <h4>{CATS[randomPick.cat]}</h4>
          <p>{randomPick.text}</p>
        </div>
      )}
    </div>
  );
}
