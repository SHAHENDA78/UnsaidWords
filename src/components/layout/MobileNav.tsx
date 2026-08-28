"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PieChart, Settings, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

export function MobileNav() {
  const pathname = usePathname();
  const [hideInsights, setHideInsights] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setHideInsights(user.user_metadata?.hide_insights ?? false);
    });
  }, []);

  const items = [
    { href: "/home", label: "Home", icon: Home },
    ...(hideInsights ? [] : [{ href: "/insights", label: "Insights", icon: PieChart }]),
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-40 lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-colors ${
                isActive ? "text-plum" : "text-muted"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
        <Link
          href="/add"
          className="flex flex-col items-center gap-1 px-4 py-1.5 text-plum"
        >
          <div className="w-9 h-9 rounded-full bg-plum text-white flex items-center justify-center -mt-1">
            <Plus size={18} />
          </div>
        </Link>
      </div>
    </nav>
  );
}