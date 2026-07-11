"use client";

import { useState } from "react";
import SideNav from "@/components/SideNav";
import HomePanel from "@/components/panels/HomePanel";
import ChecklistPanel from "@/components/panels/ChecklistPanel";
import CalendarPanel from "@/components/panels/CalendarPanel";
import ProfileBuilderPanel from "@/components/panels/ProfileBuilderPanel";
import TrackerPanel from "@/components/panels/TrackerPanel";
import DiagnosisPanel from "@/components/panels/DiagnosisPanel";
import GlossaryPanel from "@/components/panels/GlossaryPanel";
import IdeaBankPanel from "@/components/panels/IdeaBankPanel";
import QuadSplitPanel from "@/components/panels/QuadSplitPanel";
import HelpInfoPanel from "@/components/panels/HelpInfoPanel";
import GuestMigrationBanner from "@/components/GuestMigrationBanner";
import { PANEL_LABELS, type PanelKey } from "@/lib/panels";

export default function ToolApp({ userId, isAdmin }: { userId: string | null; isAdmin: boolean }) {
  const [active, setActive] = useState<PanelKey>("home");

  return (
    <>
      <header>
        <button
          onClick={() => setActive("home")}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "inherit", font: "inherit", textAlign: "inherit" }}
        >
          <div className="icon">🌳</div>
          <h1>ガジュマル</h1>
        </button>
        <p>IRIAM初配信までの「準備期間」に寄り添うノート</p>
      </header>

      <SideNav active={active} onSelect={setActive} isLoggedIn={!!userId} />

      <div className="container">
        <div className="current-panel-label">{PANEL_LABELS[active]}</div>

        {active === "home" && <GuestMigrationBanner userId={userId} />}
        {active === "home" && <HomePanel userId={userId} onNavigate={setActive} />}
        {active === "checklist" && <ChecklistPanel userId={userId} />}
        {active === "calendar" && <CalendarPanel userId={userId} />}
        {active === "profile" && <ProfileBuilderPanel userId={userId} />}
        {active === "tracker" && <TrackerPanel userId={userId} />}
        {active === "diagnosis" && <DiagnosisPanel />}
        {active === "glossary" && <GlossaryPanel />}
        {active === "ideabank" && <IdeaBankPanel userId={userId} />}
        {active === "quadsplit" && <QuadSplitPanel userId={userId} />}
        {active === "help" && <HelpInfoPanel userId={userId} isAdmin={isAdmin} />}
      </div>

      <footer>
        ガジュマル ｜ {userId ? "アカウントに同期されています" : "ゲストモード：データはこの端末だけに保存されます"}
      </footer>
    </>
  );
}
