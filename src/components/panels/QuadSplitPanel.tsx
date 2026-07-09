"use client";

import { useEffect, useRef, useState } from "react";

type QuadKey = "topleft" | "topright" | "bottomleft" | "bottomright";

const STEPS: { key: QuadKey; order: string; title: string; instruction: string }[] = [
  { key: "topleft", order: "①", title: "左上", instruction: "左上に配置する画像（キャラクターのビジュアルなど）を添付してください" },
  { key: "topright", order: "②", title: "右上", instruction: "右上に配置する画像（配信日時・曜日など）を添付してください" },
  { key: "bottomleft", order: "③", title: "左下", instruction: "左下に配置する画像（配信内容・企画名など）を添付してください" },
  { key: "bottomright", order: "④", title: "右下", instruction: "右下に配置する画像（配信者名・URLなど）を添付してください" },
];

type ImageEntry = { url: string; name: string };
type Stage = "start" | number | "done";

function PixelNote() {
  return (
    <div className="disclaimer" style={{ marginTop: 12 }}>
      <b>画素数の目安：</b>
      各パネルの画像は横幅1000px前後を目安に、4枚とも縦横比を揃えて用意してください。Twitterに4枚投稿した際、サイズや比率がバラバラだと2×2のグリッドがズレて表示されることがあります（正方形または16:9目安）。ファイルサイズも各画像2MB程度以内に収めておくと安心です。
    </div>
  );
}

export default function QuadSplitPanel() {
  const [stage, setStage] = useState<Stage>("start");
  const [images, setImages] = useState<Partial<Record<QuadKey, ImageEntry>>>({});
  const [pendingFile, setPendingFile] = useState<ImageEntry | null>(null);
  const urlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  function resetAll() {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    urlsRef.current = [];
    setImages({});
    setPendingFile(null);
    setStage("start");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("画像ファイルを選んでください");
      return;
    }
    const url = URL.createObjectURL(file);
    urlsRef.current.push(url);
    setPendingFile({ url, name: file.name });
  }

  function handleOk() {
    if (typeof stage !== "number" || !pendingFile) return;
    const key = STEPS[stage].key;
    setImages((prev) => ({ ...prev, [key]: pendingFile }));
    if (stage < STEPS.length - 1) {
      const next = stage + 1;
      setPendingFile(images[STEPS[next].key] ?? null);
      setStage(next);
    } else {
      setPendingFile(null);
      setStage("done");
    }
  }

  function handleBack() {
    if (typeof stage !== "number" || stage === 0) return;
    const prevStep = stage - 1;
    setPendingFile(images[STEPS[prevStep].key] ?? null);
    setStage(prevStep);
  }

  if (stage === "start") {
    return (
      <div className="card">
        <h2 className="section-title">🧩 四分割画像作成</h2>
        <p className="lead">
          左上→右上→左下→右下の順に、パネルごとの画像を1枚ずつ選んでいきます。4枚そろったら、投稿できる形にまとめて表示します。画像はこの端末の中だけで扱われ、サーバーには送信・保存されません。
        </p>
        <button className="btn" onClick={() => setStage(0)}>
          作成する
        </button>
        <PixelNote />
      </div>
    );
  }

  if (stage === "done") {
    const allSet = STEPS.every((s) => images[s.key]);
    return (
      <div className="card">
        <h2 className="section-title">🧩 四分割画像 完成</h2>
        {allSet ? (
          <>
            <p className="lead">この並びのまま、①→②→③→④の順でTwitter(X)に投稿してください。</p>
            <div className="quad-grid">
              {STEPS.map((s) => {
                const img = images[s.key]!;
                return (
                  <div className="quad-cell" key={s.key}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={s.title} />
                    <div className="quad-label">
                      {s.order} {s.title}
                    </div>
                    <a className="btn secondary" href={img.url} download={`quad-${s.key}-${img.name}`}>
                      ダウンロード
                    </a>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="empty-note">画像が揃っていません。最初からやり直してください。</div>
        )}
        <button className="btn secondary" style={{ marginTop: 14 }} onClick={resetAll}>
          最初からやり直す
        </button>
        <PixelNote />
      </div>
    );
  }

  const step = STEPS[stage];
  return (
    <div className="card">
      <h2 className="section-title">
        🧩 四分割画像作成（{stage + 1}/{STEPS.length}）
      </h2>
      <p className="lead">
        {step.order} {step.instruction}
      </p>
      <div className="date-input-row">
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>
      {pendingFile && (
        <div className="quad-cell" style={{ maxWidth: 220, marginTop: 12 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pendingFile.url} alt="プレビュー" />
        </div>
      )}
      <div className="date-input-row" style={{ marginTop: 14 }}>
        {stage > 0 && (
          <button className="btn secondary" onClick={handleBack}>
            戻る
          </button>
        )}
        <button className="btn" onClick={handleOk} disabled={!pendingFile}>
          OK
        </button>
      </div>
      <PixelNote />
    </div>
  );
}
