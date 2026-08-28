"use client";

import { useState, useEffect } from "react";
import { Plus, Feather } from "lucide-react";
import Link from "next/link";
import { FeelingCard } from "@/components/feelings/FeelingCard";
import { FeelingModal } from "@/components/feelings/FeelingModal";
import { FEELING_CONFIG } from "@/lib/constants";
import { Feeling, FeelingType } from "@/lib/types";
import { createClient } from "@/lib/supabase";

const FILTERS: { label: string; value: FeelingType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Gratitude", value: "gratitude" },
  { label: "Apology", value: "apology" },
  { label: "Admiration", value: "admiration" },
  { label: "Frustration", value: "annoyance" },
];

export default function HomePage() {
  const [feelings, setFeelings] = useState<Feeling[]>([]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
    const [activeFilter, setActiveFilter] = useState<FeelingType | "all">("all");
  const [selectedFeeling, setSelectedFeeling] = useState<Feeling | null>(null);
  async function fetchData() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    setUserName(user.user_metadata?.full_name || user.email || "");
  }

  const { data, error } = await supabase
    .from("feelings")
    .select("*")
    .order("created_at", { ascending: false });

        if (error) {
        console.error("Error fetching feelings:", error);
        setFetchError(true);
        setLoading(false);
        return;
      }

  const mapped: Feeling[] = data.map((row) => ({
    id: row.id,
    type: row.type,
    personName: row.person_name,
    content: row.content,
    createdAt: row.created_at,
    followUpAt: row.follow_up_at,
    followUpStatus: row.follow_up_status,
  }));

  setFeelings(mapped);
  setLoading(false);
}

useEffect(() => {
  fetchData();
}, []);
  const filteredFeelings =
    activeFilter === "all"
      ? feelings
      : feelings.filter((f) => f.type === activeFilter);

  const gratitudeCount = feelings.filter((f) => f.type === "gratitude").length;
  const annoyanceCount = feelings.filter((f) => f.type === "annoyance").length;

  return (
    <main className="p-6 md:p-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h2 className="text-2xl font-display font-bold italic mb-2">
            Hello, {userName.split(" ")[0] || "there"}
          </h2>
          <p className="text-sm text-muted">
            You have <span className="text-plum font-bold">{feelings.length}</span>{" "}
            unsaid feelings archived.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface p-4 rounded-2xl border border-border shadow-card flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gratitude/10 flex items-center justify-center text-gratitude">
              <FEELING_CONFIG.gratitude.icon size={18} />
            </div>
            <div>
              <p className="text-[10px] text-muted uppercase tracking-widest">Gratitude</p>
              <p className="text-lg font-bold">{gratitudeCount}</p>
            </div>
          </div>
          <div className="bg-surface p-4 rounded-2xl border border-border shadow-card flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-annoyance/10 flex items-center justify-center text-annoyance">
              <FEELING_CONFIG.annoyance.icon size={18} />
            </div>
            <div>
              <p className="text-[10px] text-muted uppercase tracking-widest">Frustration</p>
              <p className="text-lg font-bold">{annoyanceCount}</p>
            </div>
          </div>
        </div>
      </header>

      <section className="mb-10 -mx-6 md:mx-0 relative">
        <div className="overflow-x-auto pb-4 px-6 md:px-0">
          <div className="flex gap-3 min-w-max">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`px-6 py-2 rounded-full border text-xs font-bold uppercase tracking-widest transition-all ${
                activeFilter === filter.value
                  ? "bg-plum text-white border-plum"
                  : "bg-surface border-border hover:border-plum"
              }`}
            >
              {filter.label}
            </button>
          ))}
                  </div>
        </div>
        <div className="md:hidden absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-page to-transparent pointer-events-none" />
      </section>

          
            {fetchError ? (
        <div className="text-center py-20 px-6">
          <p className="text-sm text-muted mb-4">
            Couldn&apos;t load your archive. Please check your connection.
          </p>
          <button
            onClick={() => {
              setFetchError(false);
              setLoading(true);
              fetchData();
            }}
            className="text-sm text-plum font-bold hover:underline"
          >
            Try again
          </button>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-border border-t-plum rounded-full animate-spin mb-4" />
          <p className="text-sm text-muted">Loading your archive...</p>
        </div>
      ) : feelings.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6">
          <div className="w-16 h-16 rounded-full bg-plum/10 flex items-center justify-center text-plum mb-6">
            <Feather size={24} />
          </div>
          <h3 className="text-xl font-display font-bold italic mb-3">
            Your archive is empty
          </h3>
          <p className="text-sm text-muted max-w-xs leading-relaxed mb-8">
            Every unsaid word deserves a home. Start with the first one, whenever you&apos;re ready.
          </p>
          <Link
            href="/add"
            className="bg-plum text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-[#5a3849] transition-all"
          >
            Write your first entry
          </Link>
        </div>
      ) : filteredFeelings.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredFeelings.map((feeling) => (
            <FeelingCard
              key={feeling.id}
              feeling={feeling}
              onClick={() => setSelectedFeeling(feeling)}
            />
          ))}
        </section>
      ) : (
        <div className="text-center py-20 text-muted">
          <p className="text-sm">No feelings archived in this category yet.</p>
        </div>
      )}

      <Link
        href="/add"
        className="hidden lg:flex fixed bottom-10 right-10 w-16 h-16 bg-plum text-white rounded-full items-center justify-center shadow-lg hover:bg-[#5a3849] transition-all transform hover:scale-110 z-50"
      >
        <Plus size={28} />
      </Link>


      {selectedFeeling && (
  <FeelingModal
    feeling={selectedFeeling}
    onClose={() => setSelectedFeeling(null)}
    onUpdated={() => {
      setLoading(true);
      fetchData();
    }}
  />
)}
    </main>
  );
}