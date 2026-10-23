/** Session-only recents for the History tab. In-memory by design (no raw
 * number persistence); cleared when the app leaves the foreground. */

export interface RecentEntry {
  id: number;
  number: string;
  at: number;
}

let entries: RecentEntry[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function publish() {
  for (const listener of listeners) listener();
}

export function addRecent(number: string): void {
  entries = [{ id: nextId++, number, at: Date.now() }, ...entries.filter(entry => entry.number !== number)].slice(0, 20);
  publish();
}

export function getRecents(): RecentEntry[] {
  return entries;
}

export function clearRecents(): void {
  entries = [];
  publish();
}

export function subscribeRecents(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
