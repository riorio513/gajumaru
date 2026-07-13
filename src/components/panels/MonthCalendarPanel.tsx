"use client";

import { useMemo, useState } from "react";
import { useSyncedRecord } from "@/lib/useSyncedRecord";
import { useSyncedList } from "@/lib/useSyncedList";
import { computeRoadmap, sameDay } from "@/lib/roadmap";
import GuestLockButton from "@/components/GuestLockButton";

type CalendarEvent = {
  id: string;
  event_date: string;
  kind: "friend_debut" | "todo" | "deadline";
  title: string;
};

const KIND_OPTIONS: { value: CalendarEvent["kind"]; label: string; icon: string }[] = [
  { value: "friend_debut", label: "知人の初配信", icon: "🎉" },
  { value: "todo", label: "やりたいこと", icon: "✅" },
  { value: "deadline", label: "締切", icon: "⏰" },
];

function iconOf(kind: CalendarEvent["kind"]) {
  return KIND_OPTIONS.find((k) => k.value === kind)?.icon ?? "・";
}
function labelOf(kind: CalendarEvent["kind"]) {
  return KIND_OPTIONS.find((k) => k.value === kind)?.label ?? "";
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const DOW = ["日", "月", "火", "水", "木", "金", "土"];

export default function MonthCalendarPanel({ userId }: { userId: string | null }) {
  const isGuest = !userId;

  const [prepStart] = useSyncedRecord<string>(userId, "prep_start_date", "gajumaru:prepStart:v1", "");
  const [debutDate] = useSyncedRecord<string>(userId, "debut_date", "gajumaru:debutDate:v1", "");
  const roadmap = useMemo(() => computeRoadmap(prepStart, debutDate), [prepStart, debutDate]);

  const events = useSyncedList<CalendarEvent>(
    userId,
    "gajumaru_calendar_events",
    "gajumaru:calendarEvents:v1",
    "event_date"
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewMonth, setViewMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const [formDate, setFormDate] = useState(todayISO());
  const [formKind, setFormKind] = useState<CalendarEvent["kind"]>("friend_debut");
  const [formTitle, setFormTitle] = useState("");

  async function addEvent() {
    const title = formTitle.trim();
    if (!formDate || !title) return;
    await events.addItem({ event_date: formDate, kind: formKind, title });
    setFormTitle("");
  }

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay(); // 0=日曜
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const sortedEvents = [...events.items].sort((a, b) => a.event_date.localeCompare(b.event_date));

  return (
    <>
      <div className="card">
        <h2 className="section-title">📅 カレンダー</h2>
        <p className="lead">
          準備ロードマップの予定（水色の文字）に加えて、知人の初配信日・自分がやりたいこと・締切日などを登録できます。当日の内容はホーム画面の上部にも表示されます。
        </p>

        <div className="date-input-row" style={{ marginBottom: 8, justifyContent: "center" }}>
          <button
            className="btn secondary"
            onClick={() => setViewMonth(new Date(year, month - 1, 1))}
          >
            ← 前月
          </button>
          <div style={{ fontWeight: 700, minWidth: 90, textAlign: "center" }}>
            {year}年{month + 1}月
          </div>
          <button
            className="btn secondary"
            onClick={() => setViewMonth(new Date(year, month + 1, 1))}
          >
            次月 →
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 4,
            fontSize: ".72rem",
            marginBottom: 4,
            textAlign: "center",
            color: "var(--text-sub)",
          }}
        >
          {DOW.map((d, i) => (
            <div key={d} style={{ color: i === 0 ? "#e57373" : i === 6 ? "#64b5f6" : undefined }}>
              {d}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 4,
          }}
        >
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const isToday = sameDay(d, today);
            const roadmapHits = roadmap.items.filter((it) => sameDay(it.d, d));
            const eventHits = events.items.filter((ev) => ev.event_date === toISO(d));
            return (
              <div
                key={i}
                style={{
                  minHeight: 56,
                  border: isToday ? "2px solid var(--accent, #4caf50)" : "1px solid var(--border-color, #ddd)",
                  borderRadius: 6,
                  padding: 3,
                  fontSize: ".68rem",
                  overflow: "hidden",
                }}
              >
                <div style={{ fontWeight: isToday ? 700 : 400 }}>{d.getDate()}</div>
                {roadmapHits.map((it, idx) => (
                  <div key={`r${idx}`} style={{ color: "#03a9f4", lineHeight: 1.2 }} title={it.label}>
                    {it.label}
                  </div>
                ))}
                {eventHits.map((ev) => (
                  <div key={ev.id} style={{ lineHeight: 1.2 }} title={`${labelOf(ev.kind)}：${ev.title}`}>
                    {iconOf(ev.kind)}{ev.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h2 className="section-title" style={{ fontSize: ".98rem" }}>+ 予定を登録</h2>
        <div className="date-input-row">
          <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
          <select value={formKind} onChange={(e) => setFormKind(e.target.value as CalendarEvent["kind"])}>
            {KIND_OPTIONS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.icon} {k.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="内容（例：〇〇さん、資料まとめ）"
            style={{ flex: 1, minWidth: 160 }}
          />
          {isGuest ? <GuestLockButton /> : <button className="btn" onClick={addEvent}>登録する</button>}
        </div>

        <div className="record-list">
          {sortedEvents.length === 0 ? (
            <div className="empty-note">まだ登録された予定がありません。</div>
          ) : (
            sortedEvents.map((ev) => (
              <div className="record-item" key={ev.id}>
                <span>{ev.event_date}　{iconOf(ev.kind)}{labelOf(ev.kind)}：{ev.title}</span>
                <button className="del" onClick={() => events.removeItem(ev.id)}>削除</button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
