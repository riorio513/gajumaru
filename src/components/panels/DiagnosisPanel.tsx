"use client";

import { useState } from "react";

const BUDGET_PLANS: Record<string, { title: string; items: string[] }> = {
  "0": {
    title: "まずは今持っている端末だけでOK",
    items: ["スマホ内蔵マイク（口元から10〜20cmくらいを意識）", "静かな部屋・時間帯を選ぶ", "（あれば）スマホスタンドで固定して配信中の揺れを防ぐ"],
  },
  "10000": {
    title: "1万円以内の入門構成",
    items: ["イヤホンマイク、または安価な単一指向性USBマイク", "簡易マイクスタンド or クリップ", "ポップガード代わりのマスク・布でも可"],
  },
  "30000": {
    title: "3万円以内のステップアップ構成",
    items: ["USBコンデンサーマイク（1〜2万円台）", "マイクアーム・ポップガード", "（余裕があれば）簡易オーディオインターフェース"],
  },
  "50000": {
    title: "5万円以上のしっかり構成",
    items: ["コンデンサーマイク＋オーディオミキサー（例: YAMAHA AG03系）", "マイクアーム・ポップガード・防振マウント", "ヘッドホン（モニタリング用）"],
  },
};

const STYLE_NOTE: Record<string, string> = {
  talk: "雑談中心なら聞き取りやすさが最優先です。",
  sing: "歌枠を意識するなら、できるだけ早い段階で音質面への投資を検討すると安心です。",
  asmr: "ASMRは繊細な音まで拾う必要があるため、機材の質が特に効いてきます。",
  event: "声を演じ分けるなら、口元との距離を一定に保てるマイク環境が話しやすさに直結します。",
};

const TRAIT_GENRE_MAP: Record<string, [string, number][]> = {
  talk: [["雑談配信", 3], ["企画配信", 1]],
  listen: [["雑談配信", 2], ["お悩み相談ふう配信", 3]],
  sing: [["歌枠", 4]],
  draw: [["お絵かき配信", 4]],
  game: [["ゲーム実況", 4]],
  cook: [["料理・お菓子作り配信", 3], ["ASMR配信", 1]],
  voice: [["ASMR配信", 3], ["朗読・声劇配信", 3]],
  night: [["深夜雑談配信", 3], ["ASMR配信", 1]],
};

const GENRE_DESC: Record<string, string> = {
  "雑談配信": "一番始めやすい定番ジャンル。得意な話題を2〜3個ストックしておくと安心です。",
  "企画配信": "お題やゲーム性のある企画は初見さんも参加しやすく、盛り上がりを作りやすいです。",
  "お悩み相談ふう配信": "聞き上手を活かせるスタイル。リスナーとの距離が縮まりやすいです。",
  "歌枠": "歌唱力だけでなく選曲・MCで個性を出せます。著作権まわりのルール確認は必須です。",
  "お絵かき配信": "手元を見せながらの配信は作業工程そのものがコンテンツになります。",
  "ゲーム実況": "好きなゲームがあるなら親和性が高いジャンル。配信可能タイトルの確認を忘れずに。",
  "料理・お菓子作り配信": "生活感のある配信は共感を得やすく、視聴者との距離が縮まりやすいです。",
  "ASMR配信": "繊細な音作りが要になるジャンル。機材投資の優先度が上がりやすい点は要チェック。",
  "朗読・声劇配信": "声の表現力を活かせるジャンル。台本のストックを用意しておくと安心です。",
  "深夜雑談配信": "夜型の生活リズムと相性が良く、落ち着いた雰囲気のファン層を作りやすいです。",
};

const TRAITS = [
  { value: "talk", label: "人と話すのが好き" },
  { value: "listen", label: "聞き役・相談役が得意" },
  { value: "sing", label: "歌うのが好き" },
  { value: "draw", label: "絵を描くのが好き" },
  { value: "game", label: "ゲームが好き" },
  { value: "cook", label: "料理・お菓子作りが好き" },
  { value: "voice", label: "声・読み聞かせが好き" },
  { value: "night", label: "夜更かし・深夜型" },
];

