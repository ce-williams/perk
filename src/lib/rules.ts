import type {
  Benefit,
  BenefitState,
  Enrollment,
  Evidence,
  Store,
  Usage,
  UserCard,
} from "./types";
export const money = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents % 100 ? 2 : 0,
  }).format(cents / 100);
export function validDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + "T00:00:00Z");
  return (
    Number.isFinite(d.valueOf()) &&
    d.toISOString().slice(0, 10) === s &&
    +s.slice(0, 4) >= 1900
  );
}
function date(s: string) {
  if (!validDate(s)) throw new Error("Enter a valid date.");
  return new Date(s + "T00:00:00Z");
}
const iso = (d: Date) => d.toISOString().slice(0, 10);
const civil = (y: number, m: number, d = 1) => new Date(Date.UTC(y, m, d));
const anniversary = (y: number, m: number, d: number) =>
  civil(y, m, Math.min(d, civil(y, m + 1, 0).getUTCDate()));
export function todayInZone(timezone = "America/Denver") {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export function shiftDays(s: string, n: number) {
  const d = date(s);
  d.setUTCDate(d.getUTCDate() + n);
  return iso(d);
}
export function daysBetween(a: string, b: string) {
  return Math.round((date(b).valueOf() - date(a).valueOf()) / 86400000);
}
export function periodFor(
  benefit: Benefit,
  asOf: string,
  openedOn = "",
): { start: string; end: string; deadline: string } | null {
  const now = date(asOf),
    y = now.getUTCFullYear(),
    m = now.getUTCMonth();
  let start: Date, end: Date;
  switch (benefit.cadence) {
    case "monthly":
      start = civil(y, m);
      end = civil(y, m + 1);
      break;
    case "quarterly":
      start = civil(y, Math.floor(m / 3) * 3);
      end = civil(y, Math.floor(m / 3) * 3 + 3);
      break;
    case "calendar-year":
      start = civil(y, 0);
      end = civil(y + 1, 0);
      break;
    case "anniversary": {
      if (!validDate(openedOn) || openedOn > asOf) return null;
      const o = date(openedOn),
        om = o.getUTCMonth(),
        od = o.getUTCDate();
      start = anniversary(y, om, od);
      if (start > now) start = anniversary(y - 1, om, od);
      end = anniversary(start.getUTCFullYear() + 1, om, od);
      break;
    }
  }
  return {
    start: iso(start),
    end: iso(end),
    deadline: shiftDays(iso(end), -1),
  };
}
export const stateKey = (cardId: string, benefitId: string) =>
  `${cardId}:${benefitId}`;
export function stateFor(
  store: Store,
  cardId: string,
  b: Benefit,
): BenefitState {
  return (
    store.states[stateKey(cardId, b.id)] ?? {
      enrollment: b.requiresEnrollment ? "unknown" : "not-required",
      eligibility: "unknown",
      relevant: true,
      evidence: "unknown",
    }
  );
}
export function activeUsage(records: Usage[]) {
  const reversed = new Set(
    records.filter((r) => r.reverses).map((r) => r.reverses),
  );
  return records.filter((r) => !r.reverses && !reversed.has(r.id));
}
export function balance(
  b: Benefit,
  card: UserCard,
  records: Usage[],
  asOf: string,
) {
  const period = periodFor(b, asOf, card.openedOn);
  if (!period) return null;
  const rows = activeUsage(records).filter(
    (r) =>
      r.cardId === card.id &&
      r.benefitId === b.id &&
      r.date >= period.start &&
      r.date < period.end &&
      r.date <= asOf &&
      (!card.openedOn || r.date >= card.openedOn) &&
      Number.isSafeInteger(r.cents) &&
      r.cents > 0,
  );
  const sum = (e: Evidence) =>
    rows.filter((r) => r.evidence === e).reduce((n, r) => n + r.cents, 0);
  const confirmed = sum("confirmed"),
    selfReported = sum("self-reported"),
    estimated = sum("estimated");
  return {
    ...period,
    confirmed,
    selfReported,
    estimated,
    used: confirmed + selfReported,
    remaining: Math.max(0, b.capCents - confirmed - selfReported),
  };
}
export function transitionEnrollment(
  from: Enrollment,
  to: Enrollment,
  confirmedByUser: boolean,
  required: boolean,
): { enrollment: Enrollment; evidence: Evidence } {
  if (!required) {
    if (to !== "not-required")
      throw new Error("This scenario does not require enrollment.");
    return { enrollment: to, evidence: "unknown" };
  }
  if (to === "not-required")
    throw new Error("Enrollment is required in this scenario.");
  if (to !== from && to !== "unknown" && !confirmedByUser)
    throw new Error("Explicit confirmation is required.");
  return {
    enrollment: to,
    evidence: to === "unknown" ? "unknown" : "self-reported",
  };
}
export function validateUsage(
  cents: number,
  serviceDate: string,
  b: Benefit,
  card: UserCard,
  s: BenefitState,
  records: Usage[],
  asOf: string,
) {
  if (!Number.isSafeInteger(cents) || cents <= 0)
    throw new Error(
      "Enter an amount greater than $0 with at most two decimal places.",
    );
  if (!validDate(serviceDate) || serviceDate > asOf)
    throw new Error("Use a valid date on or before today.");
  if (card.openedOn && serviceDate < card.openedOn)
    throw new Error("Usage cannot predate the card opening date.");
  if (s.eligibility !== "eligible")
    throw new Error("Confirm eligibility before recording usage.");
  if (b.requiresEnrollment && s.enrollment !== "enrolled")
    throw new Error("Confirm enrollment before recording usage.");
  const p = balance(b, card, records, asOf);
  if (!p) throw new Error("Add a card opening date first.");
  if (serviceDate < p.start || serviceDate >= p.end)
    throw new Error("Record usage within the current benefit period.");
  if (cents > p.remaining)
    throw new Error(
      `The amount exceeds the remaining demo allowance of ${money(p.remaining)}.`,
    );
}
export function annualAnalysis(card: UserCard, records: Usage[], asOf: string) {
  const year = asOf.slice(0, 4);
  const rows = activeUsage(records).filter(
    (r) =>
      r.cardId === card.id &&
      r.date.startsWith(year) &&
      r.date <= asOf &&
      (!card.openedOn || r.date >= card.openedOn),
  );
  const sum = (e: Evidence) =>
    rows.filter((r) => r.evidence === e).reduce((n, r) => n + r.cents, 0);
  return {
    confirmed: sum("confirmed"),
    selfReported: sum("self-reported"),
    estimated: sum("estimated"),
    net:
      card.annualFeeCents === null
        ? null
        : sum("confirmed") + sum("self-reported") - card.annualFeeCents,
  };
}
export type Action = {
  card: UserCard;
  benefit: Benefit;
  state: BenefitState;
  balance: ReturnType<typeof balance>;
  kind: "eligibility" | "enrollment" | "use" | "opening-date";
  title: string;
  why: string;
  days: number;
};
export function actionsFor(
  store: Store,
  benefits: Benefit[],
  asOf: string,
): Action[] {
  const actions: Action[] = [];
  for (const card of store.cards.filter((c) => !c.archived))
    for (const benefit of benefits) {
      const state = stateFor(store, card.id, benefit);
      if (!state.relevant || state.eligibility === "ineligible") continue;
      const bal = balance(benefit, card, store.usages, asOf);
      if (bal?.remaining === 0) continue;
      const days = bal ? daysBetween(asOf, bal.deadline) : Infinity;
      const kind = !bal
        ? "opening-date"
        : state.eligibility === "unknown"
          ? "eligibility"
          : benefit.requiresEnrollment && state.enrollment !== "enrolled"
            ? "enrollment"
            : "use";
      const title =
        kind === "opening-date"
          ? "Add your opening date"
          : kind === "eligibility"
            ? "Check your eligibility"
            : kind === "enrollment"
              ? "Review enrollment"
              : "Put this benefit to use";
      const why = bal
        ? `${days === 0 ? "Resets tomorrow" : `${days + 1} days until reset`}; ${money(bal.remaining)} of fictional allowance remains. Ranked by deadline, then remaining allowance.`
        : "An opening date is needed to calculate the anniversary period.";
      actions.push({
        card,
        benefit,
        state,
        balance: bal,
        kind,
        title,
        why,
        days,
      });
    }
  return actions.sort(
    (a, b) =>
      a.days - b.days ||
      (b.balance?.remaining ?? 0) - (a.balance?.remaining ?? 0) ||
      `${a.card.id}:${a.benefit.id}`.localeCompare(
        `${b.card.id}:${b.benefit.id}`,
      ),
  );
}
