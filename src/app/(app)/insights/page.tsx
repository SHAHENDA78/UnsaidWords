"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts";
import { createClient } from "@/lib/supabase";
import { Feeling, FeelingType } from "@/lib/types";
import { FEELING_CONFIG } from "@/lib/constants";

const COLORS: Record<FeelingType, string> = {
  gratitude: "#C9A24B",
  apology: "#B26A4B",
  admiration: "#A85B72",
  annoyance: "#5E6B77",
};

export default function InsightsPage() {
  const [feelings, setFeelings] = useState<Feeling[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("feelings")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching feelings:", error);
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

    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="p-6 md:p-8 pb-24">
        <p className="text-sm text-muted">Loading your insights...</p>
      </main>
    );
  }

  if (feelings.length === 0) {
    return (
      <main className="p-6 md:p-8 pb-24">
        <header className="mb-12">
          <h2 className="text-2xl font-display font-bold italic mb-2">
            Emotional Insights
          </h2>
          <p className="text-sm text-muted">
            A deeper look into the words you&apos;ve chosen to archive.
          </p>
        </header>
        <div className="text-center py-20 text-muted">
          <p className="text-sm">
            Archive a few feelings first, and your patterns will appear here.
          </p>
        </div>
      </main>
    );
  }

  const typeCounts: Record<string, number> = {};
  feelings.forEach((f) => {
    typeCounts[f.type] = (typeCounts[f.type] || 0) + 1;
  });
  const pieData = Object.entries(typeCounts).map(([type, count]) => ({
    name: FEELING_CONFIG[type as FeelingType].label,
    value: count,
    type,
  }));

  const personCounts: Record<string, number> = {};
  feelings.forEach((f) => {
    personCounts[f.personName] = (personCounts[f.personName] || 0) + 1;
  });
  const barData = Object.entries(personCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const dateCounts: Record<string, number> = {};
  feelings.forEach((f) => {
    const date = new Date(f.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    dateCounts[date] = (dateCounts[date] || 0) + 1;
  });
  const lineData = Object.entries(dateCounts).map(([date, count]) => ({
    date,
    count,
  }));

  const topPerson = Object.entries(personCounts).sort((a, b) => b[1] - a[1])[0];
  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
  const topTypePercent = topType ? Math.round((topType[1] / feelings.length) * 100) : 0;

  const monthCounts: Record<string, number> = {};
  feelings.forEach((f) => {
    const month = new Date(f.createdAt).toLocaleDateString("en-US", { month: "long" });
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  });
  const peakMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0];
    const followUpAnswered = feelings.filter((f) => f.followUpStatus);
  const stillFeelingCount = followUpAnswered.filter((f) => f.followUpStatus === "still_feeling").length;
  const changedCount = followUpAnswered.filter((f) => f.followUpStatus === "changed").length;
  const saidItCount = followUpAnswered.filter((f) => f.followUpStatus === "said_it").length;

  return (
    <main className="p-6 md:p-10 pb-24">
      <header className="mb-12">
        <h2 className="text-3xl font-display font-bold italic mb-2">
          Emotional Insights
        </h2>
        <p className="text-sm text-muted">
          A deeper look into the words you&apos;ve chosen to archive.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {topPerson && (
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-soft">
            <p className="text-[10px] text-muted uppercase tracking-[0.2em] mb-2 font-bold">
              Top Person
            </p>
            <h3 className="text-xl font-bold text-plum">{topPerson[0]}</h3>
            <p className="text-xs mt-2 text-muted">
              You have <span className="font-bold">{topPerson[1]}</span> entries for them.
            </p>
          </div>
        )}
        {topType && (
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-soft">
            <p className="text-[10px] text-muted uppercase tracking-[0.2em] mb-2 font-bold">
              Dominant Feeling
            </p>
            <h3 className="text-xl font-bold" style={{ color: COLORS[topType[0] as FeelingType] }}>
              {FEELING_CONFIG[topType[0] as FeelingType].label}
            </h3>
            <p className="text-xs mt-2 text-muted">
              Represents <span className="font-bold">{topTypePercent}%</span> of your archive.
            </p>
          </div>
        )}
        {peakMonth && (
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-soft">
            <p className="text-[10px] text-muted uppercase tracking-[0.2em] mb-2 font-bold">
              Peak Month
            </p>
            <h3 className="text-xl font-bold text-admiration">{peakMonth[0]}</h3>
            <p className="text-xs mt-2 text-muted">
              You recorded <span className="font-bold">{peakMonth[1]}</span> entries.
            </p>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-soft">
          <h4 className="text-xs font-bold uppercase tracking-widest mb-8 text-muted">
            Distribution of Feelings
          </h4>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={2}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.type} fill={COLORS[entry.type as FeelingType]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-border shadow-soft">
          <h4 className="text-xs font-bold uppercase tracking-widest mb-8 text-muted">
            Frequent People
          </h4>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DED4C4" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8A8377" }} />
                <YAxis tick={{ fontSize: 11, fill: "#8A8377" }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#6B4356" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface p-8 rounded-3xl border border-border shadow-soft xl:col-span-2">
          <h4 className="text-xs font-bold uppercase tracking-widest mb-8 text-muted">
            Timeline of Archive
          </h4>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DED4C4" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#8A8377" }} />
                <YAxis tick={{ fontSize: 11, fill: "#8A8377" }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#6B4356" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
      {followUpAnswered.length > 0 && (
        <section className="mt-8 bg-surface p-6 rounded-2xl border border-border shadow-soft">
          <h4 className="text-xs font-bold uppercase tracking-widest mb-6 text-muted">
            Follow-up Reflections
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-page/50 p-5 rounded-xl text-center">
              <p className="text-2xl font-bold text-plum">{stillFeelingCount}</p>
              <p className="text-[10px] text-muted uppercase tracking-widest mt-1">
                Still feeling it
              </p>
            </div>
            <div className="bg-page/50 p-5 rounded-xl text-center">
              <p className="text-2xl font-bold text-admiration">{changedCount}</p>
              <p className="text-[10px] text-muted uppercase tracking-widest mt-1">
                Feelings changed
              </p>
            </div>
            <div className="bg-page/50 p-5 rounded-xl text-center">
              <p className="text-2xl font-bold text-gratitude">{saidItCount}</p>
              <p className="text-[10px] text-muted uppercase tracking-widest mt-1">
                Said out loud
              </p>
            </div>
          </div>
        </section>
      )}
      <section className="mt-8 bg-plum/5 p-6 rounded-2xl border border-plum/10">
        <h4 className="text-lg font-bold mb-6 text-plum flex items-center gap-3 italic font-display">
          <Sparkles size={16} />
          Observations from your archive
        </h4>
        <p className="text-sm text-muted leading-relaxed">
          Keep archiving your feelings, and deeper patterns will surface here over time —
          like which days you reflect most, and who tends to stay on your mind.
        </p>
      </section>
    </main>
  );
}