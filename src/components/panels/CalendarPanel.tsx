"use client";

import { useSyncedRecord } from "@/lib/useSyncedRecord";

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function addByRatio(start: Date, end: Date, ratio: number) {
  const span = end.getTime() - start.getTime();
  return new Date(start.getTime() + span * ratio);
}
function fmt(d: Date) {
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const MILESTONES = [
  { ratio: 0, label: "🌱 準備スタート", desc: "ここが準備期間のはじまりです" },
  { ratio: 0.15, label: "立ち絵の依頼・準備を始める目安", desc: "外注の場合は納期がかかるため早めの着手が安心" },
  { ratio: 0.45, label: "自己紹介文・初配信トーク台本づくり", desc: "「自己紹介文ビルダー」タブで下書きしておくと安心" },
  { ratio: 0.65, label: "X運用スタートの目安", desc: "投稿を習慣化し、デビュー告知の下地を作る期間" },
  { ratio: 0.9, label: "配信環境の最終チェック", desc: "機材・通信・動作確認をしておく時期" },
];

export default function CalendarPanel({ userId }: { userId: string | null }) {
  const [prepStart, setPrepStart] = useSyncedRecord<string>(
    userId,
    "prep_start_date",
    "gajumaru:prepStart:v1",
    ""
  );
  const [debutDate, setDebutDate] = useSyncedRecord<string>(
    userId,
    "debut_date",
    "gajumaru:debutDate:v1",
    ""
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function useTodayAsStart() {
    setPrepStart(todayISO());
  }

  const start = prepStart ? new Date(prepStart + "T00:00:00") : null;
  const debut = debutDate ? new Date(debutDate + "T00:00:00") : null;
  const invalidRange = !!(start && debut && debut.getTime() <= start.getTime());

  const items =
    start && debut && !invalidRange
      ? [
          ...MILESTONES.map((m) => ({
            d: addByRatio(start, debut, m.ratio),
            label: m.label,
            desc: m.desc,
          })),
          { d: debut, label: "🎉 初配信（デビュー日）", desc: "ここがスタートライン" },
          {
            d: addDays(debut, 6),
            label: "まいにち配信バッジ 達成目安",
            desc: "30分以上の配信を7日連続できた場合（途切れると取消なので無理のないペースで）",
          },
          {
            d: addDays(debut, 30),
            label: "バナーイベント（バナイベ） 目安",
            desc: "デビューからおおよそ1ヶ月後に実施されることが多いとされる時期（事務所・時期により変動）",
          },
        ]
      : [];

  return (
    <div className="card">
      <h2 className="section-title">🚀 準備ロードマップ</h2>
      <p className="lead">
        準備を始めた日（今日でOK）と、デビュー予定日（まだ決まっていなければ「これくらいかな」でOK）の両方を入れると、その間を埋めるロードマップを作ります。
      </p>
      <div className="date-input-row" style={{ marginBottom: 8 }}>
        <label style={{ fontSize: ".82rem", color: "var(--text-sub)", minWidth: 100 }}>準備開始日</label>
        <input type="date" value={prepStart} onChange={(e) => setPrepStart(e.target.value)} />
        {!prepStart && (
          <button className="btn secondary" onClick={useTodayAsStart}>
            今日にする
          </button>
        )}
      </div>
      <div className="date-input-row">
        <label style={{ fontSize: ".82rem", color: "var(--text-sub)", minWidth: 100 }}>デビュー予定日</label>
        <input type="date" value={debutDate} onChange={(e) => setDebutDate(e.target.value)} />
        {debutDate && (
          <button className="btn secondary" onClick={() => setDebutDate("")}>
            クリア
          </button>
        )}
      </div>

      {invalidRange && (
        <div className="empty-note" style={{ marginTop: 12 }}>
          デビュー予定日は準備開始日より後の日付にしてください。
        </div>
      )}

      {items.length > 0 && (
        <ul className="timeline">
          {items.map((item, i) => (
            <li key={i} className={item.d < today ? "past" : ""}>
              <div className="when">
                {fmt(item.d)}　{item.label}
              </div>
              <div className="desc">{item.desc}</div>
            </li>
          ))}
        </ul>
      )}
      <div className="disclaimer">
        <b>おことわり：</b>ここに出てくる日数の目安（X運用開始・立ち絵発注・まいにち配信バッジ・バナイベ等）はIRIAM公式の基準ではなく、事務所ブログや個人の体験談から見えてきたおおよその目安です。実際のイベント条件・仕様は公式FAQで必ず確認してください。無理のないペースを最優先にしてくださいね。
      </div>
    </div>
  );
}
