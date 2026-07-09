export type PanelKey =
  | "home"
  | "checklist"
  | "calendar"
  | "profile"
  | "tracker"
  | "diagnosis"
  | "glossary"
  | "ideabank"
  | "mental";

export const PANEL_LABELS: Record<PanelKey, string> = {
  home: "ホーム",
  checklist: "準備チェックリスト",
  calendar: "デビュー日逆算カレンダー",
  profile: "自己紹介文ビルダー",
  tracker: "継続トラッカー",
  diagnosis: "機材・ジャンル診断",
  glossary: "IRIAM用語集",
  ideabank: "配信ネタ帳",
  mental: "メンタルケア",
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
  "mental",
];
