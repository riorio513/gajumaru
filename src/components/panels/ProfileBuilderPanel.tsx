"use client";

import { useState } from "react";
import { useSyncedRecord } from "@/lib/useSyncedRecord";
import GuestLockButton from "@/components/GuestLockButton";

type ProfileForm = {
  name: string;
  catch: string;
  likes: string;
  content: string;
  schedule: string;
  goal: string;
  tone: "polite" | "friendly" | "calm";
};

const DEFAULT_FORM: ProfileForm = {
  name: "",
  catch: "",
  likes: "",
  content: "",
  schedule: "",
  goal: "",
  tone: "friendly",
};

const TONE_TEXT = {
  polite: {
    greet: (n: string) => `はじめまして、${n}と申します。`,
    likes: (v: string) => `${v}が好きで、配信でもその話をすることが多いかと思います。`,
    schedule: (v: string) => `配信は${v}を目安に行っていく予定です。`,
    goal: (v: string) => `まずは${v}を目標に、少しずつ精進してまいります。`,
    close: "至らないところも多いかと思いますが、どうぞよろしくお願いいたします。",
    talkGreet: (n: string) => `皆さん、はじめまして。${n}と申します。`,
    talkClose: "まだまだ不慣れですが、少しずつ頑張っていきますので、どうぞよろしくお願いいたします。",
  },
  friendly: {
    greet: (n: string) => `はじめまして！${n}です！`,
    likes: (v: string) => `${v}が好きで、配信でもよく話すと思います！`,
    schedule: (v: string) => `配信は${v}くらいでやっていく予定です！`,
    goal: (v: string) => `まずは${v}を目指して頑張ります！`,
    close: "仲良くしてもらえたら嬉しいです、よろしくね！",
    talkGreet: (n: string) => `みなさん、はじめまして！${n}です！`,
    talkClose: "まだまだこれからだけど、みんなと楽しく配信していきたいので、よろしくお願いします！",
  },
  calm: {
    greet: (n: string) => `はじめまして、${n}です。`,
    likes: (v: string) => `${v}が好きで、のんびりその話もできたらと思います。`,
    schedule: (v: string) => `${v}くらいのペースで、ゆっくり配信できたらと思います。`,
    goal: (v: string) => `${v}を、自分のペースで叶えていけたらと思います。`,
    close: "マイペースにゆっくりやっていくので、のんびり見てもらえたら嬉しいです。",
    talkGreet: (n: string) => `はじめまして……${n}です。`,
    talkClose: "緊張しますが、マイペースに頑張っていきたいと思います。よろしくお願いします。",
  },
} as const;

