import { motion } from "framer-motion";
import type { RiskLevel } from "@/lib/scanner";

const LEVEL_LABEL: Record<RiskLevel, string> = {
  safe: "SAFE",
  suspicious: "SUSPICIOUS",
  dangerous: "DANGEROUS",
};

export function RiskMeter({ score, level }: { score: number; level: RiskLevel }) {
  const color =
    level === "safe" ? "var(--neon-green)" : level === "suspicious" ? "var(--neon-amber)" : "var(--neon-red)";
  const glow = level === "safe" ? "glow-border-green" : level === "dangerous" ? "glow-border-red" : "glow-border-blue";
  const radius = 70;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  return (
    <div className={`rounded-xl bg-card p-6 ${glow} flex flex-col items-center gap-3`}>
      <div className="relative size-48">
        <svg viewBox="0 0 160 160" className="size-full -rotate-90">
          <circle cx="80" cy="80" r={radius} stroke="var(--secondary)" strokeWidth="12" fill="none" />
          <motion.circle
            cx="80" cy="80" r={radius}
            stroke={color} strokeWidth="12" fill="none" strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl font-bold" style={{ color }}>{score}</div>
          <div className="text-xs text-muted-foreground tracking-widest">RISK SCORE</div>
        </div>
      </div>
      <div
        className="px-4 py-1.5 rounded-full text-xs font-bold tracking-[0.25em]"
        style={{ background: `color-mix(in oklab, ${color} 18%, transparent)`, color, border: `1px solid ${color}` }}
      >
        {LEVEL_LABEL[level]}
      </div>
    </div>
  );
}