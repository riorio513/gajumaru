"use client";

import { useEffect, useRef, useState } from "react";

type PanelKey = "topleft" | "topright" | "bottomleft" | "bottomright";
type BlockKey = "top" | "bottom";
type ImageEntry = { url: string; name: string };

const PANEL_DEFS: { key: PanelKey; order: string; label: string }[] = [
  { key: "topleft", order: "①", label: "左上" },
  { key: "topright", order: "②", label: "右上" },
  { key: "bottomleft", order: "③", label: "左下" },
  { key: "bottomright", order: "④", label: "右下" },
];

type StepDef = { kind: "base" } | { kind: "block"; panelIndex: number; block: BlockKey };

const STEPS: StepDef[] = [
  { kind: "base" },
  ...PANEL_DEFS.flatMap((_, panelIndex) => [
    { kind: "block" as const, panelIndex, block: "top" as const },
    { kind: "block" as const, panelIndex, block: "bottom" as const },
  ]),
];

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

// 「タイムライン表示用の元画像」をタテヨコ半分ずつ4枚の中央イラストへ分割する
function sliceIntoCenters(img: HTMLImageElement): Record<PanelKey, HTMLCanvasElement> {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const wLeft = Math.floor(w / 2);
  const wRight = w - wLeft;
  const hTop = Math.floor(h / 2);
  const hBottom = h - hTop;

  const regions: Record<PanelKey, [number, number, number, number]> = {
    topleft: [0, 0, wLeft, hTop],
    topright: [wLeft, 0, wRight, hTop],
    bottomleft: [0, hTop, wLeft, hBottom],
    bottomright: [wLeft, hTop, wRight, hBottom],
  };

  const result = {} as Record<PanelKey, HTMLCanvasElement>;
  for (const key of Object.keys(regions) as PanelKey[]) {
    const [sx, sy, sw, sh] = regions[key];
    const canvas = document.createElement("canvas");
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    result[key] = canvas;
  }
  return result;
}

// 上部画像・中央イラスト・下部画像を、中央イラストの幅に合わせて縦に結合する
async function assemblePanel(topEntry: ImageEntry, center: HTMLCanvasElement, bottomEntry: ImageEntry): Promise<Blob | null> {
  const [topImg, bottomImg] = await Promise.all([loadImage(topEntry.url), loadImage(bottomEntry.url)]);
  const targetWidth = center.width;
  const topHeight = Math.round(topImg.naturalHeight * (targetWidth / topImg.naturalWidth));
  const bottomHeight = Math.round(bottomImg.naturalHeight * (targetWidth / bottomImg.naturalWidth));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = topHeight + center.height + bottomHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(topImg, 0, 0, topImg.naturalWidth, topImg.naturalHeight, 0, 0, targetWidth, topHeight);
  ctx.drawImage(center, 0, topHeight);
  ctx.drawImage(bottomImg, 0, 0, bottomImg.naturalWidth, bottomImg.naturalHeight, 0, topHeight + center.height, targetWidth, bottomHeight);

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png"));
}

function PixelNote() {
  return (
    <div className="disclaimer" style={{ marginTop: 12 }}>
      <b>画素数の目安：</b>
      タイムライン用の元画像は横長（16:9目安、例:2048×1186px）で用意すると、4分割後のバランスが良くなります。上部・下部の告知画像は自動的に中央イラストの幅に合わせて拡大縮小されるので、極端に細長い・横広な画像でなければ問題ありません。ファイルサイズは各画像2MB程度以内に収めておくと安心です。
    </div>
  );
}

