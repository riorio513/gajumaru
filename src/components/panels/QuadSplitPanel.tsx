"use client";

import { useEffect, useRef, useState } from "react";

type QuadKey = "topleft" | "topright" | "bottomleft" | "bottomright";

const QUAD_DEFS: { key: QuadKey; order: string; label: string }[] = [
  { key: "topleft", order: "①", label: "左上（キャラ画像など）" },
  { key: "topright", order: "②", label: "右上（配信日時など）" },
  { key: "bottomleft", order: "③", label: "左下（配信内容など）" },
  { key: "bottomright", order: "④", label: "右下（配信者情報など）" },
];

function sliceToBlob(img: HTMLImageElement, sx: number, sy: number, sw: number, sh: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      resolve(null);
      return;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

export default function QuadSplitPanel() {
  const [quadUrls, setQuadUrls] = useState<Record<QuadKey, string> | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const urlsRef = useRef<string[]>([]);

  function revokeAll() {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    urlsRef.current = [];
  }

  useEffect(() => {
    return () => revokeAll();
  }, []);

  function clearResult() {
    revokeAll();
    setQuadUrls(null);
    setError("");
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("画像ファイルを選択してください");
      return;
    }

    clearResult();
    setProcessing(true);

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = async () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const wLeft = Math.floor(w / 2);
      const wRight = w - wLeft;
      const hTop = Math.floor(h / 2);
      const hBottom = h - hTop;

      const regions: Record<QuadKey, [number, number, number, number]> = {
        topleft: [0, 0, wLeft, hTop],
        topright: [wLeft, 0, wRight, hTop],
        bottomleft: [0, hTop, wLeft, hBottom],
        bottomright: [wLeft, hTop, wRight, hBottom],
      };

      const result = {} as Record<QuadKey, string>;
      for (const key of QUAD_DEFS.map((q) => q.key)) {
        const [sx, sy, sw, sh] = regions[key];
        const blob = await sliceToBlob(img, sx, sy, sw, sh);
        if (blob) {
          const url = URL.createObjectURL(blob);
          urlsRef.current.push(url);
          result[key] = url;
        }
      }

      URL.revokeObjectURL(objectUrl);
      setQuadUrls(result);
      setProcessing(false);
    };
    img.onerror = () => {
      setError("画像の読み込みに失敗しました。別の画像でお試しください。");
      URL.revokeObjectURL(objectUrl);
      setProcessing(false);
    };
    img.src = objectUrl;
  }

  return (
    <div className="card">
      <h2 className="section-title">🧩 四分割画像作成</h2>
      <p className="lead">
        キャラ・配信日時・配信内容・配信者情報などをまとめた1枚の告知イラストを選ぶと、Twitter投稿用に「左上・右上・左下・右下」の4枚へタテヨコ半分ずつ自動で分割します。画像はこの端末の中だけで処理され、サーバーには送信・保存されません。
      </p>

      <div className="date-input-row">
        <input type="file" accept="image/*" onChange={handleFile} />
        {(quadUrls || processing) && (
          <button className="btn secondary" onClick={clearResult}>
            クリア
          </button>
        )}
      </div>

      {processing && <div className="empty-note" style={{ marginTop: 12 }}>分割中です…</div>}
      {error && <div className="empty-note" style={{ marginTop: 12 }}>{error}</div>}

      {quadUrls && (
        <>
          <div className="quad-grid">
            {QUAD_DEFS.map((q) => (
              <div className="quad-cell" key={q.key}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={quadUrls[q.key]} alt={q.label} />
                <div className="quad-label">
                  {q.order} {q.label}
                </div>
                <a className="btn secondary" href={quadUrls[q.key]} download={`quad-${q.key}.png`}>
                  ダウンロード
                </a>
              </div>
            ))}
          </div>
          <p className="lead" style={{ marginTop: 12, marginBottom: 0 }}>
            Twitter(X)に投稿するときは、①→②→③→④の順番で4枚を選択してください。順番を間違えるとタイムライン上で画像がバラバラに表示されてしまいます。
          </p>
        </>
      )}

      <div className="disclaimer">
        <b>おことわり：</b>
        この機能は選んだ画像をタテヨコ半分ずつ機械的に4分割するだけです。あらかじめ「キャラ・日時・内容・配信者情報」の4要素を1枚の画像の中に2×2で配置してから読み込んでください。分割位置の調整や文字入れ、テンプレート作成には対応していません。
      </div>
    </div>
  );
}
