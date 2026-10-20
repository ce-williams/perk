import { test } from "node:test";
import assert from "node:assert/strict";
import { benefits } from "../src/lib/catalog";
import {
  actionsFor,
  activeUsage,
  annualAnalysis,
  balance,
  daysBetween,
  periodFor,
  stateFor,
  transitionEnrollment,
  validateUsage,
  validDate,
} from "../src/lib/rules";
import { emptyStore } from "../src/lib/storage";
import { calendarFile } from "../src/lib/calendar";
import type { Benefit, Usage, UserCard } from "../src/lib/types";
const card: UserCard = {
  id: "c1",
  productId: "chase-reserve",
  openedOn: "2024-02-29",
  annualFeeCents: null,
  archived: false,
};
const monthly = benefits[0],
  quarterly = benefits[2],
  annual = benefits[1],
  anniv = benefits[3];
const usage = (over: Partial<Usage> = {}): Usage => ({
  id: "u1",
  cardId: "c1",
  benefitId: "dining",
  revisionId: monthly.revisionId,
  cents: 1000,
  date: "2026-10-10",
  evidence: "self-reported",
  recordedAt: "2026-10-10T12:00:00Z",
  ...over,
});
const state = {
  enrollment: "enrolled" as const,
  eligibility: "eligible" as const,
  relevant: true,
  evidence: "self-reported" as const,
};
test("monthly resets, year rollover, half-open boundary", () => {
  assert.deepEqual(periodFor(monthly, "2026-12-31"), {
    start: "2026-12-01",
    end: "2027-01-01",
    deadline: "2026-12-31",
  });
  assert.equal(periodFor(monthly, "2027-01-01")?.start, "2027-01-01");
});
test("quarter boundaries including Q4", () => {
  assert.equal(periodFor(quarterly, "2026-09-30")?.end, "2026-10-01");
  assert.equal(periodFor(quarterly, "2026-10-01")?.start, "2026-10-01");
  assert.equal(periodFor(quarterly, "2026-12-31")?.end, "2027-01-01");
});
test("calendar year independent of opening date", () =>
  assert.deepEqual(periodFor(annual, "2026-02-01", card.openedOn), {
    start: "2026-01-01",
    end: "2027-01-01",
    deadline: "2026-12-31",
  }));
test("leap anniversary clamps independently each year", () => {
  assert.deepEqual(periodFor(anniv, "2027-02-27", card.openedOn), {
    start: "2026-02-28",
    end: "2027-02-28",
    deadline: "2027-02-27",
  });
  assert.equal(
    periodFor(anniv, "2027-02-28", card.openedOn)?.end,
    "2028-02-29",
  );
});
test("missing or future anniversary is unknown", () => {
  assert.equal(periodFor(anniv, "2026-10-19"), null);
  assert.equal(periodFor(anniv, "2026-10-19", "2027-01-01"), null);
});
test("invalid civil dates fail; leap date valid", () => {
  assert.equal(validDate("2026-02-29"), false);
  assert.equal(validDate("2024-02-29"), true);
  assert.equal(validDate("bad"), false);
  assert.throws(() => periodFor(monthly, "2026-13-01"));
});
test("civil days do not change through DST", () =>
  assert.equal(daysBetween("2026-03-07", "2026-03-09"), 2));
test("balance ignores old, future, other-card and estimated usage", () => {
  const rows = [
    usage(),
    usage({ id: "old", date: "2026-09-30" }),
    usage({ id: "future", date: "2026-10-25" }),
    usage({ id: "other", cardId: "c2" }),
    usage({ id: "estimate", evidence: "estimated", cents: 500 }),
  ];
  const b = balance(monthly, card, rows, "2026-10-19")!;
  assert.equal(b.remaining, 1500);
  assert.equal(b.selfReported, 1000);
  assert.equal(b.confirmed, 0);
  assert.equal(b.estimated, 500);
});
test("reset preserves ledger without consuming new allowance", () =>
  assert.equal(
    balance(monthly, card, [usage()], "2026-11-01")?.remaining,
    2500,
  ));
test("reversals retain audit entries but undo value", () => {
  const rows = [usage(), usage({ id: "undo", reverses: "u1" })];
  assert.equal(rows.length, 2);
  assert.equal(activeUsage(rows).length, 0);
  assert.equal(balance(monthly, card, rows, "2026-10-19")?.remaining, 2500);
});
test("legacy overspend clamps remaining to zero", () =>
  assert.equal(
    balance(monthly, card, [usage({ cents: 3000 })], "2026-10-19")?.remaining,
    0,
  ));
