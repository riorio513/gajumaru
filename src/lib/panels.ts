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

export const NAV_ORDER: PanelKey[] = [
  "home",
  "checklist",
  "calendar",
  "profile",
  "tracker",
  "diagnosis",
  "glossary",
  "ideabank",
  "help",
];
