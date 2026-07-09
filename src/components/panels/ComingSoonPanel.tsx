export default function ComingSoonPanel({ title }: { title: string }) {
  return (
    <div className="card">
      <h2 className="section-title">{title}</h2>
      <p className="lead">この機能は移植作業中です。もう少しお待ちください。</p>
    </div>
  );
}
