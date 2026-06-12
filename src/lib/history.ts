import type { ScanReport } from "./scanner";

const KEY = "mfsp.history.v1";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadHistory(): ScanReport[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ScanReport[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(items: ScanReport[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(items.slice(0, 200)));
}

export function addScan(report: ScanReport) {
  const items = loadHistory();
  items.unshift(report);
  saveHistory(items);
  window.dispatchEvent(new Event("mfsp:history-changed"));
}

export function deleteScan(id: string) {
  const items = loadHistory().filter((r) => r.id !== id);
  saveHistory(items);
  window.dispatchEvent(new Event("mfsp:history-changed"));
}

export function clearHistory() {
  saveHistory([]);
  window.dispatchEvent(new Event("mfsp:history-changed"));
}