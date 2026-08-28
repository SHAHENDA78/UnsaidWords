"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.replace("/home");
    }, 2000);
  }

  return (
    <div className="bg-page text-ink min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-surface p-10 md:p-12 rounded-[40px] border border-border shadow-soft">
        <header className="text-center mb-10">
          <Link href="/" className="text-2xl font-display font-bold text-plum mb-4 inline-block italic">
            UnsaidWords.
          </Link>
          <h1 className="text-2xl font-bold mt-4">Set a new password</h1>
          <p className="text-muted text-sm mt-2">Choose a new password for your account</p>
        </header>

        {success ? (
          <p className="text-sm text-plum bg-plum/5 px-4 py-4 rounded-xl text-center">
            Password updated. Taking you to your archive...
          </p>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted ml-1">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={8}
                required
                className="w-full px-5 py-3 rounded-2xl border border-border bg-page/30 focus:outline-none focus:border-plum transition-all"
              />
            </div>

            {error && <p className="text-xs text-annoyance">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-plum text-white rounded-2xl font-bold shadow-lg hover:bg-[#5a3849] transition-all disabled:opacity-50"
            >
                            {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Updating...
                </span>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}