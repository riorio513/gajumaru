"use client";

import { useState } from "react";
import SideNav from "@/components/SideNav";
import HomePanel from "@/components/panels/HomePanel";
import ComingSoonPanel from "@/components/panels/ComingSoonPanel";
import { PANEL_LABELS, type PanelKey } from "@/lib/panels";

export default function ToolApp({ userId }: { userId: string | null }) {
  const [active, setActive] = useState<PanelKey>("home");

  return (
    <>
      <header>
        <div className="icon">🌳</div>
        <h1>ガジュマル</h1>
        <p>IRIAM初配信までの「準備期間」に寄り添うノート</p>
      </header>

      <SideNav active={active} onSelect={setActive} isLoggedIn={!!userId} />

      <div className="container">
        <div className="current-panel-label">{PANEL_LABELS[active]}</div>

        {active === "home" && <HomePanel onNavigate={setActive} />}
        {active === "checklist" && <ComingSoonPanel title="✅ 準備チェックリスト" />}
        {active === "calendar" && <ComingSoonPanel title="📅 デビュー日逆算カレンダー" />}
        {active === "profile" && <ComingSoonPanel title="✏️ 自己紹介文ビルダー" />}
        {active === "tracker" && <ComingSoonPanel title="📈 継続トラッカー" />}
        {active === "diagnosis" && <ComingSoonPanel title="🎛️ 機材・ジャンル診断" />}
        {active === "glossary" && <ComingSoonPanel title="📖 IRIAM用語集" />}
        {active === "ideabank" && <ComingSoonPanel title="💡 配信ネタ帳" />}
        {active === "mental" && <ComingSoonPanel title="🌷 メンタルケア" />}
      </div>

      <footer>
        ガジュマル ｜ {userId ? "アカウントに同期されています" : "ゲストモード：データはこの端末だけに保存されます"}
      </footer>
    </>
  );
}
