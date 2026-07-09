"use client";

import { useState } from "react";
import { useSyncedList } from "@/lib/useSyncedList";

type StreamLog = { id: string; log_date: string; minutes: number; note: string | null };
type VisitLog = { id: string; log_date: string; name: string; note: string | null };

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function computeStreak(dates: string[]) {
  const dateSet = new Set(dates);
  if (dateSet.size === 0) return 0;
  const sorted = [...dateSet].sort();
  const maxDate = new Date(sorted[sorted.length - 1] + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - maxDate.getTime()) / 86400000);
  if (diffDays > 1) return 0;
  let streak = 0;
  const cur = new Date(maxDate);
  const fmtISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  while (dateSet.has(fmtISO(cur))) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}

export default function TrackerPanel({ userId }: { userId: string | null }) {
  const logs = useSyncedList<StreamLog>(userId, "gajumaru_stream_logs", "gajumaru:streamLogs:v1", "log_date");
  const visits = useSyncedList<VisitLog>(userId, "gajumaru_visit_logs", "gajumaru:visitLogs:v1", "log_date");

  const [logDate, setLogDate] = useState(todayISO());
  const [logMinutes, setLogMinutes] = useState("");
  const [logNote, setLogNote] = useState("");
  const [visitDate, setVisitDate] = useState(todayISO());
  const [visitName, setVisitName] = useState("");
  const [visitNote, setVisitNote] = useState("");

  const totalMin = logs.items.reduce((s, l) => s + Number(l.minutes || 0), 0);
  const streak = computeStreak(logs.items.map((l) => l.log_date));

  const sortedLogs = [...logs.items].sort((a, b) => b.log_date.localeCompare(a.log_date));
  const sortedVisits = [...visits.items].sort((a, b) => b.log_date.localeCompare(a.log_date));

  async function addLog() {
    if (!logDate || !logMinutes) {
      alert("日付と配信時間を入力してください");
      return;
    }
    await logs.addItem({ log_date: logDate, minutes: Number(logMinutes), note: logNote || null });
    setLogMinutes("");
    setLogNote("");
  }

  async function addVisit() {
    if (!visitDate || !visitName) {
      alert("日付と相手のライバー名を入力してください");
      return;
    }
    await visits.addItem({ log_date: visitDate, name: visitName, note: visitNote || null });
    setVisitName("");
    setVisitNote("");
  }

  return (
    <>
      <div className="card">
        <h2 className="section-title">📈 継続トラッカー</h2>
        <p className="lead">配信のたびに1分だけ記録すると、まいにち配信ストリークや累計時間が見えてきます。</p>
        <div className="stat-row">
          <div className="stat-box">
            <div className="stat-num">{logs.items.length}</div>
            <div className="stat-label">累計配信回数</div>
          </div>
          <div className="stat-box">
            <div className="stat-num">{(totalMin / 60).toFixed(1)}</div>
            <div className="stat-label">累計配信時間(h)</div>
          </div>
          <div className="stat-box">
            <div className="stat-num">{streak}</div>
            <div className="stat-label">まいにち配信ストリーク</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title" style={{ fontSize: ".98rem" }}>
          🎙️ 配信ログ
        </h2>
        <div className="date-input-row">
          <input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} />
          <input type="number" value={logMinutes} onChange={(e) => setLogMinutes(e.target.value)} placeholder="配信時間(分)" min={1} style={{ width: 130 }} />
          <input type="text" value={logNote} onChange={(e) => setLogNote(e.target.value)} placeholder="メモ（任意）" style={{ flex: 1, minWidth: 140 }} />
          <button className="btn" onClick={addLog}>記録する</button>
        </div>
        <div className="record-list">
          {sortedLogs.length === 0 ? (
            <div className="empty-note">まだ記録がありません。配信したら記録してみてください。</div>
          ) : (
            sortedLogs.map((l) => (
              <div className="record-item" key={l.id}>
                <span>{l.log_date}　{l.minutes}分{l.note ? `　${l.note}` : ""}</span>
                <button className="del" onClick={() => logs.removeItem(l.id)}>削除</button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="section-title" style={{ fontSize: ".98rem" }}>
          👋 枠周り記録
        </h2>
        <p className="lead">挨拶に行った配信・お世話になった人をメモしておく場所です。</p>
        <div className="date-input-row">
          <input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
          <input type="text" value={visitName} onChange={(e) => setVisitName(e.target.value)} placeholder="相手のライバー名" style={{ flex: 1, minWidth: 140 }} />
          <input type="text" value={visitNote} onChange={(e) => setVisitNote(e.target.value)} placeholder="メモ（任意）" style={{ flex: 1, minWidth: 140 }} />
          <button className="btn" onClick={addVisit}>記録する</button>
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
    </>
  );
}
