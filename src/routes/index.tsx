import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, FileCheck2, FileWarning, Radar, ScanLine, ShieldAlert, ShieldCheck } from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import { Layout } from "@/components/Layout";
import { loadHistory } from "@/lib/history";
import { THREAT_FEED } from "@/lib/threat-feed";
import type { ScanReport } from "@/lib/scanner";
import { Button } from "@/components/ui/button";

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard | Malware File Scanner Pro" },
      { name: "description", content: "Real-time threat intelligence dashboard and malware scan statistics." },
      { property: "og:title", content: "Malware File Scanner Pro" },
      { property: "og:description", content: "Static malware analysis with risk scoring, PDF reports, and threat intelligence." },
    ],
  }),
  component: Index,
});

function useHistory() {
  const [items, setItems] = useState<ScanReport[]>([]);
  useEffect(() => {
    const update = () => setItems(loadHistory());
    update();
    window.addEventListener("mfsp:history-changed", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("mfsp:history-changed", update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return items;
}

function Index() {
  const history = useHistory();

  const stats = useMemo(() => {
    const total = history.length;
    const dangerous = history.filter((h) => h.level === "dangerous").length;
    const suspicious = history.filter((h) => h.level === "suspicious").length;
    const safe = history.filter((h) => h.level === "safe").length;
    return { total, dangerous, suspicious, safe };
  }, [history]);

  const weekly = useMemo(() => {
    const days: { label: string; count: number; risk: number }[] = [];
    const now = Date.now();
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now - i * 86400000);
      const label = day.toLocaleDateString(undefined, { weekday: "short" });
      const dayItems = history.filter((h) => {
        const d = new Date(h.scannedAt);
        return d.toDateString() === day.toDateString();
      });
      days.push({
        label,
        count: dayItems.length,
        risk: dayItems.length ? Math.round(dayItems.reduce((s, x) => s + x.score, 0) / dayItems.length) : 0,
      });
    }
    return days;
  }, [history]);

  return (
    <Layout>
      <div className="space-y-8">
        <motion.section
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 md:p-8 glow-border-blue bg-card relative overflow-hidden"
        >
          <div className="absolute inset-0 scan-grid opacity-30 pointer-events-none" />
          <div className="relative flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] neon-text-blue">
                <Radar className="size-4 animate-[pulse-glow_1.6s_ease-in-out_infinite]" />
                Threat Intelligence
              </div>
              <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
                Malware File <span className="neon-text-blue">Scanner Pro</span>
              </h1>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Drop a file. Get an instant heuristic risk score, cryptographic fingerprint, and a downloadable
                PDF report. All analysis runs locally in your browser - no uploads.
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild size="lg">
                <Link to="/scan"><ScanLine className="size-4 mr-2" /> Start Scan</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/history">View History</Link>
              </Button>
            </div>
          </div>
        </motion.section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Activity} label="Total Scanned" value={stats.total} color="var(--neon-blue)" />
          <StatCard icon={ShieldCheck} label="Safe" value={stats.safe} color="var(--neon-green)" />
          <StatCard icon={FileWarning} label="Suspicious" value={stats.suspicious} color="var(--neon-amber)" />
          <StatCard icon={ShieldAlert} label="Dangerous" value={stats.dangerous} color="var(--neon-red)" />
        </section>

        <section className="grid lg:grid-cols-3 gap-6">
          <div className="rounded-xl bg-card border border-border p-5">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Threat Distribution</h3>
            <div className="h-56 flex items-center justify-center">
              {stats.total === 0 ? (
                <EmptyChart />
              ) : (
                <Doughnut
                  data={{
                    labels: ["Safe", "Suspicious", "Dangerous"],
                    datasets: [{
                      data: [stats.safe, stats.suspicious, stats.dangerous],
                      backgroundColor: ["#4ade80", "#facc15", "#ef4444"],
                      borderColor: "transparent",
                      borderWidth: 0,
                    }],
                  }}
                  options={{
                    plugins: { legend: { position: "bottom", labels: { color: "#cbd5e1", boxWidth: 10 } } },
                    cutout: "65%",
                    maintainAspectRatio: false,
                  }}
                />
              )}
            </div>
          </div>

          <div className="rounded-xl bg-card border border-border p-5">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Weekly Scans</h3>
            <div className="h-56">
              <Bar
                data={{
                  labels: weekly.map((d) => d.label),
                  datasets: [{
                    label: "Scans",
                    data: weekly.map((d) => d.count),
                    backgroundColor: "rgba(56,189,248,0.7)",
                    borderRadius: 6,
                  }],
                }}
                options={{
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { ticks: { color: "#94a3b8" }, grid: { display: false } },
                    y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(148,163,184,0.1)" }, beginAtZero: true },
                  },
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>

          <div className="rounded-xl bg-card border border-border p-5">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Risk Trend</h3>
            <div className="h-56">
              <Line
                data={{
                  labels: weekly.map((d) => d.label),
                  datasets: [{
                    label: "Avg risk",
                    data: weekly.map((d) => d.risk),
                    borderColor: "#ef4444",
                    backgroundColor: "rgba(239,68,68,0.18)",
                    tension: 0.35,
                    fill: true,
                    pointBackgroundColor: "#ef4444",
                  }],
                }}
                options={{
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { ticks: { color: "#94a3b8" }, grid: { display: false } },
                    y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(148,163,184,0.1)" }, min: 0, max: 100 },
                  },
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-xl bg-card border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground">Recent Scans</h3>
              <Link to="/history" className="text-xs neon-text-blue hover:underline">View all</Link>
            </div>
            {history.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center">
                No scans yet. <Link to="/scan" className="neon-text-blue underline">Run your first scan</Link>.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {history.slice(0, 5).map((r) => (
                  <li key={r.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{r.fileName}</div>
                      <div className="text-[10px] text-muted-foreground">{new Date(r.scannedAt).toLocaleString()}</div>
                    </div>
                    <RiskBadge level={r.level} score={r.score} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl bg-card border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="size-4 neon-text-red" />
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground">Recent Threat Feed</h3>
            </div>
            <ul className="space-y-2">
              {THREAT_FEED.slice(0, 6).map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 p-2 rounded-md hover:bg-secondary/50">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{t.family}</div>
                    <div className="text-[10px] text-muted-foreground">{t.type} - {t.region} - {t.hoursAgo}h ago</div>
                  </div>
                  <SeverityPill severity={t.severity} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </Layout>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Activity; label: string; value: number; color: string }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-xl bg-card border border-border p-4 relative overflow-hidden"
    >
      <div className="absolute -right-6 -top-6 size-24 rounded-full opacity-10" style={{ background: color }} />
      <Icon className="size-5 mb-2" style={{ color }} />
      <div className="text-3xl font-bold" style={{ color }}>{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    </motion.div>
  );
}

function RiskBadge({ level, score }: { level: ScanReport["level"]; score: number }) {
  const color = level === "safe" ? "var(--neon-green)" : level === "suspicious" ? "var(--neon-amber)" : "var(--neon-red)";
  return (
    <span
      className="text-[10px] font-bold tracking-widest px-2 py-1 rounded-md whitespace-nowrap"
      style={{ color, background: `color-mix(in oklab, ${color} 14%, transparent)`, border: `1px solid ${color}` }}
    >
      {level.toUpperCase()} {score}
    </span>
  );
}

function SeverityPill({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    low: "var(--neon-green)", medium: "var(--neon-amber)", high: "var(--neon-red)", critical: "var(--neon-red)",
  };
  const color = map[severity] || "var(--neon-blue)";
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color, border: `1px solid ${color}` }}>
      {severity.toUpperCase()}
    </span>
  );
}

function EmptyChart() {
  return (
    <div className="text-center text-xs text-muted-foreground">
      <FileCheck2 className="size-8 mx-auto mb-2 opacity-50" />
      Scan a file to populate charts
    </div>
  );
}
