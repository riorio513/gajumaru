"use client";

import { useState } from "react";

const GLOSSARY = [
  { term: "ギフト", desc: "リスナーが配信者に贈るアイテム。ダイヤを使って送ることができます。" },
  { term: "スター", desc: "配信の応援・盛り上がりに関わるポイントの一種です。" },
  { term: "ダイヤ（時間ダイヤ・応援ダイヤ）", desc: "IRIAM内で使うポイント。時間経過で貯まる「時間ダイヤ」と、購入する「応援ダイヤ」などの種類があります。" },
  { term: "応援ポイント", desc: "リスナーが配信者を応援する際に貯まるポイント。ランキングや特典に関わることがあります。" },
  { term: "盛り上がりスコア", desc: "配信の盛り上がり度合いを示す指標。ギフトやコメントなどの反応から算出されるとされています。" },
  { term: "ランク（D〜S帯）", desc: "活動状況などに応じて設定される段階。上位ランクほど露出や機能面で有利になるとされます。※計算式は公式非公開・推定値です。" },
  { term: "あんしんランクスコア", desc: "安心して配信・視聴できるかどうかの指標とされるスコア。詳細は公式非公開です。" },
  { term: "まいにち配信バッジ", desc: "30分以上の配信を一定日数（目安7日）連続で行うと得られるバッジ。途中で途切れると連続記録がリセットされるとされます。" },
  { term: "プロフタグ・キャラタグ", desc: "プロフィールに設定できるタグ。リスナーが好みの配信者を見つける手がかりになります。" },
  { term: "初心者向け配信・ウェルカムパス", desc: "デビュー直後のライバーを対象にした初期支援の仕組み。露出のサポートなどが含まれるとされます。" },
  { term: "トップバナーチャレンジ（バナイベ）", desc: "アプリのトップ画面のバナー掲載枠を目指すイベント。デビューから一定期間後に参加できるようになることが多いとされます。" },
  { term: "枠周り", desc: "他のライバーの配信（＝枠）に挨拶やコメントをしに行くこと。関係作りや認知拡大のための活動です。" },
  { term: "準備期間", desc: "初配信前にX運用や設定準備などを行う期間の慣習。数週間〜年単位かける人もいるとされます。" },
];

export default function GlossaryPanel() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const list = GLOSSARY.filter((g) => !q || g.term.toLowerCase().includes(q) || g.desc.toLowerCase().includes(q));

  return (
    <div className="card">
      <h2 className="section-title">📖 IRIAM用語集</h2>
      <p className="lead">配信を始める前に出会う独自用語をまとめました。</p>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="用語を検索（例：ダイヤ）"
        style={{ width: "100%", marginBottom: 14 }}
      />
      {list.length === 0 ? (
        <div className="empty-note">該当する用語が見つかりませんでした。</div>
      ) : (
        list.map((g) => (
          <div className="glossary-item" key={g.term}>
            <div className="term">{g.term}</div>
            <div className="desc">{g.desc}</div>
          </div>
        ))
      )}
      <div className="disclaimer">
        <b>おことわり：</b>各用語の説明はIRIAM公式FAQや配信者向け情報をもとにした要約です。ランクの計算式など一部は公式非公開・推定値の情報も含まれるため、正式な仕様は必ずアプリ内の公式ヘルプでご確認ください。
      </div>
    </div>
  );
}