export default function QuadSplitPanel() {
  const [stage, setStage] = useState<"start" | number | "generating" | "done">("start");
  const [baseEntry, setBaseEntry] = useState<ImageEntry | null>(null);
  const [blocks, setBlocks] = useState<Partial<Record<PanelKey, Partial<Record<BlockKey, ImageEntry>>>>>({});
  const [pendingFile, setPendingFile] = useState<ImageEntry | null>(null);
  const [error, setError] = useState("");
  const urlsRef = useRef<string[]>([]);
  const centersRef = useRef<Partial<Record<PanelKey, HTMLCanvasElement>>>({});
  const [finalImages, setFinalImages] = useState<Partial<Record<PanelKey, string>>>({});

  useEffect(() => {
    return () => {
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  function resetAll() {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    urlsRef.current = [];
    centersRef.current = {};
    setBaseEntry(null);
    setBlocks({});
    setPendingFile(null);
    setFinalImages({});
    setError("");
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

  function storedEntryForStage(idx: number): ImageEntry | null {
    const def = STEPS[idx];
    if (def.kind === "base") return baseEntry;
    const key = PANEL_DEFS[def.panelIndex].key;
    return blocks[key]?.[def.block] ?? null;
  }

  async function handleConfirm() {
    if (typeof stage !== "number" || !pendingFile) return;
    const def = STEPS[stage];

    if (def.kind === "base") {
      setError("");
      try {
        const img = await loadImage(pendingFile.url);
        centersRef.current = sliceIntoCenters(img);
      } catch {
        setError("画像の読み込みに失敗しました。別の画像でお試しください。");
        return;
      }
      setBaseEntry(pendingFile);
    } else {
      const key = PANEL_DEFS[def.panelIndex].key;
      setBlocks((prev) => ({ ...prev, [key]: { ...prev[key], [def.block]: pendingFile } }));
    }

    if (stage < STEPS.length - 1) {
      const next = stage + 1;
      setPendingFile(storedEntryForStage(next));
      setStage(next);
      return;
    }

    // 最後のステップ（右下・下部）を確定したら生成する
    const lastKey = PANEL_DEFS[(def as { panelIndex: number }).panelIndex].key;
    const finalBlocks = { ...blocks, [lastKey]: { ...blocks[lastKey], bottom: pendingFile } };

    setStage("generating");
    const results: Partial<Record<PanelKey, string>> = {};
    for (const p of PANEL_DEFS) {
      const center = centersRef.current[p.key];
      const top = finalBlocks[p.key]?.top;
      const bottom = finalBlocks[p.key]?.bottom;
      if (!center || !top || !bottom) continue;
      const blob = await assemblePanel(top, center, bottom);
      if (blob) {
        const url = URL.createObjectURL(blob);
        urlsRef.current.push(url);
        results[p.key] = url;
      }
    }
    setFinalImages(results);
    setPendingFile(null);
    setStage("done");
  }

  function handleBack() {
    if (typeof stage !== "number" || stage === 0) return;
    const prev = stage - 1;
    setPendingFile(storedEntryForStage(prev));
    setStage(prev);
  }

  if (stage === "start") {
    return (
      <div className="card">
        <h2 className="section-title">🧩 四分割画像作成</h2>
        <p className="lead">
          タイムラインで1枚に結合して見える中央イラストと、各パネルの上部・下部に載せる告知情報を順に添付していきます。4枚そろったら自動で合成し、投稿できる形にまとめます。画像はこの端末の中だけで扱われ、サーバーには送信・保存されません。
        </p>
        <button className="btn" onClick={() => setStage(0)}>
          作成する
        </button>
        <PixelNote />
      </div>
    );
  }

  if (stage === "generating") {
    return (
      <div className="card">
        <h2 className="section-title">🧩 四分割画像作成</h2>
        <div className="empty-note">生成中です…</div>
      </div>
    );
  }

  if (stage === "done") {
    const allSet = PANEL_DEFS.every((p) => finalImages[p.key]);
    return (
      <div className="card">
        <h2 className="section-title">🧩 四分割画像 完成</h2>
        {allSet ? (
          <>
            <p className="lead">この並びのまま、①→②→③→④の順でTwitter(X)に投稿してください。</p>
            <div className="quad-row">
              {PANEL_DEFS.map((p) => (
                <div className="quad-cell" key={p.key}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={finalImages[p.key]} alt={p.label} />
                  <div className="quad-label">
                    {p.order} {p.label}
                  </div>
                  <a className="btn secondary" href={finalImages[p.key]} download={`quad-${p.key}.png`}>
                    ダウンロード
                  </a>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-note">生成に失敗しました。最初からやり直してください。</div>
        )}
        <button className="btn secondary" style={{ marginTop: 14 }} onClick={resetAll}>
          最初からやり直す
        </button>
        <PixelNote />
      </div>
    );
  }

  const def = STEPS[stage];
  const isLastStep = stage === STEPS.length - 1;
  const instruction =
    def.kind === "base"
      ? "タイムラインに表示する画像を添付してください（この画像を自動で四分割し、各パネルの中央イラストにします）"
      : `${PANEL_DEFS[def.panelIndex].order} ${PANEL_DEFS[def.panelIndex].label}画像の${
          def.block === "top" ? "上部" : "下部"
        }（告知テキストなど）を添付してください`;

  return (
    <div className="card">
      <h2 className="section-title">
        🧩 四分割画像作成（{stage + 1}/{STEPS.length}）
      </h2>
      <p className="lead">{instruction}</p>
      <div className="date-input-row">
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>
      {pendingFile && (
        <div className="quad-cell" style={{ maxWidth: 220, marginTop: 12 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pendingFile.url} alt="プレビュー" />
        </div>
      )}
      {error && <div className="empty-note" style={{ marginTop: 12 }}>{error}</div>}
      <div className="date-input-row" style={{ marginTop: 14 }}>
        {stage > 0 && (
          <button className="btn secondary" onClick={handleBack}>
            戻る
          </button>
        )}
        <button className="btn" onClick={handleConfirm} disabled={!pendingFile}>
          {isLastStep ? "生成" : "OK"}
        </button>
      </div>
      <PixelNote />
    </div>
  );
}
