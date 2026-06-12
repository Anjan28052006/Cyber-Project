import { md5 } from "./md5";

export type RiskLevel = "safe" | "suspicious" | "dangerous";

export interface Finding {
  id: string;
  severity: "info" | "warn" | "critical";
  title: string;
  detail: string;
  weight: number;
}

export interface ScanReport {
  id: string;
  scannedAt: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  md5: string;
  sha1: string;
  sha256: string;
  findings: Finding[];
  score: number;
  level: RiskLevel;
  recommendations: string[];
}

const DANGEROUS_EXT = ["exe", "bat", "vbs", "scr", "cmd", "ps1", "msi", "jar"];
const SUSPICIOUS_NAMES = [
  "crack", "keygen", "patch", "hacktool", "loader", "bypass",
  "nulled", "warez", "trojan", "rat", "stealer", "exploit",
];
const JS_KEYWORDS = ["eval(", "document.write(", "settimeout(", "atob(", "function(", "unescape(", "fromcharcode"];
const MACRO_KEYWORDS = ["vba", "macro", "autoopen", "shell", "wscript", "powershell"];
const DOUBLE_EXT_PATTERN = /\.(pdf|jpg|jpeg|png|docx|doc|xlsx|txt|mp3|mp4)\.([a-z0-9]{2,4})$/i;

function fmtHex(buffer: ArrayBuffer) {
  const view = new Uint8Array(buffer);
  let out = "";
  for (let i = 0; i < view.length; i++) {
    out += view[i].toString(16).padStart(2, "0");
  }
  return out;
}

export async function hashFile(bytes: Uint8Array) {
  const [sha1, sha256] = await Promise.all([
    crypto.subtle.digest("SHA-1", bytes),
    crypto.subtle.digest("SHA-256", bytes),
  ]);
  return {
    md5: md5(bytes),
    sha1: fmtHex(sha1),
    sha256: fmtHex(sha256),
  };
}

function extOf(name: string) {
  const parts = name.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

export function analyzeMeta(name: string, type: string, textPreview: string): Finding[] {
  const findings: Finding[] = [];
  const lower = name.toLowerCase();
  const ext = extOf(name);

  if (DANGEROUS_EXT.includes(ext)) {
    findings.push({
      id: "ext-dangerous",
      severity: "critical",
      title: `Executable extension detected (.${ext})`,
      detail: `Files with the .${ext} extension can run arbitrary code on your system. Only open from trusted sources.`,
      weight: 45,
    });
  }

  if (DOUBLE_EXT_PATTERN.test(lower)) {
    findings.push({
      id: "ext-double",
      severity: "critical",
      title: "Double extension detected",
      detail: "The file uses a misleading double extension (e.g. invoice.pdf.exe) commonly used to disguise malware.",
      weight: 40,
    });
  }

  if (lower.includes(" .") || lower.includes("\u202e")) {
    findings.push({
      id: "ext-hidden",
      severity: "critical",
      title: "Hidden or RTL-spoofed extension",
      detail: "The filename contains unusual whitespace or right-to-left override characters used to hide the real extension.",
      weight: 35,
    });
  }

  for (const kw of SUSPICIOUS_NAMES) {
    if (lower.includes(kw)) {
      findings.push({
        id: `name-${kw}`,
        severity: "warn",
        title: `Suspicious keyword in filename: "${kw}"`,
        detail: `Filenames containing "${kw}" are frequently associated with pirated software bundled with malware.`,
        weight: 20,
      });
      break;
    }
  }

  if (ext === "js" || ext === "vbs") {
    const text = textPreview.toLowerCase();
    const hits = JS_KEYWORDS.filter((k) => text.includes(k));
    if (hits.length) {
      findings.push({
        id: "script-obfuscation",
        severity: hits.length > 2 ? "critical" : "warn",
        title: "Obfuscated script indicators",
        detail: `Detected suspicious script API usage: ${hits.join(", ")}.`,
        weight: hits.length * 10,
      });
    }
  }

  if (ext === "docx" || ext === "doc" || ext === "xlsx" || ext === "xls") {
    const text = textPreview.toLowerCase();
    const hits = MACRO_KEYWORDS.filter((k) => text.includes(k));
    if (hits.length) {
      findings.push({
        id: "macro-indicator",
        severity: "warn",
        title: "Office macro indicators",
        detail: `Document references macro APIs (${hits.join(", ")}). Macro malware is a common delivery method.`,
        weight: 25,
      });
    }
  }

  if (ext === "apk") {
    findings.push({
      id: "apk-sideload",
      severity: "warn",
      title: "Android package (.apk)",
      detail: "Sideloaded APKs bypass the Play Store review. Verify the publisher and permissions before installing.",
      weight: 15,
    });
  }

  if (ext === "zip") {
    findings.push({
      id: "archive",
      severity: "info",
      title: "Archive container",
      detail: "Archive contents were not inspected. Scan extracted files individually for accurate results.",
      weight: 5,
    });
  }

  if (!findings.length) {
    findings.push({
      id: "clean",
      severity: "info",
      title: "No heuristic indicators triggered",
      detail: "Static heuristics did not match any known malware patterns. Behavior-based scanning is still recommended.",
      weight: 0,
    });
  }

  if (!type && ext) {
    findings.push({
      id: "mime-missing",
      severity: "info",
      title: "Unknown MIME type",
      detail: "The browser could not determine a MIME type for this file.",
      weight: 2,
    });
  }

  return findings;
}

export function scoreFindings(findings: Finding[]): { score: number; level: RiskLevel } {
  const total = findings.reduce((sum, f) => sum + f.weight, 0);
  const score = Math.min(100, total);
  const level: RiskLevel = score >= 71 ? "dangerous" : score >= 31 ? "suspicious" : "safe";
  return { score, level };
}

export function recommendationsFor(level: RiskLevel, findings: Finding[]): string[] {
  const recs: string[] = [];
  if (level === "dangerous") {
    recs.push("Do NOT open or execute this file on a production system.");
    recs.push("Quarantine the file and submit the SHA-256 hash to a multi-engine scanner.");
    recs.push("If downloaded from email, report the message to your security team.");
  } else if (level === "suspicious") {
    recs.push("Open only in an isolated sandbox or virtual machine.");
    recs.push("Verify the source and digital signature before execution.");
    recs.push("Cross-check the SHA-256 hash against trusted threat intelligence feeds.");
  } else {
    recs.push("File passed static heuristics. Keep your antivirus signatures up to date.");
    recs.push("Always verify file sources before opening, even when low risk.");
  }
  if (findings.some((f) => f.id === "archive")) {
    recs.push("Extract the archive in a sandbox and rescan each inner file.");
  }
  return recs;
}

export async function scanFile(file: File): Promise<ScanReport> {
  const buf = new Uint8Array(await file.arrayBuffer());
  const hashes = await hashFile(buf);
  // Preview first 256KB as text for keyword heuristics
  const previewBytes = buf.subarray(0, Math.min(buf.length, 262144));
  const preview = new TextDecoder("utf-8", { fatal: false }).decode(previewBytes);
  const findings = analyzeMeta(file.name, file.type, preview);
  const { score, level } = scoreFindings(findings);
  return {
    id: crypto.randomUUID(),
    scannedAt: new Date().toISOString(),
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || `application/${extOf(file.name) || "octet-stream"}`,
    ...hashes,
    findings,
    score,
    level,
    recommendations: recommendationsFor(level, findings),
  };
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(2)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}