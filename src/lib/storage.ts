import type { Store } from "./types";
export const STORAGE_KEY = "perk-demo-v1";
export const emptyStore = (): Store => ({
  version: 1,
  cards: [],
  states: {},
  usages: [],
  events: [],
  preferences: {
    calendarReminders: false,
    leadDays: 3,
    timezone: "America/Denver",
  },
});
export interface PortfolioRepository {
  load(): Store;
  save(state: Store): void;
  clear(): void;
}
export const browserRepository: PortfolioRepository = {
  load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const s = JSON.parse(raw) as Store;
    if (
      s.version !== 1 ||
      !Array.isArray(s.cards) ||
      !Array.isArray(s.usages) ||
      !Array.isArray(s.events) ||
      !s.states ||
      !s.preferences
    )
      throw new Error(
        "Saved demo data could not be read. Export or reset it in Settings.",
      );
    return s;
  },
  save(s) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  },
  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
};
export function sampleStore(asOf: string): Store {
  const s = emptyStore();
  s.cards = ["amex-platinum", "chase-reserve", "capital-venture-x"].map(
    (productId, i) => ({
      id: `sample-${i}`,
      productId,
      openedOn: `${+asOf.slice(0, 4) - 1}-04-15`,
      annualFeeCents: null,
      archived: false,
    }),
  );
  return s;
}
export function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
