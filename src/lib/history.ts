import type { ReadingResponse } from "@/lib/api";

const KEY = "reading_history_v1";
const LIMIT = 10;

export type HistoryItem = {
  id: string;
  createdAt: number;
  data: ReadingResponse;
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
}

export function addToHistory(data: ReadingResponse) {
  const list = load();
  const item: HistoryItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    data,
  };
  const next = [item, ...list].slice(0, LIMIT);
  save(next);
}

export function getHistory(): HistoryItem[] {
  return load();
}

export function removeHistory(id: string) {
  const list = load().filter((x) => x.id !== id);
  save(list);
}

export function clearHistory() {
  save([]);
}


