export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function addByRatio(start: Date, end: Date, ratio: number) {
  const span = end.getTime() - start.getTime();
  return new Date(start.getTime() + span * ratio);
}

export function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const DOW = ["日", "月", "火", "水", "木", "金", "土"];
function fmtWithDow(d: Date) {
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}(${DOW[d.getDay()]})`;
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
export function getBanivPeriod(debut: Date) {
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

// spanDaysがLONG_THRESHOLD_DAYS以上（目安：数ヶ月〜1年）の場合、
// 主要マイルストーンの間隔が空きすぎるため、月1回の振り返りチェックポイントを挟み込む
const LONG_THRESHOLD_DAYS = 120;
const CHECKPOINT_INTERVAL_DAYS = 30;

function buildCheckpoints(start: Date, debut: Date, spanDays: number) {
  const points: { d: Date; label: string; desc: string }[] = [];
  for (let d = CHECKPOINT_INTERVAL_DAYS; d < spanDays - 14; d += CHECKPOINT_INTERVAL_DAYS) {
    points.push({
      d: addDays(start, d),
      label: "📝 進み具合ふりかえりチェックポイント",
      desc: "ここまでの準備をふりかえり、遅れているところがあれば優先順位を調整しましょう。ペースが早すぎてもゆっくりで大丈夫です",
    });
  }
  return points;
}

export const MILESTONES = [
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
    descShort: "時間が限られているため、外注を焦るより、デビュー日を見直すか、ラジオ配信から始めることが推奨されます",
  },
  {
    ratio: 0.3,
    label: "🎨 クリエイティブ素材の準備目安",
    desc: "配信BGM・ヘッダー/アイコン・アイコンリング・SDキャライラスト・ファンサーバーのアイコンなど、時間がかかりやすい素材をこの頃までに揃え始めると安心",
    descShort: "全部は揃わなくてOK。ヘッダー/アイコンだけでも先に用意しておくと当日困りません",
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

export type RoadmapItem = { d: Date; label: string; desc: string };

export type RoadmapMeta = {
  start: Date | null;
  debut: Date | null;
  invalidRange: boolean;
  spanDays: number | null;
  isRushed: boolean;
  isLong: boolean;
  banivPeriod: { week: number; start: Date; end: Date } | null;
  items: RoadmapItem[];
};

export function computeRoadmap(prepStartISO: string, debutISO: string): RoadmapMeta {
  const start = prepStartISO ? new Date(prepStartISO + "T00:00:00") : null;
  const debut = debutISO ? new Date(debutISO + "T00:00:00") : null;
  const invalidRange = !!(start && debut && debut.getTime() <= start.getTime());
  const banivPeriod = debut ? getBanivPeriod(debut) : null;
  const spanDays =
    start && debut && !invalidRange ? Math.round((debut.getTime() - start.getTime()) / 86400000) : null;
  const isRushed = spanDays !== null && spanDays < RUSHED_THRESHOLD_DAYS;
  const isLong = spanDays !== null && spanDays >= LONG_THRESHOLD_DAYS;

  const items =
    start && debut && !invalidRange
      ? [
          ...MILESTONES.map((m) => ({
            d: addByRatio(start, debut, m.ratio),
            label: m.label,
            desc: isRushed ? m.descShort : m.desc,
          })),
          { d: debut, label: "🎉 初配信（デビュー日）", desc: "ここがスタートライン。楽しい配信をしてください" },
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
          ...(isLong && spanDays !== null ? buildCheckpoints(start, debut, spanDays) : []),
        ].sort((a, b) => a.d.getTime() - b.d.getTime())
      : [];

  return { start, debut, invalidRange, spanDays, isRushed, isLong, banivPeriod, items };
}
