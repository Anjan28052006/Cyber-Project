import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUp, Sparkles, X } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ScanAnimation } from "@/components/ScanAnimation";
import { ReportView } from "@/components/ReportView";
import { scanFile, type ScanReport } from "@/lib/scanner";
import { addScan } from "@/lib/history";
import { DEMO_FILES } from "@/lib/threat-feed";
import { toast } from "sonner";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Scanner | Malware File Scanner Pro" },
      { name: "description", content: "Upload any file to analyze it for malicious indicators with a heuristic engine." },
    ],
  }),
  component: ScanPage,
});

const ACCEPTED = ".exe,.dll,.bat,.js,.vbs,.zip,.pdf,.docx,.apk,.cmd,.ps1,.scr,.doc,.xlsx";
const STAGES = ["Hashing bytes", "Parsing headers", "Scanning heuristics", "Scoring threats", "Finalizing report"];

function ScanPage() {
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(STAGES[0]);
  const [scanning, setScanning] = useState(false);
  const [report, setReport] = useState<ScanReport | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const runScan = useCallback(async (file: File) => {
    setReport(null);
    setScanning(true);
    setProgress(0);
    setStage(STAGES[0]);

    let stageIdx = 0;
    const startedAt = Date.now();
    const minDuration = 1800;
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const pct = Math.min(95, (elapsed / minDuration) * 95);
      setProgress(pct);
      const idx = Math.min(STAGES.length - 1, Math.floor((pct / 95) * STAGES.length));
      if (idx !== stageIdx) {
        stageIdx = idx;
        setStage(STAGES[idx]);
      }
    }, 80);

    try {
      const [result] = await Promise.all([
        scanFile(file),
        new Promise((r) => setTimeout(r, minDuration)),
      ]);
      window.clearInterval(interval);
      setProgress(100);
      setStage("Complete");
      setTimeout(() => {
        setScanning(false);
        setReport(result);
        addScan(result);
        toast.success(`Scan complete: ${result.level.toUpperCase()} (${result.score}/100)`);
      }, 400);
    } catch (err) {
      window.clearInterval(interval);
      setScanning(false);
      toast.error("Scan failed: " + (err as Error).message);
    }
  }, []);

  const onFiles = (files: FileList | null) => {
    if (!files || !files[0]) return;
    runScan(files[0]);
  };

  const runDemo = (idx: number) => {
    const d = DEMO_FILES[idx];
    const file = new File([d.content], d.name, { type: d.type });
    runScan(file);
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">File Scanner</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload an executable, script, document, or archive. Heuristic analysis runs entirely in your browser.
          </p>
        </div>

        {!scanning && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); onFiles(e.dataTransfer.files); }}
            className={`rounded-2xl border-2 border-dashed p-10 md:p-16 text-center transition-all bg-card ${
              dragging ? "glow-border-blue border-[var(--neon-blue)] scale-[1.01]" : "border-border"
            }`}
          >
            <motion.div
              animate={{ y: dragging ? -4 : 0 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="size-16 rounded-2xl flex items-center justify-center glow-border-blue bg-background">
                <FileUp className="size-7 neon-text-blue" />
              </div>
              <div className="text-lg font-semibold">Drop a file to scan</div>
              <div className="text-xs text-muted-foreground max-w-md">
                Supports .exe, .dll, .bat, .cmd, .ps1, .js, .vbs, .scr, .zip, .pdf, .docx, .xlsx, .apk
              </div>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept={ACCEPTED}
                onChange={(e) => onFiles(e.target.files)}
              />
              <Button onClick={() => inputRef.current?.click()} className="mt-2">
                <FileUp className="size-4 mr-2" /> Browse Files
              </Button>
            </motion.div>
          </div>
        )}

        <AnimatePresence>
          {scanning && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ScanAnimation progress={progress} stage={stage} />
            </motion.div>
          )}
        </AnimatePresence>

        {!scanning && !report && (
          <div className="rounded-xl bg-card border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="size-4 neon-text-blue" />
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground">Try a demo file</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {DEMO_FILES.map((d, i) => (
                <button
                  key={d.name}
                  onClick={() => runDemo(i)}
                  className="text-left p-3 rounded-lg bg-background border border-border hover:border-[var(--neon-blue)] hover:neon-text-blue transition-all text-sm font-mono"
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {report && !scanning && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setReport(null)}>
                <X className="size-4 mr-1" /> Clear & scan another
              </Button>
            </div>
            <ReportView report={report} />
          </div>
        )}
      </div>
    </Layout>
  );
}