export default function ProfileBuilderPanel({ userId }: { userId: string | null }) {
  const isGuest = !userId;
  const [form, setForm] = useSyncedRecord<ProfileForm>(
    userId,
    "profile_form",
    "gajumaru:profileForm:v1",
    DEFAULT_FORM
  );
  const [result, setResult] = useState<{ profile: string; talk: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  function update<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm({ ...form, [key]: value });
  }

  function generate() {
    if (!form.name.trim()) {
      alert("「呼んでほしい名前」を入力してください");
      return;
    }
    const T = TONE_TEXT[form.tone];
    const profileLines: string[] = [];
    profileLines.push(T.greet(form.name) + (form.catch ? `${form.catch}です。` : ""));
    if (form.likes) profileLines.push(T.likes(form.likes));
    if (form.content) profileLines.push(`やりたいこと・見て欲しいところ：${form.content}`);
    if (form.schedule) profileLines.push(T.schedule(form.schedule));
    if (form.goal) profileLines.push(T.goal(form.goal));
    profileLines.push(T.close);

    const talkParts: string[] = [];
    talkParts.push(T.talkGreet(form.name));
    if (form.catch) talkParts.push(`${form.catch}、というのが自分のことをひとことで言うとって感じです。`);
    if (form.likes) talkParts.push(`好きなものは${form.likes}あたりで、配信でもその話をよくすると思います。`);
    if (form.content) talkParts.push(form.content + "。");
    if (form.schedule) talkParts.push(`配信は${form.schedule}を予定しています。よかったら覚えててもらえると嬉しいです。`);
    if (form.goal) talkParts.push(form.goal + "。");
    talkParts.push(T.talkClose);

    setResult({ profile: profileLines.join("\n"), talk: talkParts.join("\n\n") });
  }

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // no-op: clipboard unavailable
    }
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="card">
      <h2 className="section-title">✏️ 自己紹介文ビルダー</h2>
      <p className="lead">項目を埋めるだけで、「プロフィール欄用の文章」と「初配信で話すトーク台本」を自動でつくります。そのままコピーして使ってください。</p>

      <div className="form-grid">
        <label className="field">
          <span className="field-label">呼んでほしい名前<em>*</em></span>
          <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="例）ののか" />
        </label>
        <label className="field">
          <span className="field-label">一言で自分を紹介すると？</span>
          <input type="text" value={form.catch} onChange={(e) => update("catch", e.target.value)} placeholder="例）お絵かき好きなのんびり配信者" />
        </label>
        <label className="field">
          <span className="field-label">好きなこと・趣味</span>
          <input type="text" value={form.likes} onChange={(e) => update("likes", e.target.value)} placeholder="例）ゲーム、お菓子作り、猫" />
        </label>
        <label className="field">
          <span className="field-label">配信で見てほしいところ・やりたいこと</span>
          <input type="text" value={form.content} onChange={(e) => update("content", e.target.value)} placeholder="例）雑談やお絵かき配信を中心にやっていきたいです" />
        </label>
        <label className="field">
          <span className="field-label">配信予定（曜日・時間帯）</span>
          <input type="text" value={form.schedule} onChange={(e) => update("schedule", e.target.value)} placeholder="例）平日21時ごろ〜、週2〜3回くらい" />
        </label>
        <label className="field">
          <span className="field-label">目標・意気込み（任意）</span>
          <input type="text" value={form.goal} onChange={(e) => update("goal", e.target.value)} placeholder="例）まずは毎日配信バッジを目指します" />
        </label>
        <label className="field">
          <span className="field-label">話し方のトーン</span>
          <select value={form.tone} onChange={(e) => update("tone", e.target.value as ProfileForm["tone"])}>
            <option value="polite">丁寧め</option>
            <option value="friendly">フレンドリー</option>
            <option value="calm">のんびり・マイペース</option>
          </select>
        </label>
      </div>

      {isGuest ? (
        <GuestLockButton className="btn" />
      ) : (
        <button className="btn" style={{ marginTop: 6 }} onClick={generate}>
          文章をつくる
        </button>
      )}

      {result && (
        <>
          <div className="output-block">
            <div className="output-head">
              <span>📋 プロフィール欄用（IRIAMの最初の7行を意識）</span>
              <button className={`copy-btn${copied === "profile" ? " copied" : ""}`} onClick={() => copy(result.profile, "profile")}>
                {copied === "profile" ? "コピーしました" : "コピー"}
              </button>
            </div>
            <textarea className="output-area" rows={8} readOnly value={result.profile} />
            <div className="char-count">{result.profile.length} / 1000文字</div>
          </div>

          <div className="output-block">
            <div className="output-head">
              <span>🎤 初配信トーク台本（話し言葉）</span>
              <button className={`copy-btn${copied === "talk" ? " copied" : ""}`} onClick={() => copy(result.talk, "talk")}>
                {copied === "talk" ? "コピーしました" : "コピー"}
              </button>
            </div>
            <textarea className="output-area" rows={10} readOnly value={result.talk} />
          </div>
        </>
      )}

      <div className="disclaimer">
        入力した内容は{userId ? "アカウント" : "この端末"}に保存され、次回開いたときも残ります。生成される文章はテンプレートに沿ったものなので、自分らしい言い回しに調整して使ってくださいね。
      </div>
    </div>
  );
}
