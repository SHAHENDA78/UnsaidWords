"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordTooShort = password.length > 0 && password.length < 8;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace("/home");
    });
  }, [router]);
  const handleSignup = async () => {
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError("");
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/login");
  };

  return (
    <div className="bg-page text-ink min-h-screen flex flex-col px-8 py-12">
      <header className="mb-10">
        <Link href="/" className="text-2xl font-display font-bold text-plum italic">
          UnsaidWords.
        </Link>
      </header>

      <main className="flex-grow max-w-sm w-full mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2 leading-tight">
            Create your<br />private archive
          </h1>
          <p className="text-muted text-sm leading-relaxed">
            Join a sanctuary where your unsaid words find their home.
          </p>
        </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSignup(); }} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-5 py-4 rounded-2xl border border-border bg-page/30 focus:outline-none focus:border-plum transition-all text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-5 py-4 rounded-2xl border border-border bg-page/30 focus:outline-none focus:border-plum transition-all text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-4 pr-12 rounded-2xl border border-border bg-page/30 focus:outline-none focus:border-plum transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-plum transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordTooShort && (
              <p className="text-[11px] text-annoyance ml-1">
                Password must be at least 8 characters.
              </p>
            )}
          </div>

          <div className="flex items-start gap-3 px-1 py-2">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-border text-plum focus:ring-plum"
            />
            <label className="text-[10px] text-muted leading-relaxed uppercase tracking-wider font-medium">
              I agree to keep my words honest and my archive private.
            </label>
          </div>

          {error && <p className="text-xs text-annoyance">{error}</p>}

          <button
            onClick={handleSignup}
            disabled={loading || !email || !password || !name || !agreed || password.length < 8}
            className="w-full py-5 bg-plum text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform mt-4 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Creating...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted">Already have an account?</p>
          <Link href="/login" className="mt-2 inline-block text-plum font-bold hover:underline text-sm">
            Sign in to your space
          </Link>
        </div>
      </main>

      <footer className="mt-12 text-center">
        <p className="text-[10px] text-muted leading-relaxed uppercase tracking-[0.1em]">
          Locally Encrypted • Fully Private
        </p>
      </footer>
    </div>
  );
}