import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trash2, Eye, X } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { clearHistory, deleteScan, loadHistory } from "@/lib/history";
import type { ScanReport } from "@/lib/scanner";
import { formatBytes } from "@/lib/scanner";
import { ReportView } from "@/components/ReportView";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Scan History | Malware File Scanner Pro" },
      { name: "description", content: "Search, review, and export past malware scan reports stored locally on this device." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [items, setItems] = useState<ScanReport[]>([]);
  const [q, setQ] = useState("");
  const [active, setActive] = useState<ScanReport | null>(null);

  useEffect(() => {
    const update = () => setItems(loadHistory());
    update();
    window.addEventListener("mfsp:history-changed", update);
    return () => window.removeEventListener("mfsp:history-changed", update);
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((r) =>
      r.fileName.toLowerCase().includes(s) ||
      r.md5.includes(s) ||
      r.sha1.includes(s) ||
      r.sha256.includes(s) ||
      r.level.includes(s)
    );
  }, [items, q]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Scan History</h1>
            <p className="text-sm text-muted-foreground mt-1">{items.length} scans stored locally on this device.</p>
          </div>
          {items.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => { if (confirm("Clear all scan history?")) clearHistory(); }}>
              <Trash2 className="size-4 mr-2" /> Clear all
            </Button>
          )}
        </div>

        <div className="relative">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by filename, hash, or risk level..."
            className="pl-9"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            {items.length === 0 ? "No scans yet." : "No scans match your search."}
          </div>
        ) : (
          <div className="rounded-xl bg-card border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-[10px] uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="text-left p-3">File</th>
                  <th className="text-left p-3 hidden md:table-cell">Size</th>
                  <th className="text-left p-3 hidden lg:table-cell">SHA-256</th>
                  <th className="text-left p-3">Risk</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const color = r.level === "safe" ? "var(--neon-green)" : r.level === "suspicious" ? "var(--neon-amber)" : "var(--neon-red)";
                  return (
                    <tr key={r.id} className="border-t border-border hover:bg-secondary/30">
                      <td className="p-3">
                        <div className="font-medium truncate max-w-xs">{r.fileName}</div>
                        <div className="text-[10px] text-muted-foreground">{new Date(r.scannedAt).toLocaleString()}</div>
                      </td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground">{formatBytes(r.fileSize)}</td>
                      <td className="p-3 hidden lg:table-cell font-mono text-[10px] text-muted-foreground truncate max-w-[200px]">{r.sha256}</td>
                      <td className="p-3">
                        <span
                          className="text-[10px] font-bold tracking-widest px-2 py-1 rounded-md"
                          style={{ color, border: `1px solid ${color}`, background: `color-mix(in oklab, ${color} 14%, transparent)` }}
                        >
                          {r.level.toUpperCase()} {r.score}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="icon" onClick={() => setActive(r)}>
                          <Eye className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteScan(r.id)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 overflow-y-auto"
            onClick={() => setActive(null)}
          >
            <div className="min-h-screen p-4 md:p-8" onClick={(e) => e.stopPropagation()}>
              <div className="max-w-6xl mx-auto">
                <div className="flex justify-end mb-4">
                  <Button variant="outline" size="sm" onClick={() => setActive(null)}>
                    <X className="size-4 mr-1" /> Close
                  </Button>
                </div>
                <ReportView report={active} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}