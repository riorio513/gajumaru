"use client";

import { useState } from "react";
import { useSyncedList } from "@/lib/useSyncedList";
import { useSyncedRecord } from "@/lib/useSyncedRecord";
import GuestLockButton from "@/components/GuestLockButton";

type VisitLog = { id: string; log_date: string; name: string; note: string | null };

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function startOfWeekISO() {
  const d = new Date();
  const day = d.getDay(); // 0=Sun
  const diffToMonday = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diffToMonday);
  d.setHours(0, 0, 0, 0);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const GREETING_TEMPLATES = [
  {
    scene: "はじめて訪問するとき",
    text: "こんにちは！はじめまして、準備中の◯◯と申します🌱 素敵な配信だったので、お邪魔させてください！",
  },
  {
    scene: "配信を褒めたいとき",
    text: "コメントの返しがすごく丁寧で、見ていて安心感がありました！勉強になります✨",
  },
  {
    scene: "常連さんへのお礼",
    text: "いつも見に来てくださってありがとうございます！おかげで配信を続ける励みになっています🙏",
  },
  {
    scene: "自分の配信を軽く紹介したいとき",
    text: "実は私もまだ準備中なのですが、◯月頃デビュー予定です！よかったらまた覗きに来てもらえたら嬉しいです。",
  },
  {
    scene: "退室するとき",
    text: "お邪魔しました！素敵な時間をありがとうございました、また来ますね🌳",
  },
];

export default function TrackerPanel({ userId }: { userId: string | null }) {
  const isGuest = !userId;
  const visits = useSyncedList<VisitLog>(userId, "gajumaru_visit_logs", "gajumaru:visitLogs:v1", "log_date");
  const [visitGoal, setVisitGoal] = useSyncedRecord<number | null>(userId, "visit_goal", "gajumaru:visitGoal:v1", null);

  const [visitDate, setVisitDate] = useState(todayISO());
  const [visitName, setVisitName] = useState("");
  const [visitNote, setVisitNote] = useState("");
  const [goalInput, setGoalInput] = useState("");

  const sortedVisits = [...visits.items].sort((a, b) => b.log_date.localeCompare(a.log_date));
  const weekStart = startOfWeekISO();
  const thisWeekCount = visits.items.filter((v) => v.log_date >= weekStart).length;

  async function addVisit() {
    if (!visitDate || !visitName) {
      alert("日付と相手のライバー名を入力してください");
      return;
    }
    await visits.addItem({ log_date: visitDate, name: visitName, note: visitNote || null });
    setVisitName("");
    setVisitNote("");
  }

  function saveGoal() {
    const n = Number(goalInput);
    if (!goalInput || Number.isNaN(n) || n <= 0) return;
    setVisitGoal(n);
    setGoalInput("");
  }

  return (
    <>
      <div className="card">
        <h2 className="section-title">👋 枠周り記録</h2>
        <p className="lead">挨拶に行った配信・お世話になった人をメモしておく場所です。無理のない範囲で続けていきましょう。</p>

        <div className="stat-row">
          <div className="stat-box">
            <div className="stat-num">{thisWeekCount}</div>
            <div className="stat-label">今週の枠周り回数</div>
          </div>
          <div className="stat-box">
            <div className="stat-num">{visitGoal ?? "-"}</div>
            <div className="stat-label">週の目標回数</div>
          </div>
        </div>

        <div className="date-input-row">
          <input
            type="number"
            min={1}
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            placeholder={visitGoal ? `現在：週${visitGoal}回` : "週の目標回数"}
            style={{ width: 150 }}
          />
          {isGuest ? (
            <GuestLockButton className="btn secondary" />
          ) : (
            <button className="btn secondary" onClick={saveGoal}>目標を設定</button>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="section-title" style={{ fontSize: ".98rem" }}>
          📋 訪問記録
        </h2>
        <div className="date-input-row">
          <input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
          <input type="text" value={visitName} onChange={(e) => setVisitName(e.target.value)} placeholder="相手のライバー名" style={{ flex: 1, minWidth: 140 }} />
          <input type="text" value={visitNote} onChange={(e) => setVisitNote(e.target.value)} placeholder="メモ（任意）" style={{ flex: 1, minWidth: 140 }} />
          {isGuest ? (
            <GuestLockButton />
          ) : (
            <button className="btn" onClick={addVisit}>記録する</button>
          )}
        </div>
        <div className="record-list">
          {sortedVisits.length === 0 ? (
            <div className="empty-note">まだ記録がありません。</div>
          ) : (
            sortedVisits.map((v) => (
              <div className="record-item" key={v.id}>
                <span>{v.log_date}　{v.name}{v.note ? `　${v.note}` : ""}</span>
                <button className="del" onClick={() => visits.removeItem(v.id)}>削除</button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="section-title" style={{ fontSize: ".98rem" }}>
          💬 挨拶コメント例文集
        </h2>
        <p className="lead">枠周りで何を言えばいいか迷ったときの参考例です。そのまま使ってもアレンジしてもOKです。</p>
        {GREETING_TEMPLATES.map((g) => (
          <div className="glossary-item" key={g.scene}>
            <div className="term">{g.scene}</div>
            <div className="desc">{g.text}</div>
          </div>
        ))}
      </div>
    </>
  );
}
