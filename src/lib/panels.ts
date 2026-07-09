export type PanelKey =
  | "home"
  | "checklist"
  | "calendar"
  | "profile"
  | "tracker"
  | "diagnosis"
  | "glossary"
  | "ideabank"
  | "help";

export const PANEL_LABELS: Record<PanelKey, string> = {
  home: "ホーム",
  checklist: "準備チェックリスト",
  calendar: "準備ロードマップ",
  profile: "自己紹介文ビルダー",
  tracker: "枠周り記録",
  diagnosis: "機材・ジャンル診断",
  glossary: "IRIAM用語集",
  ideabank: "配信ネタ帳",
  help: "お役立ち情報",
};

// ハンバーガーメニューのトップレベル項目
export const TOP_NAV_ORDER: PanelKey[] = ["home", "checklist", "calendar"];

// 「お役立ち機能」サブメニューにまとめる項目
export const HELP_GROUP_LABEL = "お役立ち機能";
export const HELP_GROUP_ORDER: PanelKey[] = [
  "profile",
  "tracker",
  "diagnosis",
  "glossary",
  "ideabank",
  "help",
];

export const NAV_ORDER: PanelKey[] = [...TOP_NAV_ORDER, ...HELP_GROUP_ORDER];
