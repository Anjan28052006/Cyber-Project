export interface ThreatFeedItem {
  id: string;
  family: string;
  type: string;
  region: string;
  hoursAgo: number;
  severity: "low" | "medium" | "high" | "critical";
}

export const THREAT_FEED: ThreatFeedItem[] = [
  { id: "t1", family: "Emotet", type: "Banking Trojan", region: "EU", hoursAgo: 2, severity: "high" },
  { id: "t2", family: "AgentTesla", type: "Infostealer", region: "NA", hoursAgo: 4, severity: "high" },
  { id: "t3", family: "LockBit 4.0", type: "Ransomware", region: "Global", hoursAgo: 6, severity: "critical" },
  { id: "t4", family: "Qakbot", type: "Loader", region: "APAC", hoursAgo: 9, severity: "medium" },
  { id: "t5", family: "RedLine", type: "Stealer", region: "SA", hoursAgo: 12, severity: "high" },
  { id: "t6", family: "Mirai variant", type: "IoT Botnet", region: "Global", hoursAgo: 18, severity: "medium" },
  { id: "t7", family: "RaccoonV2", type: "Stealer", region: "NA", hoursAgo: 20, severity: "medium" },
  { id: "t8", family: "DarkGate", type: "RAT", region: "EU", hoursAgo: 26, severity: "critical" },
];

export const SECURITY_TIPS = [
  "Never execute attachments from unsolicited emails, even if the sender appears familiar.",
  "Verify file extensions - Windows hides them by default. Enable 'Show file extensions' in Explorer.",
  "Keep your OS, browser, and antivirus signatures updated weekly at minimum.",
  "Use a sandbox or virtual machine to inspect untrusted executables.",
  "Hash unknown files (SHA-256) and check against threat intelligence feeds.",
  "Disable Office macros by default and only enable for trusted documents.",
  "Back up critical data offline - ransomware can't encrypt what it can't reach.",
  "Use multi-factor authentication on every account that supports it.",
];

export const DEMO_FILES: { name: string; content: string; type: string }[] = [
  { name: "annual-report.pdf", content: "%PDF-1.4 sample content for demo", type: "application/pdf" },
  { name: "presentation.docx", content: "Quarterly business review content", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  { name: "invoice.pdf.exe", content: "MZ\u0000\u0000fake executable header", type: "" },
  { name: "crack-installer.exe", content: "MZ pirated software loader", type: "application/x-msdownload" },
  { name: "macro-doc.docx", content: "Sub AutoOpen() Shell vba macro powershell payload End Sub", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  { name: "loader.js", content: "eval(atob('ZmFrZSBwYXlsb2Fk'));document.write(unescape('%3Cscript%3E'));setTimeout(Function('x'),10);", type: "application/javascript" },
];