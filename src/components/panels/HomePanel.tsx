import { useMemo } from "react";
import { useSyncedRecord } from "@/lib/useSyncedRecord";
import { useSyncedList } from "@/lib/useSyncedList";
import { CHECKLIST_CATEGORIES } from "@/lib/checklistData";
import { computeRoadmap, sameDay } from "@/lib/roadmap";
import type { PanelKey } from "@/lib/panels";

type CalendarEvent = {
  id: string;
  event_date: string;
  kind: "friend_debut" | "todo" | "deadline";
  title: string;
};

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function todayMessages(
  roadmapLabels: string[],
  events: CalendarEvent[]
): string[] {
  const messages: string[] = [];
  for (const label of roadmapLabels) {
    messages.push(`今日は「${label}」の目安日です`);
  }
  for (const ev of events) {
    if (ev.kind === "friend_debut") messages.push(`今日は${ev.title}の初配信日です`);
    else if (ev.kind === "deadline") messages.push(`今日は${ev.title}の締切日です`);
    else messages.push(`今日のタスクは${ev.title}です`);
  }
  return messages;
}

export default function HomePanel({
  userId,
  onNavigate,
}: {
  userId: string | null;
  onNavigate: (panel: PanelKey) => void;
}) {
  const [checklist] = useSyncedRecord<Record<string, boolean>>(
    userId,
    "checklist_state",
    "gajumaru:checklist:v1",
    {}
  );
  const total = CHECKLIST_CATEGORIES.reduce((s, c) => s + c.tasks.length, 0);
  const done = Object.values(checklist).filter(Boolean).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

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
  const todayISOStr = todayISO();
  const todayRoadmapLabels = roadmap.items.filter((it) => sameDay(it.d, today)).map((it) => it.label);
  const todayEvents = events.items.filter((ev) => ev.event_date === todayISOStr);
  const messages = todayMessages(todayRoadmapLabels, todayEvents);

  return (
    <div className="card">
      {messages.length > 0 && (
        <div className="empty-note" style={{ marginBottom: 12 }}>
          {messages.map((m, i) => (
            <div key={i}>{m}</div>
          ))}
        </div>
      )}
      <p className="greeting">おかえりなさい 🌳</p>
      <p className="lead" style={{ marginTop: 0 }}>
        準備チェックリストの進み具合：<b>{pct}%</b>（{done}/{total}）
      </p>
      <div className="shortcut-grid">
        <button className="shortcut-card" onClick={() => onNavigate("checklist")}>
          <div className="title">✅ 準備チェックリストの続き</div>
          <div className="desc">やることを1つずつ確認していきましょう</div>
        </button>
        <button className="shortcut-card" onClick={() => onNavigate("help")}>
          <div className="title">🌷 今日できたことを記録</div>
          <div className="desc">小さな進みも、記録すると見えてきます</div>
        </button>
        <button className="shortcut-card" onClick={() => onNavigate("ideabank")}>
          <div className="title">💡 配信ネタ帳を見る</div>
          <div className="desc">「何を話せばいいか」の不安を減らします</div>
        </button>
      </div>
    </div>
  );
}
