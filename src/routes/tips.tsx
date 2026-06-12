import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Lightbulb, ShieldCheck } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SECURITY_TIPS, THREAT_FEED } from "@/lib/threat-feed";

export const Route = createFileRoute("/tips")({
  head: () => ({
    meta: [
      { title: "Security Tips | Malware File Scanner Pro" },
      { name: "description", content: "Practical malware defense tips and a live threat intelligence feed." },
    ],
  }),
  component: TipsPage,
});

function TipsPage() {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Lightbulb className="size-6 neon-text-blue" /> Security Tips
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Defensive habits that block the majority of malware infections.
          </p>
        </div>

        <section className="grid md:grid-cols-2 gap-4">
          {SECURITY_TIPS.map((tip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl bg-card border border-border p-4 flex gap-3"
            >
              <div className="size-8 flex-shrink-0 rounded-lg flex items-center justify-center glow-border-green bg-background">
                <ShieldCheck className="size-4 neon-text-green" />
              </div>
              <p className="text-sm leading-relaxed">{tip}</p>
            </motion.div>
          ))}
        </section>

        <section className="rounded-xl bg-card border border-border p-5">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Active Threat Intelligence</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {THREAT_FEED.map((t) => {
              const color = t.severity === "critical" || t.severity === "high" ? "var(--neon-red)" : t.severity === "medium" ? "var(--neon-amber)" : "var(--neon-green)";
              return (
                <div key={t.id} className="rounded-lg bg-background border border-border p-3" style={{ boxShadow: `0 0 16px -10px ${color}` }}>
                  <div className="text-xs uppercase tracking-widest" style={{ color }}>{t.severity}</div>
                  <div className="font-semibold mt-1">{t.family}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{t.type} - {t.region}</div>
                  <div className="text-[10px] text-muted-foreground">{t.hoursAgo}h ago</div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </Layout>
  );
}