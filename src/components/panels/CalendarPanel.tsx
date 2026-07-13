"use client";

import { useEffect, useState } from "react";
import { useSyncedRecord } from "@/lib/useSyncedRecord";
import { computeRoadmap } from "@/lib/roadmap";

function fmt(d: Date) {
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function CalendarPanel({ userId }: { userId: string | null }) {
  const [prepStart, setPrepStart, prepStartLoaded] = useSyncedRecord<string>(
    userId,
    "prep_start_date",
    "gajumaru:prepStart:v1",
    ""
  );
  const [debutDate, setDebutDate, debutDateLoaded] = useSyncedRecord<string>(
    userId,
    "debut_date",
    "gajumaru:debutDate:v1",
    ""
  );

  const [draftPrepStart, setDraftPrepStart] = useState("");
  const [draftDebutDate, setDraftDebutDate] = useState("");

  useEffect(() => {
    if (prepStartLoaded) setDraftPrepStart(prepStart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prepStartLoaded]);
  useEffect(() => {
    if (debutDateLoaded) setDraftDebutDate(debutDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debutDateLoaded]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function useTodayAsStart() {
    setDraftPrepStart(todayISO());
  }

  function confirmDates() {
    setPrepStart(draftPrepStart);
    setDebutDate(draftDebutDate);
  }

  function clearDebut() {
    setDraftDebutDate("");
    setDebutDate("");
  }

  const { invalidRange, spanDays, isRushed, isLong, items } = computeRoadmap(prepStart, debutDate);

  return (
    <div className="card">
      <h2 className="section-title">🚀 準備ロードマップ</h2>
      <p className="lead">
        準備開始日と、デビュー予定日（決まっていないときは「大体このくらい」の目安でOK）を入力することで、その間に必要な準備のロードマップを作成します。
      </p>
      <div className="date-input-row" style={{ marginBottom: 8 }}>
        <label style={{ fontSize: ".82rem", color: "var(--text-sub)", minWidth: 100 }}>準備開始日</label>
        <input type="date" value={draftPrepStart} onChange={(e) => setDraftPrepStart(e.target.value)} />
        {!draftPrepStart && (
          <button className="btn secondary" onClick={useTodayAsStart}>
            今日にする
          </button>
        )}
      </div>
      <div className="date-input-row" style={{ marginBottom: 8 }}>
        <label style={{ fontSize: ".82rem", color: "var(--text-sub)", minWidth: 100 }}>デビュー予定日</label>
        <input type="date" value={draftDebutDate} onChange={(e) => setDraftDebutDate(e.target.value)} />
        {draftDebutDate && (
          <button className="btn secondary" onClick={clearDebut}>
            クリア
          </button>
        )}
      </div>
      <button
        className="btn"
        style={{ marginBottom: 8 }}
        disabled={!draftPrepStart || !draftDebutDate}
        onClick={confirmDates}
      >
        決定
      </button>

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

      {isLong && (
        <div className="empty-note" style={{ marginTop: 12 }}>
          🌳 準備期間が{Math.round((spanDays ?? 0) / 30)}ヶ月ほどと長めです。主要なマイルストーンの間に、月1回の「ふりかえりチェックポイント」を挟んでいます。焦らず、こまめに進み具合を確認しながら進めましょう。
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
        <b>おことわり：</b>X運用開始・立ち絵発注・まいにち配信バッジの目安、および「ふりかえりチェックポイント」はIRIAM公式の基準ではなく、事務所ブログや個人の体験談から見えてきたおおよその目安です。バナーイベント参加週は公式FAQの「初配信日時で決まる」ルールをもとに計算していますが、①1日の区切りは4:00のため配信開始時刻によっては前後の週になる場合がある、②その月に火曜日が5回ある場合は日程調整が入り表示とずれる場合がある、という点にご注意ください。実際のイベント条件・仕様は必ず公式FAQでご確認ください。無理のないペースを最優先にしてくださいね。
      </div>
    </div>
  );
}
