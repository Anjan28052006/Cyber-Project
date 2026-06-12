import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export function ScanAnimation({ progress, stage }: { progress: number; stage: string }) {
  return (
    <div className="rounded-xl p-6 glow-border-blue bg-card relative overflow-hidden">
      <div className="relative h-48 rounded-lg overflow-hidden scan-grid bg-background">
        <motion.div
          className="absolute inset-x-0 h-1"
          style={{ background: "linear-gradient(90deg, transparent, var(--neon-blue), transparent)", boxShadow: "0 0 24px var(--neon-blue)" }}
          animate={{ y: ["0%", "19000%", "0%"] }}
          transition={{ duration: 2.2, ease: "linear", repeat: Infinity }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="flex flex-col items-center gap-2"
          >
            <ShieldCheck className="size-12 neon-text-blue" />
            <div className="text-xs uppercase tracking-[0.3em] neon-text-blue">{stage}</div>
          </motion.div>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Analyzing</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full"
            style={{ background: "linear-gradient(90deg, var(--neon-blue), var(--neon-green))" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
}