"use client";

import { useState } from "react";
import {
  TOP_NAV_ORDER,
  HELP_GROUP_ORDER,
  HELP_GROUP_LABEL,
  PANEL_LABELS,
  type PanelKey,
} from "@/lib/panels";
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
  const [groupOpen, setGroupOpen] = useState<boolean>(() =>
    (HELP_GROUP_ORDER as PanelKey[]).includes(active)
  );

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
        {TOP_NAV_ORDER.map((key) => (
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

        <button
          className="side-nav-group-toggle"
          aria-expanded={groupOpen}
          onClick={() => setGroupOpen((v) => !v)}
        >
          {HELP_GROUP_LABEL}
          <span className="chevron">{groupOpen ? "▾" : "▸"}</span>
        </button>
        {groupOpen && (
          <div className="side-nav-group">
            {HELP_GROUP_ORDER.map((key) => (
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
          </div>
        )}
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
