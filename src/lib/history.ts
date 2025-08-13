import type { ReadingResponse } from "@/lib/api";

const KEY = "reading_history_v1";
const LIMIT = 10;

export type HistoryItem = {
  id: string; // local history id
  createdAt: number;
  data: ReadingResponse;
  readingId?: string | null; // backend reading id if present
};

function load(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

function save(list: HistoryItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, LIMIT)));
  try {
    window.dispatchEvent(new CustomEvent("reading-history-updated"));
  } catch {}
}

export function addToHistory(data: ReadingResponse): string {
  const list = load();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const item: HistoryItem = {
    id,
    createdAt: Date.now(),
    data,
    readingId: data.id ?? null,
  };
  const next = [item, ...list].slice(0, LIMIT);
  save(next);
  return id;
}

export function getHistory(): HistoryItem[] {
  return load();
}

export function getHistoryById(id: string): HistoryItem | undefined {
  return load().find((x)=> x.id === id);
}

export function removeHistory(id: string) {
  const list = load().filter((x) => x.id !== id);
  save(list);
}

export function clearHistory() {
  save([]);
}


