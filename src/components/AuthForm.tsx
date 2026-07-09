"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";
type Status = "idle" | "sending" | "error";

export default function AuthForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function switchMode(next: Mode) {
    setMode(next);
    setStatus("idle");
    setErrorMsg("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setStatus("sending");
    setErrorMsg("");
    const supabase = createClient();

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setStatus("error");
        setErrorMsg(error.message);
        return;
      }
      window.location.href = "/tool";
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }
    window.location.href = "/tool";
  }

  return (
    <>
      <div className="segmented">
        <button
          type="button"
          className={mode === "login" ? "active" : ""}
          onClick={() => switchMode("login")}
        >
          ログイン
        </button>
        <button
          type="button"
          className={mode === "signup" ? "active" : ""}
          onClick={() => switchMode("signup")}
        >
          新規登録
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">メールアドレス</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <label htmlFor="password">パスワード</label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="6文字以上"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
        />
        <button
          type="submit"
          className="btn"
          style={{ width: "100%", marginTop: 16 }}
          disabled={status === "sending"}
        >
          {status === "sending"
            ? "送信中..."
            : mode === "signup"
            ? "登録してはじめる"
            : "ログイン"}
        </button>
        {status === "error" && <p className="status-msg err">{errorMsg}</p>}
      </form>

      <a href="/tool" className="guest-link">
        アカウントを作らずに使ってみる →
      </a>
    </>
  );
}
