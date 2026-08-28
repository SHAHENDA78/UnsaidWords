"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  async function handleForgotPassword() {
    if (!email) {
      setError("Enter your email above first, then tap Forgot?");
      return;
    }
    setSendingReset(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSendingReset(false);
    if (error) {
      setError(error.message);
      return;
    }
    setResetSent(true);
  }

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace("/home");
    });
  }, [router]);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.replace("/home");
  };

  return (
    <div className="bg-page text-ink min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-surface p-10 md:p-12 rounded-[40px] border border-border shadow-soft relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-plum/5 rounded-full -mr-16 -mt-16 blur-2xl" />

        <header className="text-center mb-10 relative z-10">
          <Link href="/" className="text-2xl font-display font-bold text-plum mb-4 inline-block italic">
            UnsaidWords.
          </Link>
          <h1 className="text-2xl font-bold mt-4">Welcome back</h1>
          <p className="text-muted text-sm mt-2">Sign in to your private archive</p>
        </header>

        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted ml-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-5 py-3 rounded-2xl border border-border bg-page/30 focus:outline-none focus:border-plum transition-all"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold uppercase tracking-widest text-muted">
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={sendingReset}
                className="text-xs text-plum font-medium hover:underline disabled:opacity-50"
              >
                {sendingReset ? "Sending..." : "Forgot?"}
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-5 py-3 rounded-2xl border border-border bg-page/30 focus:outline-none focus:border-plum transition-all"
            />
          </div>


          {resetSent && (
            <p className="text-xs text-plum bg-plum/5 px-4 py-3 rounded-xl">
              Check your email for a password reset link.
            </p>
          )}
          {error && <p className="text-xs text-annoyance">{error}</p>}
          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className="w-full py-4 bg-plum text-white rounded-2xl font-bold shadow-lg hover:bg-[#5a3849] transform hover:scale-[1.01] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        {/* </div> */}
         </form>

        <div className="mt-8 pt-8 border-t border-border/50 text-center relative z-10">
          <p className="text-sm text-muted">Don&apos;t have an account?</p>
          <Link href="/signup" className="mt-2 inline-block text-plum font-bold hover:underline">
            Create a private space
          </Link>
        </div>

        <p className="mt-10 text-[10px] text-muted text-center leading-relaxed">
          Your data is encrypted locally before it ever reaches our servers.<br />
          Private. Personal. Yours.
        </p>
      </div>

      <Link
        href="/"
        className="fixed top-8 left-8 text-muted hover:text-plum transition-colors flex items-center gap-2 text-sm font-medium"
      >
        ← Back to home
      </Link>
    </div>
  );
}