test("fractional cents, negative and invalid values rejected", () => {
  for (const n of [0, -1, 1.5, NaN, Infinity])
    assert.throws(() =>
      validateUsage(n, "2026-10-10", monthly, card, state, [], "2026-10-19"),
    );
});
test("over cap, old period, future and pre-opening rejected", () => {
  assert.throws(() =>
    validateUsage(2501, "2026-10-10", monthly, card, state, [], "2026-10-19"),
  );
  for (const d of ["2026-09-30", "2026-10-20", "2023-01-01"])
    assert.throws(() =>
      validateUsage(100, d, monthly, card, state, [], "2026-10-19"),
    );
});
test("eligibility and enrollment prerequisites", () => {
  assert.throws(() =>
    validateUsage(
      100,
      "2026-10-10",
      monthly,
      card,
      { ...state, eligibility: "unknown" },
      [],
      "2026-10-19",
    ),
  );
  assert.throws(() =>
    validateUsage(
      100,
      "2026-10-10",
      monthly,
      card,
      { ...state, enrollment: "unknown" },
      [],
      "2026-10-19",
    ),
  );
  assert.doesNotThrow(() =>
    validateUsage(
      1500,
      "2026-10-10",
      monthly,
      card,
      state,
      [usage()],
      "2026-10-19",
    ),
  );
});
test("enrollment needs explicit confirmation and is only self-reported", () => {
  assert.throws(() => transitionEnrollment("unknown", "enrolled", false, true));
  assert.deepEqual(transitionEnrollment("unknown", "enrolled", true, true), {
    enrollment: "enrolled",
    evidence: "self-reported",
  });
  assert.deepEqual(transitionEnrollment("enrolled", "unknown", false, true), {
    enrollment: "unknown",
    evidence: "unknown",
  });
  assert.throws(() =>
    transitionEnrollment("enrolled", "not-required", true, true),
  );
  assert.throws(() =>
    transitionEnrollment("not-required", "enrolled", true, false),
  );
});
test("actions are explainable, prioritized and suppress irrelevant or ineligible", () => {
  const s = emptyStore();
  s.cards = [card];
  const a = actionsFor(s, benefits, "2026-10-19");
  assert.equal(a[0].benefit.id, "dining");
  assert.equal(a[0].kind, "eligibility");
  assert.match(a[0].why, /deadline/);
  s.states["c1:dining"] = { ...state, relevant: false };
  s.states["c1:wellbeing"] = { ...state, eligibility: "ineligible" };
  assert.equal(actionsFor(s, benefits, "2026-10-19").length, 2);
});
test("usage action follows eligibility then enrollment", () => {
  const s = emptyStore();
  s.cards = [card];
  s.states["c1:dining"] = { ...state, enrollment: "not-enrolled" };
  assert.equal(actionsFor(s, [monthly], "2026-10-19")[0].kind, "enrollment");
  s.states["c1:dining"] = state;
  assert.equal(actionsFor(s, [monthly], "2026-10-19")[0].kind, "use");
  assert.equal(stateFor(s, "c1", monthly).evidence, "self-reported");
});
test("unknown fee differs from zero fee and evidence totals stay separate", () => {
  const records = [
    usage(),
    usage({ id: "confirmed", evidence: "confirmed", cents: 400 }),
    usage({ id: "estimated", evidence: "estimated" }),
    usage({ id: "future", date: "2026-12-01" }),
  ];
  assert.deepEqual(annualAnalysis(card, records, "2026-10-19"), {
    confirmed: 400,
    selfReported: 1000,
    estimated: 1000,
    net: null,
  });
  assert.equal(
    annualAnalysis({ ...card, annualFeeCents: 0 }, records, "2026-10-19").net,
    1400,
  );
  assert.equal(
    annualAnalysis({ ...card, annualFeeCents: 2000 }, records, "2026-10-19")
      .net,
    -600,
  );
});
test("calendar export uses exclusive end and opt-in alarms", () => {
  const events = [
    { id: "c1-dining", title: "Dining, demo; allowance", date: "2026-10-31" },
  ];
  const data = calendarFile(events, 3, true);
  assert.match(data, /DTEND;VALUE=DATE:20261101/);
  assert.match(data, /TRIGGER:-P3D/);
  assert.match(data, /Dining\\, demo\\; allowance/);
  assert.doesNotMatch(calendarFile(events, 3, false), /VALARM/);
  for (const line of data.split("\r\n"))
    assert.ok(new TextEncoder().encode(line).length <= 75);
});