export default function DiagnosisPanel() {
  const [device, setDevice] = useState("iphone");
  const [budget, setBudget] = useState("0");
  const [style, setStyle] = useState("talk");
  const [gearResult, setGearResult] = useState<React.ReactNode>(null);

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [genreResult, setGenreResult] = useState<React.ReactNode>(null);

  function diagnoseGear() {
    const plan = BUDGET_PLANS[budget];
    const deviceNote =
      device === "iphone"
        ? "iPhoneはLightning/USB-Cなど機種により変換アダプタが必要な場合があるので、購入前にお使いの機種の接続方式を確認してください。"
        : "AndroidはUSB OTG（外部マイク接続）に対応しているか、事前に機種名で確認してください。";
    setGearResult(
      <>
        <h4>{plan.title}</h4>
        <ul>
          {plan.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <p>{STYLE_NOTE[style]}</p>
        <p>{deviceNote}</p>
      </>
    );
  }

  function diagnoseGenre() {
    const selected = Object.entries(checked).filter(([, v]) => v).map(([k]) => k);
    if (selected.length === 0) {
      alert("得意なこと・好きなことを1つ以上チェックしてください");
      return;
    }
    const scores: Record<string, number> = {};
    selected.forEach((trait) => {
      (TRAIT_GENRE_MAP[trait] || []).forEach(([genre, score]) => {
        scores[genre] = (scores[genre] || 0) + score;
      });
    });
    const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 3);
    setGenreResult(
      <>
        <h4>相性の良さそうな配信ジャンル候補</h4>
        <ul>
          {ranked.map(([genre]) => (
            <li key={genre}>
              <b>{genre}</b> — {GENRE_DESC[genre] || ""}
            </li>
          ))}
        </ul>
        <p>あくまで候補です。実際に試してみて、自分が一番楽しく続けられそうなものを選んでくださいね。</p>
      </>
    );
  }

  return (
    <>
      <div className="card">
        <h2 className="section-title">🎛️ 機材診断</h2>
        <p className="lead">端末・予算・やりたい配信スタイルを選ぶと、目安の機材構成を提案します（非AI・固定ロジックによる診断です）。</p>
        <div className="form-grid">
          <label className="field">
            <span className="field-label">使う端末</span>
            <select value={device} onChange={(e) => setDevice(e.target.value)}>
              <option value="iphone">iPhone</option>
              <option value="android">Android</option>
            </select>
          </label>
          <label className="field">
            <span className="field-label">機材にかけられる予算</span>
            <select value={budget} onChange={(e) => setBudget(e.target.value)}>
              <option value="0">0円（今持っているものだけ）</option>
              <option value="10000">1万円以内</option>
              <option value="30000">3万円以内</option>
              <option value="50000">5万円以上</option>
            </select>
          </label>
          <label className="field">
            <span className="field-label">やりたい配信スタイル</span>
            <select value={style} onChange={(e) => setStyle(e.target.value)}>
              <option value="talk">雑談中心</option>
              <option value="sing">歌枠中心</option>
              <option value="asmr">ASMR中心</option>
              <option value="event">企画・声劇中心</option>
            </select>
          </label>
        </div>
        <button className="btn" onClick={diagnoseGear}>機材を診断する</button>
        {gearResult && <div className="result-box">{gearResult}</div>}
      </div>

      <div className="card">
        <h2 className="section-title">🌱 配信ジャンル診断</h2>
        <p className="lead">得意なこと・好きなことをチェックすると、相性の良さそうな配信ジャンルの候補を出します。</p>
        <div className="checkbox-grid">
          {TRAITS.map((t) => (
            <label key={t.value}>
              <input
                type="checkbox"
                checked={!!checked[t.value]}
                onChange={(e) => setChecked({ ...checked, [t.value]: e.target.checked })}
              />
              {t.label}
            </label>
          ))}
        </div>
        <button className="btn" onClick={diagnoseGenre}>ジャンルを診断する</button>
        {genreResult && <div className="result-box">{genreResult}</div>}
      </div>
    </>
  );
}
