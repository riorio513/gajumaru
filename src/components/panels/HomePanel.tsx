import { useSyncedRecord } from "@/lib/useSyncedRecord";
import { CHECKLIST_CATEGORIES } from "@/lib/checklistData";
import type { PanelKey } from "@/lib/panels";

export default function HomePanel({
  userId,
  onNavigate,
}: {
  userId: string | null;
  onNavigate: (panel: PanelKey) => void;
}) {
  const [checklist] = useSyncedRecord<Record<string, boolean>>(
    userId,
    "checklist_state",
    "gajumaru:checklist:v1",
    {}
  );
  const total = CHECKLIST_CATEGORIES.reduce((s, c) => s + c.tasks.length, 0);
  const done = Object.values(checklist).filter(Boolean).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="card">
      <p className="greeting">おかえりなさい 🌳</p>
      <p className="lead" style={{ marginTop: 0 }}>
        準備チェックリストの進み具合：<b>{pct}%</b>（{done}/{total}）
      </p>
      <div className="shortcut-grid">
        <button className="shortcut-card" onClick={() => onNavigate("checklist")}>
          <div className="title">✅ 準備チェックリストの続き</div>
          <div className="desc">やることを1つずつ確認していきましょう</div>
        </button>
        <button className="shortcut-card" onClick={() => onNavigate("mental")}>
          <div className="title">🌷 今日できたことを記録</div>
          <div className="desc">小さな進みも、記録すると見えてきます</div>
        </button>
        <button className="shortcut-card" onClick={() => onNavigate("ideabank")}>
          <div className="title">💡 配信ネタ帳を見る</div>
          <div className="desc">「何を話せばいいか」の不安を減らします</div>
        </button>
      </div>
    </div>
  );
}
