import { motion } from "framer-motion";
import { Download, FileWarning, Hash, Info, ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ScanReport } from "@/lib/scanner";
import { formatBytes } from "@/lib/scanner";
import { RiskMeter } from "./RiskMeter";
import { downloadReport } from "@/lib/pdf-report";

const SEV_ICON = {
  info: Info,
  warn: FileWarning,
  critical: ShieldAlert,
} as const;

const SEV_COLOR = {
  info: "var(--neon-blue)",
  warn: "var(--neon-amber)",
  critical: "var(--neon-red)",
} as const;

export function ReportView({ report }: { report: ScanReport }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid lg:grid-cols-3 gap-6"
    >
      <div className="lg:col-span-1 flex flex-col gap-6">
        <RiskMeter score={report.score} level={report.level} />
        <Button onClick={() => downloadReport(report)} className="w-full" size="lg">
          <Download className="size-4 mr-2" /> Download Security Report
        </Button>
      </div>

      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="size-4 neon-text-blue" />
            <h3 className="font-semibold tracking-wide uppercase text-xs">File Information</h3>
          </div>
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <Field label="Name" value={report.fileName} />
            <Field label="Size" value={formatBytes(report.fileSize)} />
            <Field label="Type" value={report.fileType} />
            <Field label="Scanned" value={new Date(report.scannedAt).toLocaleString()} />
          </dl>
        </div>

        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Hash className="size-4 neon-text-blue" />
            <h3 className="font-semibold tracking-wide uppercase text-xs">Cryptographic Hashes</h3>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <HashRow label="MD5" value={report.md5} />
            <HashRow label="SHA-1" value={report.sha1} />
            <HashRow label="SHA-256" value={report.sha256} />
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="size-4 neon-text-blue" />
            <h3 className="font-semibold tracking-wide uppercase text-xs">Threat Findings ({report.findings.length})</h3>
          </div>
          <div className="space-y-3">
            {report.findings.map((f, i) => {
              const Icon = SEV_ICON[f.severity];
              const color = SEV_COLOR[f.severity];
              return (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-3 p-3 rounded-lg bg-background border"
                  style={{ borderColor: `color-mix(in oklab, ${color} 30%, transparent)` }}
                >
                  <Icon className="size-5 flex-shrink-0 mt-0.5" style={{ color }} />
                  <div className="min-w-0">
                    <div className="font-medium text-sm" style={{ color }}>{f.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{f.detail}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="font-semibold tracking-wide uppercase text-xs mb-3 neon-text-green">Recommendations</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {report.recommendations.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="neon-text-green">&gt;</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="font-medium break-all">{value}</dd>
    </div>
  );
}
function HashRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground sm:w-16">{label}</span>
      <span className="break-all text-foreground/90">{value}</span>
    </div>
  );
}