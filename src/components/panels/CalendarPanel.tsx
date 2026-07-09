"use client";

import { useSyncedRecord } from "@/lib/useSyncedRecord";

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function fmt(d: Date) {
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

export default function CalendarPanel({ userId }: { userId: string | null }) {
  const [debutDate, setDebutDate] = useSyncedRecord<string>(
    userId,
    "debut_date",
    "gajumaru:debutDate:v1",
    ""
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const items = debutDate
    ? (() => {
        const debut = new Date(debutDate + "T00:00:00");
        return [
          { d: addDays(debut, -30), label: "立ち絵の依頼・準備を始める目安", desc: "外注の場合は納期がかかるため早めの着手が安心" },
          { d: addDays(debut, -14), label: "X運用スタートの目安", desc: "投稿を習慣化し、デビュー告知の下地を作る期間" },
          { d: addDays(debut, -7), label: "配信環境の最終チェック", desc: "機材・通信・動作確認、初配信の台本づくり" },
          { d: debut, label: "🎉 初配信（デビュー日）", desc: "ここがスタートライン" },
          { d: addDays(debut, 6), label: "まいにち配信バッジ 達成目安", desc: "30分以上の配信を7日連続できた場合（途切れると取消なので無理のないペースで）" },
          { d: addDays(debut, 30), label: "バナーイベント（バナイベ） 目安", desc: "デビューからおおよそ1ヶ月後に実施されることが多いとされる時期（事務所・時期により変動）" },
        ];
      })()
    : [];

  return (
    <div className="card">
      <h2 className="section-title">📅 デビュー日から逆算</h2>
      <p className="lead">デビュー予定日（まだ決まっていなければ「これくらいかな」でOK）を入れると、目安のスケジュールを組み立てます。</p>
      <div className="date-input-row">
        <input
          type="date"
          value={debutDate}
          onChange={(e) => setDebutDate(e.target.value)}
        />
        {debutDate && (
          <button className="btn secondary" onClick={() => setDebutDate("")}>
            クリア
          </button>
        )}
      </div>
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
