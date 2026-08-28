"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, PieChart, Settings, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase";

const allNavItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/insights", label: "Insights", icon: PieChart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [hideInsights, setHideInsights] = useState(false);

    useEffect(() => {
    const supabase = createClient();

    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email || "");
        setHideInsights(user.user_metadata?.hide_insights ?? false);
      }
    }

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserName(session.user.user_metadata?.full_name || session.user.email || "");
        setHideInsights(session.user.user_metadata?.hide_insights ?? false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const navItems = allNavItems.filter(
    (item) => !(hideInsights && item.href === "/insights")
  );

    async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const initial = userName.charAt(0).toUpperCase() || "?";

  return (
    <aside className="fixed left-0 top-0 h-full w-52 bg-surface border-r border-border z-50 hidden lg:block">
      <div className="p-6">
        <h1 className="text-lg font-display font-bold text-plum mb-10 italic">
          UnsaidWords.
        </h1>

        <nav className="space-y-5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 transition-colors ${
                  isActive ? "text-plum font-bold" : "text-muted hover:text-plum"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs uppercase tracking-widest">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-elevated border border-border flex items-center justify-center text-plum font-bold text-xs shrink-0">
              {initial}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold truncate">{userName || "..."}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="w-7 h-7 rounded-full flex items-center justify-center text-muted hover:text-plum hover:bg-page transition-all shrink-0"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}