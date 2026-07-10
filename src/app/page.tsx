import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AuthForm from "@/components/AuthForm";

export default async function TopPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="icon">🌳</div>
        <h1>ガジュマル</h1>
        <p className="tagline">IRIAM初配信までの「準備期間」を支えるノート</p>

        {user ? (
          <>
            <p style={{ fontSize: ".9rem", marginBottom: 20 }}>
              おかえりなさい{user.email ? `、${user.email}` : ""}さん
            </p>
            <Link href="/tool" className="btn" style={{ display: "block" }}>
              続ける
            </Link>
          </>
        ) : (
          <AuthForm />
        )}
      </div>
    </div>
  );
}
