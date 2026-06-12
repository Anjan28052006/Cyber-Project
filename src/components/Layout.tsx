import { Link, useRouterState } from "@tanstack/react-router";
import { Shield, ScanLine, History, Lightbulb, Activity } from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Dashboard", icon: Activity },
  { to: "/scan", label: "Scanner", icon: ScanLine },
  { to: "/history", label: "History", icon: History },
  { to: "/tips", label: "Security Tips", icon: Lightbulb },
] as const;

export function Layout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex w-64 flex-col border-r border-sidebar-border bg-sidebar p-5 gap-6 sticky top-0 h-screen">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-lg flex items-center justify-center glow-border-blue bg-card">
            <Shield className="size-5 neon-text-blue" />
          </div>
          <div className="leading-tight">
            <div className="font-bold text-sm tracking-wide">MFSP</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Scanner Pro</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                  active
                    ? "bg-card neon-text-blue glow-border-blue"
                    : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                }`}
              >
                <Icon className="size-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto text-[10px] text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-[var(--neon-green)] animate-[pulse-glow_1.6s_ease-in-out_infinite]" />
            Engine v2.4 - Heuristics online
          </div>
          <div>(c) 2026 Malware Scanner Pro</div>
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-sidebar">
          <div className="flex items-center gap-2">
            <Shield className="size-5 neon-text-blue" />
            <span className="font-bold text-sm">MFSP Scanner</span>
          </div>
          <nav className="flex gap-1">
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = pathname === n.to;
              return (
                <Link key={n.to} to={n.to} className={`p-2 rounded-md ${active ? "neon-text-blue" : "text-muted-foreground"}`}>
                  <Icon className="size-4" />
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="p-4 md:p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}