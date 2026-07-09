import type { PanelKey } from "@/lib/panels";

export default function HomePanel({
  onNavigate,
}: {
  onNavigate: (panel: PanelKey) => void;
}) {
  return (
    <div className="card">
      <p className="greeting">おかえりなさい 🌳</p>
      <p className="lead" style={{ marginTop: 0 }}>
        今日はどれから続けますか？
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
