"use client";

import { useState } from "react";
import { X, Pencil, Trash2, Bell } from "lucide-react";
import { Feeling } from "@/lib/types";
import { FEELING_CONFIG, isFollowUpDue } from "@/lib/constants";
import { createClient } from "@/lib/supabase";

interface FeelingModalProps {
  feeling: Feeling;
  onClose: () => void;
  onUpdated: () => void; 
}

const FOLLOW_UP_ANSWERS = [
  { label: "Still feeling it, just as strongly", value: "still_feeling" },
  { label: "The feeling has changed", value: "changed" },
  { label: "I actually said it out loud", value: "said_it" },
] as const;

export function FeelingModal({ feeling, onClose, onUpdated }: FeelingModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(feeling.content);
  const [editPersonName, setEditPersonName] = useState(feeling.personName);
  const [saving, setSaving] = useState(false);
  const [answering, setAnswering] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const config = FEELING_CONFIG[feeling.type];
  const Icon = config.icon;
  const showFollowUpQuestion = isFollowUpDue(feeling.followUpAt, feeling.followUpStatus);

  async function handleSaveEdit() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("feelings")
      .update({ content: editContent, person_name: editPersonName })
      .eq("id", feeling.id);

    setSaving(false);
    if (error) {
      alert("Error saving: " + error.message);
      return;
    }
    setIsEditing(false);
    onUpdated();
    onClose();
  }

  async function handleDelete() {
  const supabase = createClient();
  const { error } = await supabase.from("feelings").delete().eq("id", feeling.id);

  if (error) {
    alert("Error deleting: " + error.message);
    return;
  }
  onUpdated();
  onClose();
}

  async function handleFollowUpAnswer(status: string) {
    setAnswering(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("feelings")
      .update({
        follow_up_status: status,
        follow_up_completed_at: new Date().toISOString(),
      })
      .eq("id", feeling.id);

    setAnswering(false);
    if (error) {
      alert("Error saving your answer: " + error.message);
      return;
    }
    onUpdated();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-6"
      onClick={onClose}
    >
            <div
        className="custom-scrollbar bg-surface w-full max-w-2xl rounded-[40px] border border-border shadow-soft p-10 md:p-12 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-8 right-8 w-10 h-10 rounded-full bg-page border border-border flex items-center justify-center text-muted hover:text-plum transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center bg-${config.colorVar}/20 text-${config.colorVar}`}
          >
            <Icon size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted block">
              {config.label}
            </span>
            <h3 className="text-lg font-bold">To: {feeling.personName}</h3>
          </div>
        </div>

        {showFollowUpQuestion && !isEditing ? (
          <div className="mb-8">
            <div className="bg-plum/5 border border-plum/10 rounded-3xl p-8 mb-6">
              <div className="flex items-center gap-2 text-plum mb-4">
                <Bell size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Time to check in
                </span>
              </div>
              <p className="text-xl font-display italic mb-6">
                Do you still feel this way toward {feeling.personName}?
              </p>
              <p className="text-sm text-muted leading-relaxed italic mb-6">
                &ldquo;{feeling.content}&rdquo;
              </p>
              <div className="flex flex-col gap-3">
                {FOLLOW_UP_ANSWERS.map((answer) => (
                  <button
                    key={answer.value}
                    disabled={answering}
                    onClick={() => handleFollowUpAnswer(answer.value)}
                    className="w-full text-left px-6 py-4 rounded-2xl border border-border bg-surface hover:border-plum hover:bg-plum/5 transition-all text-sm font-medium disabled:opacity-50"
                  >
                    {answer.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : isEditing ? (
          <div className="space-y-6 mb-8">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2 block">
                To whom?
              </label>
              <input
                type="text"
                value={editPersonName}
                onChange={(e) => setEditPersonName(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl border border-border bg-page/30 focus:outline-none focus:border-plum transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2 block">
                What are you feeling?
              </label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={6}
                className="w-full px-5 py-3 rounded-2xl border border-border bg-page/30 focus:outline-none focus:border-plum transition-all resize-none italic"
              />
            </div>
          </div>
        ) : (
          <p className="text-lg text-ink leading-relaxed italic mb-8">
            {feeling.content}
          </p>
        )}

        {!isEditing && !showFollowUpQuestion && (
          <div className="mb-8">
            <p className="text-[10px] text-muted uppercase tracking-widest mb-3">
              Archived on{" "}
              {new Date(feeling.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>

            {feeling.followUpAt && (
              feeling.followUpStatus ? (
                <div className="inline-flex items-center gap-2 bg-plum/10 text-plum px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest">
                  {feeling.followUpStatus === "still_feeling" && "Still feeling it, just as strongly"}
                  {feeling.followUpStatus === "changed" && "The feeling has changed"}
                  {feeling.followUpStatus === "said_it" && "You said it out loud"}
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-page text-muted border border-border px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest">
                  Follow-up scheduled for{" "}
                  {new Date(feeling.followUpAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              )
            )}
          </div>
        )}

        {!showFollowUpQuestion && (
          <div className="flex gap-3 pt-6 border-t border-border">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex-grow py-3 bg-plum text-white rounded-2xl font-bold text-sm hover:bg-[#5a3849] transition-all disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 border border-border rounded-2xl font-bold text-sm hover:bg-page transition-all"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 border border-border rounded-2xl font-bold text-sm hover:bg-page transition-all"
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
  onClick={() => setShowDeleteConfirm(true)}
  className="flex items-center gap-2 px-6 py-3 border border-red-200 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-50 transition-all"
>
  <Trash2 size={14} /> Delete
</button>
              </>
            )}
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-[60] flex items-center justify-center p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-surface w-full max-w-sm rounded-[32px] border border-border shadow-soft p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-6">
              <Trash2 size={22} />
            </div>
            <h4 className="text-lg font-display font-bold italic mb-3">
              Delete this entry?
            </h4>
            <p className="text-sm text-muted leading-relaxed mb-8">
              This will permanently remove it from your archive. This action
              can&apos;t be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-grow py-3 border border-border rounded-2xl font-bold text-sm hover:bg-page transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-grow py-3 bg-red-500 text-white rounded-2xl font-bold text-sm hover:bg-red-600 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}