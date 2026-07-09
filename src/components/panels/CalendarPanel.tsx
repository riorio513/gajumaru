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
const DOW = ["日", "月", "火", "水", "木", "金", "土"];
function fmtWithDow(d: Date) {
  return `${fmt(d)}(${DOW[d.getDay()]})`;
}
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// バナーイベント（バナイベ）の参加週は、IRIAM公式FAQにより「初配信日時」の
// 月内の日付レンジで決まる（4:00が日付の区切り）。月の日数によって区切りが変わる。
function getBanivWeek(date: Date): 1 | 2 | 3 | 4 {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let breakpoints: [number, number, number];
  if (daysInMonth === 31) breakpoints = [8, 16, 24];
  else if (daysInMonth === 30) breakpoints = [8, 16, 23];
  else if (daysInMonth === 29) breakpoints = [8, 15, 22];
  else breakpoints = [7, 14, 21]; // 28日の2月
  if (day <= breakpoints[0]) return 1;
  if (day <= breakpoints[1]) return 2;
  if (day <= breakpoints[2]) return 3;
  return 4;
}
function firstTuesdayOfMonth(year: number, month: number) {
  const d = new Date(year, month, 1);
  const diff = (2 - d.getDay() + 7) % 7;
  d.setDate(1 + diff);
  return d;
}
function getBanivPeriod(debut: Date) {
  const week = getBanivWeek(debut);
  let targetYear = debut.getFullYear();
  let targetMonth = debut.getMonth() + 1;
  if (targetMonth > 11) {
    targetMonth = 0;
    targetYear += 1;
  }
  const start = addDays(firstTuesdayOfMonth(targetYear, targetMonth), (week - 1) * 7);
  const end = addDays(start, 6);
  return { week, start, end };
}

// spanDaysがRUSHED_THRESHOLD_DAYS未満の場合、各項目のdescを
// descShort（時間が少ない前提の言い回し）に差し替える
const RUSHED_THRESHOLD_DAYS = 14;

const MILESTONES = [
  {
    ratio: 0,
    label: "🌱 準備スタート",
    desc: "ここが準備期間のはじまりです",
    descShort: "ここが準備期間のはじまりです",
  },
  {
    ratio: 0.15,
    label: "立ち絵の依頼・準備を始める目安",
    desc: "外注の場合は納期がかかるため早めの着手が安心",
    descShort: "時間が限られているので、無理に外注せず、今ある素材やシンプルな見た目でも大丈夫です",
  },
  {
    ratio: 0.45,
    label: "自己紹介文・初配信トーク台本づくり",
    desc: "「自己紹介文ビルダー」タブで下書きしておくと安心",
    descShort: "凝った台本を作る時間がなければ、「自己紹介文ビルダー」で最低限の一言だけでも用意しておきましょう",
  },
  {
    ratio: 0.65,
    label: "X運用スタートの目安",
    desc: "投稿を習慣化し、デビュー告知の下地を作る期間",
    descShort: "今からアカウントを作るだけでも十分です。無理に投稿実績を積もうとしなくて大丈夫",
  },
  {
    ratio: 0.9,
    label: "配信環境の最終チェック",
    desc: "機材・通信・動作確認をしておく時期",
    descShort: "最低限、音声と通信が安定して届くかだけは確認しておきましょう",
  },
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

  const banivPeriod = debut ? getBanivPeriod(debut) : null;

  const spanDays =
    start && debut && !invalidRange ? Math.round((debut.getTime() - start.getTime()) / 86400000) : null;
  const isRushed = spanDays !== null && spanDays < RUSHED_THRESHOLD_DAYS;

  const items =
    start && debut && !invalidRange
      ? [
          ...MILESTONES.map((m) => ({
            d: addByRatio(start, debut, m.ratio),
            label: m.label,
            desc: isRushed ? m.descShort : m.desc,
          })),
          { d: debut, label: "🎉 初配信（デビュー日）", desc: "ここがスタートライン" },
          {
            d: addDays(debut, 6),
            label: "まいにち配信バッジ 達成目安",
            desc: "30分以上の配信を7日連続できた場合（途切れると取消なので無理のないペースで）",
          },
          ...(banivPeriod
            ? [
                {
                  d: banivPeriod.start,
                  label: `🎪 バナーイベント参加週（翌月${banivPeriod.week}週目）`,
                  desc: `${fmtWithDow(banivPeriod.start)}19:00 〜 ${fmtWithDow(banivPeriod.end)}23:59 が参加対象の見込みです`,
                },
              ]
            : []),
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

      {isRushed && (
        <div className="empty-note" style={{ marginTop: 12 }}>
          {spanDays !== null && spanDays <= 3 ? "🚨" : "⏱️"}{" "}
          準備期間があと{spanDays}日と短めです。無理に全部をこなす必要はありません。優先順位をつけて、できる範囲で進めましょう（下の説明文も短い準備期間向けの内容に変えています）。
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
        <b>おことわり：</b>X運用開始・立ち絵発注・まいにち配信バッジの目安はIRIAM公式の基準ではなく、事務所ブログや個人の体験談から見えてきたおおよその目安です。バナーイベント参加週は公式FAQの「初配信日時で決まる」ルールをもとに計算していますが、①1日の区切りは4:00のため配信開始時刻によっては前後の週になる場合がある、②その月に火曜日が5回ある場合は日程調整が入り表示とずれる場合がある、という点にご注意ください。実際のイベント条件・仕様は必ず公式FAQでご確認ください。無理のないペースを最優先にしてくださいね。
      </div>
    </div>
  );
}
