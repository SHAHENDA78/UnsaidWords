import { MoreHorizontal, History, TriangleAlert } from "lucide-react";
import { Feeling } from "@/lib/types";
import { FEELING_CONFIG } from "@/lib/constants";

export function FeelingCard({ feeling, onClick }: { feeling: Feeling; onClick: () => void }) {
  const config = FEELING_CONFIG[feeling.type];
  const isAnnoyance = feeling.type === "annoyance";

  return (
    <div
      onClick={onClick}
      className={`bg-surface p-8 rounded-3xl border border-border shadow-card flex flex-col h-full transition-transform hover:-translate-y-1 ${
        isAnnoyance ? "border-l-4 border-l-annoyance" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-6">
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-${config.colorVar}/10 text-${config.colorVar}`}
        >
          {config.label}
        </span>
        <span className="text-[10px] text-muted font-medium">
          {new Date(feeling.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-4">
        To: {feeling.personName}
      </h3>

      <p className="text-sm text-ink leading-relaxed flex-grow italic line-clamp-4">
        {feeling.content}
      </p>

      <div className="mt-8 pt-6 border-t border-border flex justify-between items-center">
        {feeling.followUpAt ? (
          <span className="text-[10px] text-plum font-bold uppercase tracking-widest flex items-center gap-1">
            <History size={12} /> Follow up scheduled
          </span>
        ) : isAnnoyance ? (
          <span className="text-[10px] text-annoyance font-bold uppercase tracking-widest flex items-center gap-1">
            <TriangleAlert size={12} /> Needs Review
          </span>
        ) : (
          <span className="text-[10px] text-muted font-bold uppercase tracking-widest italic">
            Archived
          </span>
        )}
        <button className="text-muted hover:text-plum transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
}