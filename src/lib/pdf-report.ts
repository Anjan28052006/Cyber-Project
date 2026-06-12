import { jsPDF } from "jspdf";
import type { ScanReport } from "./scanner";
import { formatBytes } from "./scanner";

const LEVEL_COLOR: Record<ScanReport["level"], [number, number, number]> = {
  safe: [34, 197, 94],
  suspicious: [234, 179, 8],
  dangerous: [239, 68, 68],
};

export function downloadReport(report: ScanReport) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  let y = 56;

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, 80, "F");
  doc.setTextColor(56, 189, 248);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("MALWARE FILE SCANNER PRO", 40, 38);
  doc.setFontSize(10);
  doc.setTextColor(226, 232, 240);
  doc.text("Security Analysis Report", 40, 58);

  y = 110;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("File Information", 40, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const rows: [string, string][] = [
    ["File name", report.fileName],
    ["File size", formatBytes(report.fileSize)],
    ["File type", report.fileType],
    ["Scanned at", new Date(report.scannedAt).toLocaleString()],
    ["MD5", report.md5],
    ["SHA-1", report.sha1],
    ["SHA-256", report.sha256],
  ];
  for (const [k, v] of rows) {
    doc.setFont("helvetica", "bold");
    doc.text(k, 40, y);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(v, pageW - 160);
    doc.text(lines, 140, y);
    y += 14 * Math.max(1, lines.length);
  }

  y += 12;
  const [r, g, b] = LEVEL_COLOR[report.level];
  doc.setFillColor(r, g, b);
  doc.roundedRect(40, y, 160, 36, 6, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`${report.level.toUpperCase()}  -  ${report.score}/100`, 50, y + 23);
  y += 60;

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.text("Threat Findings", 40, y);
  y += 18;
  doc.setFontSize(10);
  for (const f of report.findings) {
    if (y > 760) { doc.addPage(); y = 60; }
    doc.setFont("helvetica", "bold");
    doc.text(`[${f.severity.toUpperCase()}] ${f.title}`, 40, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(f.detail, pageW - 80);
    doc.text(lines, 40, y);
    y += 14 * lines.length + 6;
  }

  if (y > 720) { doc.addPage(); y = 60; }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Recommendations", 40, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  for (const rec of report.recommendations) {
    if (y > 780) { doc.addPage(); y = 60; }
    const lines = doc.splitTextToSize(`- ${rec}`, pageW - 80);
    doc.text(lines, 40, y);
    y += 14 * lines.length;
  }

  doc.save(`scan-report-${report.fileName}.pdf`);
}