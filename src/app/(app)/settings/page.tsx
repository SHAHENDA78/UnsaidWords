"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, ShieldCheck, Bell, TriangleAlert, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { hashPin, bufferToBase64 } from "@/lib/constants";
import { FEELING_CONFIG } from "@/lib/constants";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function SettingsPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [lockArchive, setLockArchive] = useState(false);
  const [pin, setPin] = useState("");
  const [pinSaved, setPinSaved] = useState(false);
  const [editingPin, setEditingPin] = useState(false);
  const [biometricSaved, setBiometricSaved] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [settingUpBiometric, setSettingUpBiometric] = useState(false);
  const [hideInsights, setHideInsights] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setName(user.user_metadata?.full_name || "");
        setEmail(user.email || "");
        setLockArchive(user.user_metadata?.lock_archive ?? false);
        setPinSaved(!!user.user_metadata?.archive_pin);
                setBiometricSaved(!!user.user_metadata?.biometric_credential_id);
        setHideInsights(user.user_metadata?.hide_insights ?? false);
        setPushNotifications(user.user_metadata?.push_notifications ?? true);
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.PublicKeyCredential &&
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable
    ) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().then(
        setBiometricSupported
      );
    }
  }, []);

  async function handleSaveProfile() {
    setSavingProfile(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name },
    });
    setSavingProfile(false);
    if (error) {
      setMessage("Error saving profile: " + error.message);
      return;
    }
    setMessage("Profile updated.");
  }

  async function updatePreference(key: string, value: boolean) {
    const supabase = createClient();
    await supabase.auth.updateUser({ data: { [key]: value } });
  }

    async function handleSavePin() {
    if (pin.length < 4) {
      setMessage("PIN must be at least 4 digits.");
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { archive_pin: hashPin(pin) },
    });
    if (error) {
      setMessage("Error saving PIN: " + error.message);
      return;
    }
        setPinSaved(true);
    setPin("");
    setEditingPin(false);
    setMessage("Unlock PIN saved.");
  }

    async function handleSetupBiometric() {
    setSettingUpBiometric(true);
    setMessage("");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const challenge = crypto.getRandomValues(new Uint8Array(32));

      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "UnsaidWords" },
          user: {
            id: new TextEncoder().encode(user.id),
            name: user.email || "user",
            displayName: user.user_metadata?.full_name || user.email || "User",
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
        },
      })) as PublicKeyCredential;

      const credentialId = bufferToBase64(credential.rawId);

      const { error } = await supabase.auth.updateUser({
        data: { biometric_credential_id: credentialId },
      });

      if (error) throw error;

      setBiometricSaved(true);
      setMessage("Biometric unlock enabled.");
    } catch (err) {
      console.error(err);
      setMessage("Couldn't set up biometric unlock. Your device may not support it, or the prompt was cancelled.");
    } finally {
      setSettingUpBiometric(false);
    }
  }

  async function handleRemoveBiometric() {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { biometric_credential_id: null },
    });
    if (error) {
      setMessage("Error removing biometric unlock: " + error.message);
      return;
    }
    setBiometricSaved(false);
    setMessage("Biometric unlock removed.");
  }

  async function handleExport() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("feelings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Error exporting archive: " + error.message);
      return;
    }

    if (!data || data.length === 0) {
      setMessage("Your archive is empty, nothing to export yet.");
      return;
    }

    setMessage("Preparing your PDF, this may take a moment...");

    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "-9999px";
    container.style.left = "0";
    container.style.width = "595px"; 
    container.style.padding = "40px";
    container.style.backgroundColor = "#FBF8F3";
    container.style.fontFamily = "Tahoma, Arial, sans-serif";
    container.style.direction = "ltr";

    const exportDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    let html = `
      <div style="font-family: Georgia, serif; font-style: italic; font-weight: bold; font-size: 26px; color: #6B4356; margin-bottom: 6px;">
        UnsaidWords.
      </div>
      <div style="font-size: 11px; color: #8A8377; margin-bottom: 30px;">
        Exported on ${exportDate}
      </div>
    `;

    data.forEach((row) => {
      const label = FEELING_CONFIG[row.type as keyof typeof FEELING_CONFIG]?.label || row.type;
      const date = new Date(row.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      html += `
        <div style="margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #DED4C4;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="font-size: 10px; font-weight: bold; color: #6B4356; text-transform: uppercase; letter-spacing: 1px;">${label}</span>
            <span style="font-size: 10px; color: #8A8377;">${date}</span>
          </div>
          <div style="font-size: 13px; font-weight: bold; color: #2E2A24; margin-bottom: 10px; direction: rtl; text-align: right;" dir="auto">
            To: ${row.person_name}
          </div>
          <div style="font-size: 13px; color: #2E2A24; line-height: 1.7; direction: rtl; text-align: right; font-style: italic;" dir="auto">
            ${row.content}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, { scale: 2, backgroundColor: "#FBF8F3" });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({ unit: "px", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft > 0) {
        position -= pdf.internal.pageSize.getHeight();
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save("unsaidwords-archive.pdf");
      setMessage("");
    } catch (err) {
      setMessage("Error generating PDF. Please try again.");
      console.error(err);
    } finally {
      document.body.removeChild(container);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: deleteError } = await supabase
      .from("feelings")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      setMessage("Error deleting your archive: " + deleteError.message);
      setDeleting(false);
      return;
    }

    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

    async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="p-6 md:p-10">
        <p className="text-sm text-muted">Loading settings...</p>
      </main>
    );
  }

  return (
    <main className="p-6 md:p-10 pb-24">
      <header className="mb-10">
        <h2 className="text-2xl font-display font-bold italic mb-2">Settings</h2>
        <p className="text-sm text-muted">Manage your privacy and archive security.</p>
      </header>

      {message && (
        <p className="max-w-4xl mb-6 text-xs bg-plum/5 text-plum px-4 py-3 rounded-xl">
          {message}
        </p>
      )}

      <div className="max-w-4xl space-y-6">
        <section className="bg-surface p-6 rounded-2xl border border-border shadow-soft">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 flex items-center gap-3 text-muted">
            <User size={14} className="text-plum" />
            Profile Information
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl border border-border bg-page/30 focus:outline-none focus:border-plum transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-5 py-3 rounded-2xl border border-border bg-page/30 opacity-60 cursor-not-allowed"
              />
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="mt-6 px-6 py-3 bg-plum text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#5a3849] transition-all disabled:opacity-50"
          >
            {savingProfile ? "Saving..." : "Save changes"}
          </button>
        </section>

        <section className="bg-surface p-6 rounded-2xl border border-border shadow-soft">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 flex items-center gap-3 text-muted">
            <ShieldCheck size={14} className="text-plum" />
            Privacy & Security
          </h3>

          <div className="space-y-4">
            <ToggleRow
              title="Lock Archive on App Open"
              description="Require your password each time you open the app on a new session."
              checked={lockArchive}
              onChange={(v) => {
                setLockArchive(v);
                updatePreference("lock_archive", v);
              }}
            />



            {lockArchive && (
              <div className="py-3 border-b border-border">
                <p className="text-sm font-bold mb-1">Unlock PIN</p>

                                {biometricSupported && (
                  <div className="py-3 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold mb-1">Biometric Unlock</p>
                        <p className="text-xs text-muted">
                          {biometricSaved
                            ? "Use your fingerprint or face to unlock, in addition to your PIN."
                            : "Faster unlock using your device's fingerprint or face recognition."}
                        </p>
                      </div>
                      {biometricSaved ? (
                        <button
                          onClick={handleRemoveBiometric}
                          className="text-xs text-red-600 font-bold hover:underline shrink-0 ml-4"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          onClick={handleSetupBiometric}
                          disabled={settingUpBiometric}
                          className="px-4 py-2 bg-plum text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#5a3849] transition-all disabled:opacity-50 shrink-0 ml-4"
                        >
                          {settingUpBiometric ? "Setting up..." : "Enable"}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {pinSaved && !editingPin ? (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted">
                      A PIN is set for unlocking your archive.
                    </p>
                    <button
                      onClick={() => setEditingPin(true)}
                      className="text-xs text-plum font-bold hover:underline shrink-0 ml-4"
                    >
                      Change PIN
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-muted mb-3">
                      Set a PIN separate from your account password, used only to unlock your archive.
                    </p>
                    <div className="flex gap-3">
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={6}
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                        placeholder="4–6 digits"
                        className="w-32 px-4 py-2 rounded-xl border border-border bg-page/30 focus:outline-none focus:border-plum transition-all text-sm"
                      />
                      <button
                        onClick={handleSavePin}
                        className="px-4 py-2 bg-plum text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#5a3849] transition-all"
                      >
                        Save PIN
                      </button>
                      {pinSaved && (
                        <button
                          onClick={() => setEditingPin(false)}
                          className="px-4 py-2 border border-border rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-page transition-all"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}                            
            <ToggleRow
              title="Hide Insights Page"
              description="Hide visualizations and patterns from the main navigation."
              checked={hideInsights}
              onChange={(v) => {
                setHideInsights(v);
                updatePreference("hide_insights", v);
              }}
              last
            />
          </div>
        </section>

\        <section className="bg-surface p-6 rounded-2xl border border-border shadow-soft">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 flex items-center gap-3 text-muted">
            <Bell size={14} className="text-plum" />
            Follow-up Reminders
          </h3>

          <ToggleRow
            title="Push Notifications"
            description="Receive a gentle nudge to review your previous feelings. Requires enabling notifications, coming soon."
            checked={pushNotifications}
            onChange={(v) => {
              setPushNotifications(v);
              updatePreference("push_notifications", v);
            }}
            last
          />
        </section>

        <section className="bg-surface p-6 rounded-2xl border border-border shadow-soft">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 border border-border rounded-2xl text-xs font-bold uppercase tracking-widest text-muted hover:text-plum hover:border-plum transition-all"
          >
            <LogOut size={14} />
            Log out
          </button>
        </section>

        <section className="bg-red-50/30 p-6 rounded-2xl border border-red-100 shadow-soft">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-6 flex items-center gap-3 text-red-800">
            <TriangleAlert size={14} />
            Danger Zone
          </h3>

          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={handleExport}
              className="flex-grow py-3 border border-border bg-surface rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-page transition-all"
            >
              Export Archive (PDF)
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex-grow py-3 border border-red-200 text-red-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all"
            >
              Delete Account
            </button>
          </div>
          <p className="text-[10px] text-muted mt-4 text-center italic leading-relaxed">
            Deleting your account will erase your entire archive and sign you out
            permanently. This action is irreversible.
          </p>
        </section>
      </div>

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-[60] flex items-center justify-center p-6"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-surface w-full max-w-sm rounded-[32px] border border-border shadow-soft p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-6">
              <TriangleAlert size={22} />
            </div>
            <h4 className="text-lg font-display font-bold italic mb-3">
              Delete your archive?
            </h4>
            <p className="text-sm text-muted leading-relaxed mb-8">
              This permanently erases every feeling you&apos;ve archived and signs
              you out. Your login itself will remain (we can&apos;t fully delete
              accounts from here yet) — contact us if you&apos;d like it removed
              entirely.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-grow py-3 border border-border rounded-2xl font-bold text-sm hover:bg-page transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-grow py-3 bg-red-500 text-white rounded-2xl font-bold text-sm hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
  last,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-6 py-3 ${!last ? "border-b border-border" : ""}`}>
      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
          checked ? "bg-plum" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}