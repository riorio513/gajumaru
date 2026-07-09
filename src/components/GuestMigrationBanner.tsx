"use client";

import { useEffect, useState } from "react";
import { checkMigrationEligible, performMigration, dismissMigration } from "@/lib/migrateGuestData";

export default function GuestMigrationBanner({ userId }: { userId: string | null }) {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"idle" | "working" | "done">("idle");

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    checkMigrationEligible(userId).then((eligible) => {
      if (!cancelled && eligible) setVisible(true);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!visible || !userId) return null;

  async function handleMigrate() {
    setStatus("working");
    await performMigration(userId!);
    dismissMigration();
    setStatus("done");
    setTimeout(() => window.location.reload(), 900);
  }

  function handleDismiss() {
    dismissMigration();
    setVisible(false);
  }

  return (
    <div className="card" style={{ borderColor: "var(--accent)" }}>
      {status === "done" ? (
        <p style={{ margin: 0 }}>引き継ぎました。読み込み直しています…</p>
      ) : (
        <>
          <h2 className="section-title" style={{ fontSize: ".95rem" }}>
            📦 この端末の記録を引き継ぎますか？
          </h2>
          <p className="lead" style={{ marginBottom: 12 }}>
            ログイン前にこの端末で入力していた記録があります。アカウントに引き継ぐと、他の端末からも見られるようになります。
          </p>
          <div className="date-input-row" style={{ marginBottom: 0 }}>
            <button className="btn" onClick={handleMigrate} disabled={status === "working"}>
              {status === "working" ? "引き継ぎ中…" : "引き継ぐ"}
            </button>
            <button className="btn secondary" onClick={handleDismiss} disabled={status === "working"}>
              引き継がない
            </button>
          </div>
        </>
      )}
    </div>
  );
}
