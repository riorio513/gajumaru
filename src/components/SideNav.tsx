"use client";

import { useState } from "react";
import { NAV_ORDER, PANEL_LABELS, type PanelKey } from "@/lib/panels";
import { createClient } from "@/lib/supabase/client";

export default function SideNav({
  active,
  onSelect,
  isLoggedIn,
}: {
  active: PanelKey;
  onSelect: (panel: PanelKey) => void;
  isLoggedIn: boolean;
}) {
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <>
      <button
        id="menuBtn"
        className="menu-btn"
        aria-label="メニューを開く"
        onClick={() => setOpen(true)}
      >
        ☰
      </button>

      <div
        className={`nav-overlay${open ? " open" : ""}`}
        onClick={() => setOpen(false)}
      />

      <nav className={`side-nav${open ? " open" : ""}`}>
        <div className="side-nav-head">
          <span>メニュー</span>
          <button
            className="nav-close"
            aria-label="閉じる"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>
        {NAV_ORDER.map((key) => (
          <button
            key={key}
            data-panel={key}
            className={active === key ? "active" : ""}
            onClick={() => {
              onSelect(key);
              setOpen(false);
            }}
          >
            {PANEL_LABELS[key]}
          </button>
        ))}
        <div className="side-nav-footer">
          {isLoggedIn ? (
            <button onClick={handleLogout}>ログアウト</button>
          ) : (
            <button
              onClick={() => {
                window.location.href = "/";
              }}
            >
              ログイン / 新規登録
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
