"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { Feeling } from "@/lib/types";
import { FeelingModal } from "./FeelingModal";

const CHECK_INTERVAL_MS = 15000;

export function FollowUpChecker() {
  const [dueFeeling, setDueFeeling] = useState<Feeling | null>(null);
  const notifiedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    async function checkDueFollowUps() {
      if (dueFeeling) return;

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("feelings")
        .select("*")
        .eq("user_id", user.id)
        .is("follow_up_status", null)
        .not("follow_up_at", "is", null)
        .lte("follow_up_at", new Date().toISOString())
        .order("follow_up_at", { ascending: true })
        .limit(1);

      if (error || !data || data.length === 0) return;

      const row = data[0];
      const mapped: Feeling = {
        id: row.id,
        type: row.type,
        personName: row.person_name,
        content: row.content,
        createdAt: row.created_at,
        followUpAt: row.follow_up_at,
        followUpStatus: row.follow_up_status,
      };

      setDueFeeling(mapped);

      if (
        "Notification" in window &&
        Notification.permission === "granted" &&
        !notifiedIds.current.has(mapped.id)
      ) {
        notifiedIds.current.add(mapped.id);
        new Notification("Time to check in — UnsaidWords", {
          body: `Do you still feel this way toward ${mapped.personName}?`,
          icon: "/icons/icon-192.png",
        });
      }
    }

    checkDueFollowUps();
    const interval = setInterval(checkDueFollowUps, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [dueFeeling]);

  if (!dueFeeling) return null;

  return (
    <FeelingModal
      feeling={dueFeeling}
      onClose={() => setDueFeeling(null)}
      onUpdated={() => setDueFeeling(null)}
    />
  );
}