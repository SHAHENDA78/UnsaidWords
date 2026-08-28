"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FeelingType } from "@/lib/types";
import { FEELING_CONFIG } from "@/lib/constants";
import { createClient } from "@/lib/supabase";
import { ArrowRight } from "lucide-react";
import { DateTimePicker } from "@/components/feelings/DateTimePicker";
const FEELING_TYPES: FeelingType[] = ["gratitude", "apology", "admiration", "annoyance"];

const FOLLOW_UP_OPTIONS = [
  { label: "Don't remind me", value: "none" },
  { label: "In a week", value: "week" },
  { label: "In a month", value: "month" },
  { label: "In 3 months", value: "3months" },
  { label: "Pick a date & time", value: "custom" },
];

function calculateFollowUpDate(option: string, customDateTime?: string): string | null {
  if (option === "none") return null;
  if (option === "custom") {
    return customDateTime ? new Date(customDateTime).toISOString() : null;
  }
  const date = new Date();
  if (option === "week") date.setDate(date.getDate() + 7);
  if (option === "month") date.setMonth(date.getMonth() + 1);
  if (option === "3months") date.setMonth(date.getMonth() + 3);
  return date.toISOString();
}

export default function AddPage() {
  const router = useRouter();
  const [type, setType] = useState<FeelingType>("gratitude");
  const [personName, setPersonName] = useState("");
  const [content, setContent] = useState("");
  const [followUp, setFollowUp] = useState("none");
    const [customDateTime, setCustomDateTime] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("You need to be logged in.");
      setSaving(false);
      router.push("/login");
      return;
    }

        const followUpDate = calculateFollowUpDate(followUp, customDateTime);

    console.log("Submitting with follow-up value:", followUp, "-> date:", followUpDate);

    const { error } = await supabase.from("feelings").insert({
      user_id: user.id,
      type,
      person_name: personName,
      content,
      follow_up_at: followUpDate,
    });

    setSaving(false);

    if (error) {
      console.error("Error saving feeling:", error);
      if (error.message.includes("fetch") || error.message.includes("network")) {
        alert("Couldn't connect. Please check your internet connection and try again — your entry hasn't been lost, it's still in the form.");
      } else {
        alert("Something went wrong while saving. Please try again in a moment.");
      }
      return;
    }

    router.push("/home");
    router.refresh();
  };

  return (
    <main className="p-6 md:p-12 max-w-2xl mx-auto">
      <h2 className="text-2xl font-display font-bold italic mb-2">
        What&apos;s on your mind?
      </h2>
      <p className="text-sm text-muted mb-10">
        Write it down. No one will read this but you.
      </p>

      <div className="mb-8">
        <label className="text-xs font-bold uppercase tracking-widest text-muted mb-3 block">
          What are you feeling?
        </label>
        <div className="flex flex-wrap gap-3">
          {FEELING_TYPES.map((t) => {
            const config = FEELING_CONFIG[t];
            const Icon = config.icon;
            const isActive = type === t;
            return (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl border text-sm font-medium transition-all ${
                  isActive
                    ? "bg-plum text-white border-plum"
                    : "bg-surface border-border hover:border-plum"
                }`}
              >
                <Icon size={16} />
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-8">
        <label className="text-xs font-bold uppercase tracking-widest text-muted mb-3 block">
          Who is this about?
        </label>
        <input
          type="text"
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          placeholder="Their name"
          className="w-full px-5 py-4 rounded-2xl border border-border bg-surface focus:outline-none focus:border-plum transition-colors"
        />
      </div>

      <div className="mb-8">
        <label className="text-xs font-bold uppercase tracking-widest text-muted mb-3 block">
          What would you say to them?
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write freely, in any language..."
          rows={6}
          className="w-full px-5 py-4 rounded-2xl border border-border bg-surface focus:outline-none focus:border-plum transition-colors resize-none italic"
        />
      </div>

      <div className="mb-10">
        <label className="text-xs font-bold uppercase tracking-widest text-muted mb-3 block">
          Remind me about this in...
        </label>

                <div className="flex flex-wrap gap-3">
          {FOLLOW_UP_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFollowUp(opt.value)}
              className={`px-5 py-2 rounded-full border text-xs font-bold uppercase tracking-widest transition-all ${
                followUp === opt.value
                  ? "bg-plum text-white border-plum"
                  : "bg-surface border-border hover:border-plum"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {followUp === "custom" && (
          <div className="mt-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2 block">
              Choose date & time
            </label>
            <DateTimePicker value={customDateTime} onChange={setCustomDateTime} />
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!content || !personName || saving}
        className="flex items-center gap-2 bg-plum text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#5a3849] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {saving ? (
          <>
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Saving...
          </>
        ) : (
          <>
            Save to archive
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </main>
  );
}