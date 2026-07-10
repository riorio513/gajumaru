"use client";

import Link from "next/link";

export default function GuestLockButton({ className = "btn" }: { className?: string }) {
  return (
    <Link href="/" className={className} style={{ textDecoration: "none", textAlign: "center" }}>
      ユーザー登録、ログインすることで利用できます
    </Link>
  );
}
