"use client";

import { useState, useEffect } from "react";
import { Lock, Fingerprint } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { hashPin, base64ToBuffer } from "@/lib/constants";

export function ArchiveLock({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [locked, setLocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const [biometricCredentialId, setBiometricCredentialId] = useState<string | null>(null);
  const [tryingBiometric, setTryingBiometric] = useState(false);

  useEffect(() => {
    async function checkLockSetting() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const shouldLock = user.user_metadata?.lock_archive ?? false;
        const pinExists = !!user.user_metadata?.archive_pin;
        setStoredPin(user.user_metadata?.archive_pin ?? null);
        setBiometricCredentialId(user.user_metadata?.biometric_credential_id ?? null);

        if (shouldLock && pinExists) {
          setLocked(true);
        }
      }
      setChecking(false);
    }
    checkLockSetting();
  }, []);

  async function handleBiometricUnlock() {
    if (!biometricCredentialId) return;
    setTryingBiometric(true);
    setError("");

    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));

      await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [
            { id: base64ToBuffer(biometricCredentialId), type: "public-key" },
          ],
          userVerification: "required",
          timeout: 60000,
        },
      });

      setLocked(false);
    } catch (err) {
      console.error(err);
      setError("Biometric unlock failed or was cancelled. Please use your PIN.");
    } finally {
      setTryingBiometric(false);
    }
  }

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!storedPin) {
      setError("No PIN set yet. Go to Settings to create one.");
      return;
    }

    if (hashPin(pin) !== storedPin) {
      setError("Incorrect PIN. Try again.");
      setPin("");
      return;
    }

    setLocked(false);
  }

  if (checking) return null;
  if (!locked) return <>{children}</>;

  return (
    <div className="fixed inset-0 bg-page z-[200] flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-surface p-10 rounded-[40px] border border-border shadow-soft text-center">
        <div className="w-14 h-14 rounded-full bg-plum/10 flex items-center justify-center text-plum mx-auto mb-6">
          <Lock size={22} />
        </div>
        <h1 className="text-xl font-display font-bold italic mb-2">
          Your archive is locked
        </h1>
        <p className="text-sm text-muted mb-8">
          {biometricCredentialId ? "Use biometrics or your PIN to continue." : "Enter your PIN to continue."}
        </p>

        {biometricCredentialId && (
          <button
            onClick={handleBiometricUnlock}
            disabled={tryingBiometric}
            className="w-full mb-6 flex items-center justify-center gap-2 py-4 border-2 border-plum text-plum rounded-2xl font-bold hover:bg-plum/5 transition-all disabled:opacity-50"
          >
            <Fingerprint size={20} />
            {tryingBiometric ? "Checking..." : "Unlock with biometrics"}
          </button>
        )}

        <form onSubmit={handleUnlock} className="space-y-4 text-left">
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="Or enter your PIN"
            className="w-full px-5 py-3 rounded-2xl border border-border bg-page/30 focus:outline-none focus:border-plum transition-all text-center tracking-[0.5em]"
          />

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={!pin}
            className="w-full py-4 bg-plum text-white rounded-2xl font-bold hover:bg-[#5a3849] transition-all disabled:opacity-50"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}