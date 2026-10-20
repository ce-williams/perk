"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Plus,
  LayoutDashboard,
  Wallet,
  CheckCheck,
  CalendarDays,
  Settings2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowDownToLine,
  ShieldCheck,
  Check,
  Utensils,
  Plane,
  Leaf,
  Gift,
  SlidersHorizontal,
  Clock3,
} from "lucide-react";
import {
  benefits,
  catalog,
  getBenefit,
  getProduct,
  cadenceLabel,
} from "@/lib/catalog";
import {
  actionsFor,
  activeUsage,
  annualAnalysis,
  balance,
  daysBetween,
  money,
  periodFor,
  stateFor,
  stateKey,
  todayInZone,
  transitionEnrollment,
  validateUsage,
  validDate,
  type Action,
} from "@/lib/rules";
import {
  browserRepository,
  download,
  emptyStore,
  sampleStore,
} from "@/lib/storage";
import { calendarFile } from "@/lib/calendar";
import type {
  Benefit,
  BenefitState,
  Enrollment,
  Store,
  UserCard,
} from "@/lib/types";
import { CardArt } from "./card-art";
export type View =
  | "overview"
  | "cards"
  | "benefits"
  | "actions"
  | "calendar"
  | "settings";
const links = [
  { view: "overview", href: "/", label: "Overview", icon: LayoutDashboard },
  { view: "cards", href: "/cards/", label: "My cards", icon: Wallet },
  {
    view: "actions",
    href: "/actions/",
    label: "Action center",
    icon: CheckCheck,
  },
  {
    view: "calendar",
    href: "/calendar/",
    label: "Benefit calendar",
    icon: CalendarDays,
  },
];
const iconFor = {
  Dining: Utensils,
  Travel: Plane,
  Wellbeing: Leaf,
  Anniversary: Gift,
};
const detailLink = (c: UserCard, b?: Benefit) =>
  `/benefits/?card=${encodeURIComponent(c.id)}${b ? "&benefit=" + b.id : ""}`;
const readable = (date: string) =>
  new Date(date + "T12:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
const shortDate = (date: string) =>
  new Date(date + "T12:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
const id = () => crypto.randomUUID();
function DemoLabel() {
  return <span className="pill demo-pill">Fictional demo</span>;
}
function BenefitIcon({ b }: { b: Benefit }) {
  const Icon = iconFor[b.category as keyof typeof iconFor];
  return <Icon size={20} strokeWidth={1.5} />;
}
function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => d?.close();
  }, []);
  return (
    <dialog ref={ref} onCancel={onClose} aria-labelledby="dialog-title">
      <div className="dialog-head">
        <h2 id="dialog-title">{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function PerkApp({ view }: { view: View }) {
  const [store, setStore] = useState<Store>(emptyStore),
    [loaded, setLoaded] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [catalogOpen, setCatalogOpen] = useState(false),
    [search, setSearch] = useState(""),
    [issuer, setIssuer] = useState("All issuers"),
    [date, setDate] = useState(""),
    [selectedCard, setSelectedCard] = useState(""),
    [selectedBenefit, setSelectedBenefit] = useState("");
  const [modal, setModal] = useState<{
      kind: "enrollment" | "usage";
      card: UserCard;
      benefit: Benefit;
    } | null>(null),
    [actionFilter, setActionFilter] = useState("all"),
    [month, setMonth] = useState(""),
    [resetOpen, setResetOpen] = useState(false);
  useEffect(() => {
    try {
      const s = browserRepository.load();
      setStore(s);
      const now = todayInZone(s.preferences.timezone);
      setDate(now);
      setMonth(now.slice(0, 7));
    } catch (e) {
      setError(String(e));
      const now = todayInZone();
      setDate(now);
      setMonth(now.slice(0, 7));
    }
    setLoaded(true);
    const params = new URLSearchParams(window.location.search);
    setSelectedCard(params.get("card") ?? "");
    setSelectedBenefit(params.get("benefit") ?? "");
  }, []);
  useEffect(() => {
    if (!loaded) return;
    const update = () => setDate(todayInZone(store.preferences.timezone));
    const timer = setInterval(update, 30000);
    window.addEventListener("focus", update);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", update);
    };
  }, [loaded, store.preferences.timezone]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(t);
  }, [notice]);
  function commit(next: Store, message = "") {
    try {
      browserRepository.save(next);
      setStore(next);
      setError("");
      if (message) setNotice(message);
      return true;
    } catch {
      setError(
        "Your browser could not save this change. Allow site storage or export your data before trying again.",
      );
      return false;
    }
  }
  const cards = store.cards.filter((c) => !c.archived),
    actions = date ? actionsFor(store, benefits, date) : [],
    top = actions[0];
  const total = cards.reduce(
    (a, c) => {
      const v = annualAnalysis(c, store.usages, date || "2026-01-01");
      return {
        self: a.self + v.selfReported,
        confirmed: a.confirmed + v.confirmed,
      };
    },
    { self: 0, confirmed: 0 },
  );
  function toggleCard(productId: string) {
    const existing = store.cards.find((c) => c.productId === productId);
    if (existing)
      commit(
        {
          ...store,
          cards: store.cards.map((c) =>
            c.id === existing.id ? { ...c, archived: !c.archived } : c,
          ),
        },
        existing.archived
          ? "Card restored."
          : "Card removed. Its history is preserved.",
      );
    else
      commit(
        {
          ...store,
          cards: [
            ...store.cards,
            {
              id: productId,
              productId,
              openedOn: "",
              annualFeeCents: null,
              archived: false,
            },
          ],
        },
        "Card added. Fictional demo scenarios are ready.",
      );
  }
  function loadSample() {
    if (cards.length) return;
    commit(
      sampleStore(date),
      "Sample portfolio loaded. All benefit data is fictional.",
    );
  }
  function updateState(
    card: UserCard,
    b: Benefit,
    patch: Partial<BenefitState>,
  ) {
    commit(
      {
        ...store,
        states: {
          ...store.states,
          [stateKey(card.id, b.id)]: {
            ...stateFor(store, card.id, b),
            ...patch,
          },
        },
      },
      "Benefit preference saved.",
    );
  }
  function actionRow(a: Action) {
    return (
      <article className="action-row" key={a.card.id + a.benefit.id}>
        <div className="benefit-symbol">
          <BenefitIcon b={a.benefit} />
        </div>
        <div className="action-copy">
          <div className="row-meta">
            {getProduct(a.card.productId).shortName} <span>·</span>{" "}
            {cadenceLabel[a.benefit.cadence]}
          </div>
          <h3>
            <Link href={detailLink(a.card, a.benefit)}>{a.benefit.title}</Link>
          </h3>
          <p>
            {a.title}{" "}
            {a.balance
              ? `before ${shortDate(a.balance.end)}.`
              : "to see this period."}
          </p>
        </div>
        <div className="action-value">
          <strong>{a.balance ? money(a.balance.remaining) : "—"}</strong>
          <small>{a.balance ? "demo remaining" : "Date needed"}</small>
        </div>
        <Link
          className="action-arrow"
          href={detailLink(a.card, a.benefit)}
          aria-label={`${a.title}: ${a.benefit.title}`}
        >
          <ArrowUpRight size={22} />
        </Link>
      </article>
    );
  }
  const heading = {
    overview: "Your portfolio,\naccounted for.",
    cards: "A good portfolio.\nAn even better plan.",
    benefits: "The details make\nthe difference.",
    actions: "A little attention.\nA lot more value.",
    calendar: "Good things\nhave a timeline.",
    settings: "Make PERK\nwork for you.",
  }[view];
  const subtitle = {
    overview: "A clear view of what is yours, and what to do next.",
    cards: "The cards you carry. The possibilities worth keeping.",
    benefits: "Know the terms. Take the next step. Keep the evidence.",
    actions: "Your next steps, ordered by deadline and remaining allowance.",
    calendar: "See what resets next. Make time for what matters.",
    settings: "Your preferences, your data, your choice.",
  }[view];
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <Link href="/" className="wordmark" aria-label="PERK overview">
          perk<span>®</span>
        </Link>
        <p className="brand-caption">More from what is yours.</p>
        <nav aria-label="Main navigation">
          {links.map(({ view: v, href, label, icon: Icon }) => (
            <Link
              key={v}
              href={href}
              aria-current={
                v === view || (v === "cards" && view === "benefits")
                  ? "page"
                  : undefined
              }
            >
              <Icon size={18} strokeWidth={1.5} />
              <span>{label}</span>
              {v === "actions" && actions.length > 0 && (
                <small>{actions.length}</small>
              )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="local-note">
            <ShieldCheck size={19} />
            <p>
              No bank connection.
              <br />
              Just your possibilities.
            </p>
          </div>
          <Link
            className={
              view === "settings" ? "settings-link active" : "settings-link"
            }
            href="/settings/"
          >
            <Settings2 size={18} />
            Settings & preferences
          </Link>
          <Link className="design-link" href="/directions/">
            The design studies <ArrowUpRight size={14} />
          </Link>
          <div className="profile">
            <span>P</span>
            <div>
              <strong>Your personal space</strong>
              <small>Local demo · no account needed</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span>Your portfolio ledger</span>
          <div>
            <span className="demo-indicator">Demo workspace</span>
            <span className="top-date">
              {date ? readable(date) : "Loading…"}
            </span>
            <Link
              className="header-settings"
              href="/settings/"
              aria-label="Settings and preferences"
            >
              <Settings2 size={18} />
            </Link>
          </div>
        </header>
        <main id="main" className="main-content">
          <div className="page-heading">
            <div>
              <h1>
                {heading.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    {i === 0 && <br />}
                  </span>
                ))}
              </h1>
              <p>{subtitle}</p>
            </div>
            {view !== "settings" && view !== "benefits" && (
              <button
                className="button secondary"
                onClick={() => setCatalogOpen(true)}
              >
                <Plus size={17} />
                Add a card
              </button>
            )}
          </div>
          <div className="demo-banner">
            <DemoLabel />
            <p>
              Real card names. Fictional benefit scenarios and amounts. Verify
              actual terms with your issuer.
            </p>
          </div>
          {error && (
            <div role="alert" className="error-message">
              {error}
            </div>
          )}
          {!loaded ? (
            <div className="empty-state">
              <h2>Opening your journal…</h2>
            </div>
          ) : (
            <>
              {view === "overview" &&
                (cards.length === 0 ? (
                  <div className="onboarding">
                    <div>
                      <h2>
                        Start with what
                        <br />
                        is already in your wallet.
                      </h2>
                      <p>
                        Add your cards. We’ll organize fictional benefit
                        scenarios into a clear, prioritized plan. No card
                        numbers, no bank connection.
                      </p>
                      <div className="button-group">
                        <button
                          className="button primary"
                          onClick={() => setCatalogOpen(true)}
                        >
                          Find my cards <ArrowRight size={18} />
                        </button>
                        <button className="text-link" onClick={loadSample}>
                          Explore a sample portfolio <ArrowUpRight size={17} />
                        </button>
                      </div>
                      <div className="onboarding-steps">
                        <span>
                          <Check size={15} />
                          Choose your cards
                        </span>
                        <span>
                          <Check size={15} />
                          See your next step
                        </span>
                        <span>
                          <Check size={15} />
                          Keep track of value
                        </span>
                      </div>
                    </div>
                    <div className="card-stack" aria-hidden="true">
                      <CardArt product={catalog[1]} />
                      <CardArt product={catalog[2]} />
                      <CardArt product={catalog[0]} />
                    </div>
                  </div>
                ) : (
                  <div className="overview-grid">
                    <div className="overview-primary">
                      <section className="portfolio-ledger">
                        <div className="portfolio-ledger-label">
                          <span>RECORDED DEMO VALUE · {date.slice(0, 4)}</span>
                          <span className="pill">Self-reported journal</span>
                        </div>
                        <div className="portfolio-ledger-main">
                          <strong>{money(total.self + total.confirmed)}</strong>
                          <div>
                            <p>
                              What you’ve used.
                              <br />
                              Always accounted for.
                            </p>
                            <Link href="/cards/" className="text-link">
                              Review portfolio <ArrowUpRight size={17} />
                            </Link>
                          </div>
                        </div>
                        <div className="ledger-columns">
                          <div>
                            <span>Self-reported</span>
                            <b>{money(total.self)}</b>
                          </div>
                          <div>
                            <span>Issuer-confirmed</span>
                            <b>{money(total.confirmed)}</b>
                          </div>
                          <div>
                            <span>Annual fees supplied</span>
                            <b>
                              {
                                cards.filter((c) => c.annualFeeCents !== null)
                                  .length
                              }{" "}
                              / {cards.length}
                            </b>
                          </div>
                        </div>
                        <details>
                          <summary>Calculation & evidence</summary>
                          <p>
                            Unreversed confirmed + self-reported usage this
                            calendar year through today, across active cards.
                            Estimated use and unused allowances are excluded.
                            All records are fictional demo data. Annual fees are
                            supplied by you; a missing fee is unknown.
                          </p>
                        </details>
                      </section>
                      <section className="section-block">
                        <div className="section-heading">
                          <h2>Cards in your portfolio</h2>
                          <Link className="text-link" href="/cards/">
                            My cards <ArrowRight size={16} />
                          </Link>
                        </div>
                        <div className="wallet-strip">
                          {cards.slice(0, 3).map((c) => (
                            <Link href={detailLink(c)} key={c.id}>
                              <CardArt product={getProduct(c.productId)} />
                              <strong>
                                {getProduct(c.productId).shortName}
                              </strong>
                              <small>
                                {benefits.length} fictional scenarios
                              </small>
                            </Link>
                          ))}
                        </div>
                      </section>
                      <section className="section-block">
                        <div className="section-heading">
                          <h2>Worth your attention</h2>
                          <Link href="/actions/" className="text-link">
                            All actions <ArrowRight size={16} />
                          </Link>
                        </div>
                        <p className="section-description">
                          Deadline first, then remaining allowance. Every amount
                          is fictional.
                        </p>
                        {actions.slice(0, 3).map(actionRow)}
                        {actions.length === 0 && (
                          <p className="empty-inline">
                            No actions to show. Review relevance and eligibility
                            in My cards.
                          </p>
                        )}
                      </section>
                    </div>
                    <aside className="overview-aside">
                      <section className="portfolio-notes">
                        <h2>Next in your ledger</h2>
                        {top ? (
                          <>
                            <span className="deadline-tag">
                              {top.balance
                                ? `Before ${shortDate(top.balance.end)}`
                                : "Date needed"}
                            </span>
                            <h3>{top.benefit.title}</h3>
                            <p>
                              {top.title}.{" "}
                              {top.balance
                                ? `${money(top.balance.remaining)} in fictional allowance remains.`
                                : "Add an opening date for the anniversary timeline."}
                            </p>
                            <Link
                              className="button primary"
                              href={detailLink(top.card, top.benefit)}
                            >
                              {top.title}
                              <ArrowUpRight size={16} />
                            </Link>
                            <small>
                              {getProduct(top.card.productId).shortName} ·
                              Fictional demo
                            </small>
                          </>
                        ) : (
                          <p>No relevant actions remain this period.</p>
                        )}
                      </section>
                      <section className="up-next">
                        <h2>Upcoming resets</h2>
                        {actions
                          .filter((a) => a.balance)
                          .slice(0, 2)
                          .map((a) => (
                            <Link
                              key={a.card.id + a.benefit.id}
                              href={detailLink(a.card, a.benefit)}
                            >
                              <div className="date-tile">
                                <strong>{a.balance!.deadline.slice(8)}</strong>
                                <small>
                                  {new Date(
                                    a.balance!.deadline + "T12:00Z",
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    timeZone: "UTC",
                                  })}
                                </small>
                              </div>
                              <div>
                                <strong>{a.benefit.category} reset</strong>
                                <small>
                                  {getProduct(a.card.productId).shortName}
                                </small>
                              </div>
                            </Link>
                          ))}
                        <Link className="text-link" href="/calendar/">
                          Open calendar <ArrowRight size={16} />
                        </Link>
                      </section>
                      <div className="editorial-note">
                        <p>
                          A clear record.
                          <br />A better next step.
                        </p>
                        <span>That’s the idea behind PERK.</span>
                      </div>
                    </aside>
                  </div>
                ))}
              {view === "cards" && (
                <>
                  <div className="section-heading">
                    <h2>
                      Your portfolio{" "}
                      <span className="count">{cards.length}</span>
                    </h2>
                    <span className="muted">No account numbers stored</span>
                  </div>
                  {cards.length === 0 ? (
                    <Empty
                      title="Your wallet starts here."
                      text="Find the cards you already own, or explore a clearly labeled sample."
                      onAdd={() => setCatalogOpen(true)}
                      onSample={loadSample}
                    />
                  ) : (
                    <div className="portfolio-grid">
                      {cards.map((c) => {
                        const product = getProduct(c.productId),
                          v = annualAnalysis(c, store.usages, date);
                        return (
                          <article className="portfolio-card" key={c.id}>
                            <Link href={detailLink(c)}>
                              <CardArt product={product} />
                            </Link>
                            <div className="portfolio-title">
                              <div>
                                <span className="row-meta">
                                  {product.issuer}
                                </span>
                                <h2>{product.shortName}</h2>
                              </div>
                              <Link
                                className="action-arrow"
                                href={detailLink(c)}
                                aria-label={`Open ${product.shortName}`}
                              >
                                <ArrowUpRight size={23} />
                              </Link>
                            </div>
                            <p className="muted">
                              4 fictional benefit scenarios
                            </p>
                            <div className="value-line">
                              <span>
                                Recorded demo value · {date.slice(0, 4)}
                              </span>
                              <strong>
                                {money(v.selfReported + v.confirmed)}
                              </strong>
                            </div>
                            <div className="value-line">
                              <span>Annual fee</span>
                              <strong>
                                {c.annualFeeCents === null
                                  ? "Not provided"
                                  : money(c.annualFeeCents)}
                              </strong>
                            </div>
                            <div className="portfolio-footer">
                              <Link className="text-link" href={detailLink(c)}>
                                Explore benefits <ArrowRight size={16} />
                              </Link>
                              <button
                                className="button ghost"
                                onClick={() => toggleCard(c.productId)}
                              >
                                Remove
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                  {store.cards.some((c) => c.archived) && (
                    <section className="section-block">
                      <h2>Removed cards</h2>
                      <p className="muted">
                        History is preserved. Restore a card to include it in
                        your portfolio.
                      </p>
                      {store.cards
                        .filter((c) => c.archived)
                        .map((c) => (
                          <div className="value-line" key={c.id}>
                            <span>{getProduct(c.productId).name}</span>
                            <button
                              className="button ghost"
                              onClick={() => toggleCard(c.productId)}
                            >
                              Restore card
                            </button>
                          </div>
                        ))}
                    </section>
                  )}
                </>
              )}
              {view === "actions" && (
                <>
                  <div className="filter-row">
                    <div className="segmented" aria-label="Filter actions">
                      {[
                        ["all", "All actions"],
                        ["enrollment", "Enrollment"],
                        ["use", "Ready to use"],
                        ["eligibility", "Eligibility"],
                      ].map(([v, l]) => (
                        <button
                          key={v}
                          aria-pressed={actionFilter === v}
                          className={actionFilter === v ? "selected" : ""}
                          onClick={() => setActionFilter(v)}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                    <span className="muted">
                      <SlidersHorizontal size={15} /> Deadline, then allowance
                    </span>
                  </div>
                  {actions
                    .filter(
                      (a) => actionFilter === "all" || a.kind === actionFilter,
                    )
                    .map((a) => (
                      <div
                        key={a.card.id + a.benefit.id}
                        className="expanded-action"
                      >
                        {actionRow(a)}
                        <p className="action-reason">
                          {a.why} <DemoLabel />
                        </p>
                      </div>
                    ))}
                  {actions.filter(
                    (a) => actionFilter === "all" || a.kind === actionFilter,
                  ).length === 0 && (
                    <Empty
                      title={
                        cards.length
                          ? "Nothing in this view."
                          : "Your next step starts with a card."
                      }
                      text={
                        cards.length
                          ? "Try All actions, or review your relevance preferences."
                          : "Add the cards you carry to discover fictional benefit scenarios."
                      }
                      onAdd={() => setCatalogOpen(true)}
                    />
                  )}
                </>
              )}
              {view === "benefits" &&
                (() => {
                  const c =
                    cards.find((c) => c.id === selectedCard) ?? cards[0];
                  if (!c)
                    return (
                      <Empty
                        title="Choose a card to begin."
                        text="Your card details and benefit journal will appear here."
                        onAdd={() => setCatalogOpen(true)}
                      />
                    );
                  const product = getProduct(c.productId),
                    v = annualAnalysis(c, store.usages, date);
                  return (
                    <>
                      <Link className="text-link" href="/cards/">
                        <ChevronLeft size={16} />
                        Back to my cards
                      </Link>
                      <div className="card-detail-top">
                        <CardArt product={product} />
                        <div>
                          <span className="row-meta">{product.issuer}</span>
                          <h2>{product.name}</h2>
                          <p className="muted">
                            Original card illustration · not issuer artwork
                          </p>
                          <a
                            className="text-link"
                            href={product.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Issuer homepage <ArrowUpRight size={16} />
                          </a>
                          <small className="block muted">
                            Official homepage only. No verified enrollment
                            destination is available for these fictional
                            scenarios.
                          </small>
                        </div>
                      </div>
                      <CardForm
                        key={c.id}
                        card={c}
                        asOf={date}
                        onSave={(patch) =>
                          commit(
                            {
                              ...store,
                              cards: store.cards.map((x) =>
                                x.id === c.id ? { ...x, ...patch } : x,
                              ),
                            },
                            "Card details saved.",
                          )
                        }
                      />
                      <div className="detail-summary">
                        <div>
                          <span>Recorded · {date.slice(0, 4)}</span>
                          <strong>{money(v.confirmed + v.selfReported)}</strong>
                          <small>
                            {money(v.selfReported)} self-reported ·{" "}
                            {money(v.confirmed)} confirmed
                          </small>
                        </div>
                        <div>
                          <span>After annual fee</span>
                          <strong>
                            {v.net === null ? "Unknown" : money(v.net)}
                          </strong>
                          <small>
                            {v.net === null
                              ? "Add your annual fee to compare."
                              : "Calendar-year recorded value minus your fee."}
                          </small>
                        </div>
                        <p>
                          Fictional demo usage only. A calendar-year comparison
                          may differ from your card anniversary year. No unused
                          allowance is counted as savings.
                        </p>
                      </div>
                      <div className="section-heading section-block">
                        <h2>Benefits, with the details.</h2>
                        <span className="muted">4 fictional scenarios</span>
                      </div>
                      {benefits.map((b) => {
                        const s = stateFor(store, c.id, b),
                          bal = balance(b, c, store.usages, date),
                          history = store.usages.filter(
                            (u) => u.cardId === c.id && u.benefitId === b.id,
                          );
                        return (
                          <details
                            className="benefit-detail"
                            key={b.id}
                            open={selectedBenefit === b.id || undefined}
                            onToggle={(e) => {
                              if (
                                e.currentTarget.open &&
                                selectedBenefit !== b.id
                              )
                                setSelectedBenefit(b.id);
                            }}
                          >
                            <summary>
                              <BenefitIcon b={b} />
                              <span>
                                <strong>{b.title}</strong>
                                <small>
                                  {cadenceLabel[b.cadence]} ·{" "}
                                  {b.requiresEnrollment
                                    ? "Enrollment required"
                                    : "No enrollment in demo"}
                                </small>
                              </span>
                              <span className="benefit-summary-value">
                                {bal ? money(bal.remaining) : "—"}
                                <small>demo remaining</small>
                              </span>
                              <Plus className="details-plus" size={18} />
                            </summary>
                            <div className="benefit-body">
                              <div className="benefit-facts">
                                <DemoLabel />
                                <span>
                                  {s.eligibility === "unknown"
                                    ? "Eligibility unknown"
                                    : s.eligibility === "eligible"
                                      ? "Eligible · self-reported"
                                      : "Ineligible · self-reported"}
                                </span>
                                <span>
                                  {s.enrollment === "not-required"
                                    ? "Enrollment not required"
                                    : `${s.enrollment.replace("-", " ")} · ${s.evidence}`}
                                </span>
                              </div>
                              <h3>What to do</h3>
                              <p>{b.instructions}</p>
                              <h3>Why it matters</h3>
                              <p>
                                {bal
                                  ? `${money(bal.remaining)} of ${money(b.capCents)} fictional allowance remains. Period: ${readable(bal.start)} through ${readable(bal.deadline)}. Resets ${readable(bal.end)}. No rollover.`
                                  : "Add your opening date above to calculate the anniversary period."}
                              </p>
                              <h3>How to verify completion</h3>
                              <p>{b.verification}</p>
                              <details className="calculation">
                                <summary>Calculation & source status</summary>
                                <p>
                                  {bal
                                    ? `${money(b.capCents)} cap − ${money(bal.confirmed)} confirmed − ${money(bal.selfReported)} self-reported = ${money(bal.remaining)} remaining (minimum $0). ${money(bal.estimated)} estimated use is excluded.`
                                    : "Period and remaining value are unknown until an opening date is supplied."}{" "}
                                  Definition: {b.revisionId}. Source: PERK
                                  fictional test fixture. Issuer verification:
                                  never. Eligibility and enrollment rules are
                                  not factual issuer terms.
                                </p>
                              </details>
                              <div className="benefit-controls">
                                <label>
                                  Eligibility in this demo
                                  <select
                                    value={s.eligibility}
                                    onChange={(e) =>
                                      updateState(c, b, {
                                        eligibility: e.target
                                          .value as BenefitState["eligibility"],
                                      })
                                    }
                                  >
                                    <option value="unknown">
                                      Unknown — review first
                                    </option>
                                    <option value="eligible">
                                      I confirm I am eligible (self-report)
                                    </option>
                                    <option value="ineligible">
                                      I am not eligible (self-report)
                                    </option>
                                  </select>
                                </label>
                                <label className="checkbox-label">
                                  <input
                                    type="checkbox"
                                    checked={s.relevant}
                                    onChange={(e) =>
                                      updateState(c, b, {
                                        relevant: e.target.checked,
                                      })
                                    }
                                  />
                                  Relevant to me
                                </label>
                              </div>
                              <div className="button-group">
                                {b.requiresEnrollment && (
                                  <button
                                    className="button secondary"
                                    onClick={() =>
                                      setModal({
                                        kind: "enrollment",
                                        card: c,
                                        benefit: b,
                                      })
                                    }
                                  >
                                    {s.enrollment === "enrolled"
                                      ? "Update enrollment"
                                      : "Review enrollment"}
                                    <ArrowUpRight size={16} />
                                  </button>
                                )}
                                <button
                                  className="button primary"
                                  disabled={
                                    !bal ||
                                    s.eligibility !== "eligible" ||
                                    (b.requiresEnrollment &&
                                      s.enrollment !== "enrolled")
                                  }
                                  onClick={() =>
                                    setModal({
                                      kind: "usage",
                                      card: c,
                                      benefit: b,
                                    })
                                  }
                                >
                                  Record demo usage <Plus size={16} />
                                </button>
                              </div>
                              {(s.eligibility !== "eligible" ||
                                (b.requiresEnrollment &&
                                  s.enrollment !== "enrolled")) && (
                                <small className="block muted">
                                  Confirm eligibility
                                  {b.requiresEnrollment
                                    ? " and enrollment"
                                    : ""}{" "}
                                  before recording usage.
                                </small>
                              )}
                              {history.length > 0 && (
                                <div className="usage-history">
                                  <h3>Usage journal</h3>
                                  {history.map((u) => {
                                    const reversed = store.usages.some(
                                      (x) => x.reverses === u.id,
                                    );
                                    return (
                                      <div className="history-row" key={u.id}>
                                        <div>
                                          <strong>
                                            {u.reverses
                                              ? "Reversal"
                                              : money(u.cents)}
                                          </strong>
                                          <small>
                                            {readable(u.date)} · {u.evidence}
                                            {reversed ? " · reversed" : ""} ·
                                            revision {u.revisionId}
                                          </small>
                                        </div>
                                        {!u.reverses && !reversed && (
                                          <button
                                            className="button ghost"
                                            onClick={() =>
                                              commit(
                                                {
                                                  ...store,
                                                  usages: [
                                                    ...store.usages,
                                                    {
                                                      ...u,
                                                      id: id(),
                                                      recordedAt:
                                                        new Date().toISOString(),
                                                      reverses: u.id,
                                                    },
                                                  ],
                                                },
                                                "Usage reversed. Original record preserved.",
                                              )
                                            }
                                          >
                                            Undo record
                                          </button>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                              {store.events.some(
                                (e) =>
                                  e.cardId === c.id && e.benefitId === b.id,
                              ) && (
                                <details className="calculation">
                                  <summary>Enrollment history</summary>
                                  {store.events
                                    .filter(
                                      (e) =>
                                        e.cardId === c.id &&
                                        e.benefitId === b.id,
                                    )
                                    .map((e) => (
                                      <p key={e.id}>
                                        {e.from} → {e.to} · {e.evidence} ·{" "}
                                        {new Date(e.at).toLocaleString()}
                                      </p>
                                    ))}
                                </details>
                              )}
                            </div>
                          </details>
                        );
                      })}
                    </>
                  );
                })()}
              {view === "calendar" && (
                <>
                  <div className="calendar-toolbar">
                    <div className="month-controls">
                      <button
                        className="icon-button"
                        aria-label="Previous month"
                        onClick={() => setMonth(shiftMonth(month, -1))}
                      >
                        <ChevronLeft size={19} />
                      </button>
                      <h2>
                        {month
                          ? new Date(
                              month + "-15T12:00:00Z",
                            ).toLocaleDateString("en-US", {
                              month: "long",
                              year: "numeric",
                              timeZone: "UTC",
                            })
                          : ""}
                      </h2>
                      <button
                        className="icon-button"
                        aria-label="Next month"
                        onClick={() => setMonth(shiftMonth(month, 1))}
                      >
                        <ChevronRight size={19} />
                      </button>
                    </div>
                    <button
                      className="button secondary"
                      disabled={!cards.length}
                      onClick={() => {
                        const ev = calendarEvents(store, month, date);
                        download(
                          "perk-demo-deadlines.ics",
                          calendarFile(
                            ev,
                            store.preferences.leadDays,
                            store.preferences.calendarReminders,
                          ),
                          "text/calendar",
                        );
                        setNotice(
                          `${ev.length} demo deadlines exported for this month.`,
                        );
                      }}
                    >
                      <ArrowDownToLine size={17} />
                      Export this month
                    </button>
                  </div>
                  <p className="section-description">
                    Last day of each fictional benefit period. No rollover.
                    Export creates all-day calendar events
                    {store.preferences.calendarReminders
                      ? ` with ${store.preferences.leadDays}-day alerts`
                      : ""}
                    .
                  </p>
                  <div className="calendar-grid">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (d) => (
                        <div className="calendar-weekday" key={d}>
                          {d}
                        </div>
                      ),
                    )}
                    {month &&
                      Array.from(
                        { length: new Date(month + "-01T12:00Z").getUTCDay() },
                        (_, i) => (
                          <div
                            className="calendar-cell blank"
                            key={"blank" + i}
                          />
                        ),
                      )}
                    {month &&
                      Array.from(
                        {
                          length: new Date(
                            Date.UTC(+month.slice(0, 4), +month.slice(5), 0),
                          ).getUTCDate(),
                        },
                        (_, i) => {
                          const d =
                              month + "-" + String(i + 1).padStart(2, "0"),
                            ev = calendarEvents(store, month, date).filter(
                              (e) => e.date === d,
                            );
                          return (
                            <div
                              className={`calendar-cell ${d === date ? "today" : ""}`}
                              key={d}
                            >
                              <span className="day-number">{i + 1}</span>
                              {ev.slice(0, 2).map((e) => (
                                <Link href={e.href} key={e.id}>
                                  {e.category} · {e.product}
                                </Link>
                              ))}
                              {ev.length > 2 && (
                                <span className="more-events">
                                  +{ev.length - 2} below
                                </span>
                              )}
                            </div>
                          );
                        },
                      )}
                  </div>
                  <section className="section-block">
                    <h2>Deadlines this month</h2>
                    {calendarEvents(store, month, date).map((e) => (
                      <Link href={e.href} className="deadline-row" key={e.id}>
                        <span className="date-inline">{shortDate(e.date)}</span>
                        <div>
                          <strong>{e.title}</strong>
                          <small>
                            {e.product} · fictional demo · last day before reset
                          </small>
                        </div>
                        <ArrowUpRight size={18} />
                      </Link>
                    ))}
                    {calendarEvents(store, month, date).length === 0 && (
                      <p className="empty-inline">
                        No known deadlines this month. Anniversary benefits need
                        an opening date; irrelevant and ineligible benefits are
                        excluded.
                      </p>
                    )}
                  </section>
                </>
              )}
              {view === "settings" && (
                <div className="settings-content">
                  <section>
                    <h2>Your calendar, your pace.</h2>
                    <p className="muted">
                      Preferences apply to downloaded calendar files. This demo
                      does not send email or push notifications.
                    </p>
                    <label className="settings-row checkbox-label">
                      <span>
                        <strong>Include calendar alerts</strong>
                        <small>Add an alert when you export deadlines.</small>
                      </span>
                      <input
                        type="checkbox"
                        checked={store.preferences.calendarReminders}
                        onChange={(e) =>
                          commit(
                            {
                              ...store,
                              preferences: {
                                ...store.preferences,
                                calendarReminders: e.target.checked,
                              },
                            },
                            "Calendar alert preference saved.",
                          )
                        }
                      />
                    </label>
                    <label className="settings-row">
                      <span>
                        <strong>Remind me before a deadline</strong>
                        <small>
                          Used only when calendar alerts are enabled.
                        </small>
                      </span>
                      <select
                        value={store.preferences.leadDays}
                        onChange={(e) =>
                          commit(
                            {
                              ...store,
                              preferences: {
                                ...store.preferences,
                                leadDays: +e.target.value,
                              },
                            },
                            "Reminder timing saved.",
                          )
                        }
                      >
                        <option value={1}>1 day before</option>
                        <option value={3}>3 days before</option>
                        <option value={7}>7 days before</option>
                      </select>
                    </label>
                    <label className="settings-row">
                      <span>
                        <strong>Your timezone</strong>
                        <small>
                          Controls “today” in this journal. Demo resets use
                          civil dates.
                        </small>
                      </span>
                      <select
                        value={store.preferences.timezone}
                        onChange={(e) => {
                          const timezone = e.target.value;
                          if (
                            commit(
                              {
                                ...store,
                                preferences: { ...store.preferences, timezone },
                              },
                              "Timezone saved.",
                            )
                          )
                            setDate(todayInZone(timezone));
                        }}
                      >
                        {[
                          "America/New_York",
                          "America/Chicago",
                          "America/Denver",
                          "America/Los_Angeles",
                          "America/Anchorage",
                          "Pacific/Honolulu",
                        ].map((z) => (
                          <option key={z} value={z}>
                            {z.replaceAll("_", " ")}
                          </option>
                        ))}
                      </select>
                    </label>
                  </section>
                  <section>
                    <h2>Your data stays with you.</h2>
                    <p className="muted">
                      Stored in this browser on this device. There is no bank
                      connection or cloud sync. Do not enter sensitive financial
                      details.
                    </p>
                    <div className="settings-row">
                      <span>
                        <strong>Export your journal</strong>
                        <small>
                          Download cards, preferences and the complete audit
                          history as JSON.
                        </small>
                      </span>
                      <button
                        className="button secondary"
                        onClick={() =>
                          download(
                            "perk-demo-journal.json",
                            JSON.stringify(store, null, 2),
                            "application/json",
                          )
                        }
                      >
                        <ArrowDownToLine size={16} />
                        Export data
                      </button>
                    </div>
                    <div className="settings-row">
                      <span>
                        <strong>Start again</strong>
                        <small>
                          Permanently remove this browser’s PERK demo data.
                        </small>
                      </span>
                      <button
                        className="button secondary danger"
                        onClick={() => setResetOpen(true)}
                      >
                        Reset demo
                      </button>
                    </div>
                  </section>
                  <section>
                    <h2>Room to grow.</h2>
                    <p>
                      Household accounts, smart reminders, reconciliation and
                      annual-fee reviews are planned for PERK Pro. This
                      prototype has no paid subscription or checkout.
                    </p>
                    <Link className="text-link" href="/directions/">
                      Explore the design studies <ArrowUpRight size={16} />
                    </Link>
                  </section>
                </div>
              )}
            </>
          )}
          <footer className="page-footer">
            <span>Make more of what is yours.</span>
            <span>PERK · Independent demo · No issuer affiliation</span>
          </footer>
        </main>
      </div>
      <div
        role="status"
        aria-live="polite"
        className={notice ? "toast visible" : "toast"}
      >
        {notice && (
          <>
            <Check size={16} />
            {notice}
          </>
        )}
      </div>
      {catalogOpen && (
        <Modal
          title="What’s in your wallet?"
          onClose={() => {
            setCatalogOpen(false);
            setSearch("");
          }}
        >
          <p className="muted">
            Search real card names. Each card gets the same fictional test
            scenarios; no real benefits or fees are asserted.
          </p>
          <label className="search-field">
            <Search size={18} />
            <span className="sr-only">Search credit cards</span>
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by card or issuer…"
            />
          </label>
          <label className="issuer-filter">
            Issuer
            <select value={issuer} onChange={(e) => setIssuer(e.target.value)}>
              <option>All issuers</option>
              {Array.from(new Set(catalog.map((c) => c.issuer))).map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </label>
          <div className="catalog-list">
            {catalog
              .filter(
                (p) =>
                  (issuer === "All issuers" || p.issuer === issuer) &&
                  `${p.name} ${p.issuer}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
              )
              .map((p) => {
                const added = cards.some((c) => c.productId === p.id);
                return (
                  <button
                    className={`catalog-option ${added ? "added" : ""}`}
                    key={p.id}
                    aria-pressed={added}
                    onClick={() => toggleCard(p.id)}
                  >
                    <div className="catalog-art">
                      <CardArt product={p} compact />
                    </div>
                    <span>
                      <strong>{p.name}</strong>
                      <small>{p.issuer}</small>
                    </span>
                    <span className="select-box">
                      {added ? <Check size={16} /> : <Plus size={16} />}
                    </span>
                  </button>
                );
              })}
            {!catalog.some(
              (p) =>
                (issuer === "All issuers" || p.issuer === issuer) &&
                `${p.name} ${p.issuer}`
                  .toLowerCase()
                  .includes(search.toLowerCase()),
            ) && (
              <p className="empty-inline">
                No cards found. Try a different card name or issuer.
              </p>
            )}
          </div>
          <div className="dialog-footer">
            <span>
              {cards.length} {cards.length === 1 ? "card" : "cards"} selected
            </span>
            <Link
              className={`button primary ${cards.length ? "" : "disabled-link"}`}
              href="/actions/"
              onClick={(e) => {
                if (!cards.length) e.preventDefault();
                else setCatalogOpen(false);
              }}
            >
              See my next steps <ArrowRight size={16} />
            </Link>
          </div>
        </Modal>
      )}
      {modal && (
        <Modal
          title={
            modal.kind === "usage"
              ? "Record a little value."
              : "Enrollment, on your terms."
          }
          onClose={() => setModal(null)}
        >
          {modal.kind === "enrollment" ? (
            <EnrollmentForm
              current={stateFor(store, modal.card.id, modal.benefit).enrollment}
              onSubmit={(to, confirmed) => {
                try {
                  const from = stateFor(store, modal.card.id, modal.benefit),
                    result = transitionEnrollment(
                      from.enrollment,
                      to,
                      confirmed,
                      modal.benefit.requiresEnrollment,
                    );
                  if (
                    commit(
                      {
                        ...store,
                        states: {
                          ...store.states,
                          [stateKey(modal.card.id, modal.benefit.id)]: {
                            ...from,
                            ...result,
                          },
                        },
                        events: [
                          ...store.events,
                          {
                            id: id(),
                            cardId: modal.card.id,
                            benefitId: modal.benefit.id,
                            from: from.enrollment,
                            to,
                            evidence: result.evidence,
                            at: new Date().toISOString(),
                          },
                        ],
                      },
                      "Enrollment saved as self-reported.",
                    )
                  )
                    setModal(null);
                  return "";
                } catch (e) {
                  return (e as Error).message;
                }
              }}
            />
          ) : (
            <UsageForm
              asOf={date}
              max={
                balance(modal.benefit, modal.card, store.usages, date)
                  ?.remaining ?? 0
              }
              onSubmit={(cents, serviceDate) => {
                try {
                  validateUsage(
                    cents,
                    serviceDate,
                    modal.benefit,
                    modal.card,
                    stateFor(store, modal.card.id, modal.benefit),
                    store.usages,
                    date,
                  );
                  if (
                    commit(
                      {
                        ...store,
                        usages: [
                          ...store.usages,
                          {
                            id: id(),
                            cardId: modal.card.id,
                            benefitId: modal.benefit.id,
                            revisionId: modal.benefit.revisionId,
                            cents,
                            date: serviceDate,
                            evidence: "self-reported",
                            recordedAt: new Date().toISOString(),
                          },
                        ],
                      },
                      "Demo usage recorded as self-reported.",
                    )
                  )
                    setModal(null);
                  return "";
                } catch (e) {
                  return (e as Error).message;
                }
              }}
            />
          )}
        </Modal>
      )}
      {resetOpen && (
        <Modal
          title="Start with a clean journal?"
          onClose={() => setResetOpen(false)}
        >
          <p>
            This permanently deletes the PERK demo data stored in this browser.
            Export it in Settings first if you want a copy.
          </p>
          <div className="button-group">
            <button
              className="button secondary"
              onClick={() => setResetOpen(false)}
            >
              Keep my journal
            </button>
            <button
              className="button primary"
              onClick={() => {
                try {
                  browserRepository.clear();
                  setStore(emptyStore());
                  setResetOpen(false);
                  setNotice("Demo data cleared.");
                  setError("");
                } catch {
                  setError(
                    "Could not clear browser storage. Try your browser’s site settings.",
                  );
                }
              }}
            >
              Delete demo data
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
function Empty({
  title,
  text,
  onAdd,
  onSample,
}: {
  title: string;
  text: string;
  onAdd: () => void;
  onSample?: () => void;
}) {
  return (
    <div className="empty-state">
      <Wallet size={32} strokeWidth={1} />
      <h2>{title}</h2>
      <p>{text}</p>
      <div className="button-group">
        <button className="button primary" onClick={onAdd}>
          <Plus size={16} />
          Add cards
        </button>
        {onSample && (
          <button className="button ghost" onClick={onSample}>
            Explore sample portfolio
          </button>
        )}
      </div>
    </div>
  );
}
function shiftMonth(month: string, n: number) {
  const d = new Date(month + "-15T12:00:00Z");
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.toISOString().slice(0, 7);
}
function calendarEvents(store: Store, month: string, asOf: string) {
  if (!month || !asOf) return [];
  const first = month + "-01",
    last = new Date(Date.UTC(+month.slice(0, 4), +month.slice(5), 0))
      .toISOString()
      .slice(0, 10),
    events: {
      id: string;
      title: string;
      date: string;
      href: string;
      category: string;
      product: string;
    }[] = [];
  for (const card of store.cards.filter((c) => !c.archived))
    for (const b of benefits) {
      const s = stateFor(store, card.id, b);
      if (!s.relevant || s.eligibility === "ineligible") continue;
      const p = periodFor(b, last, card.openedOn);
      if (
        p &&
        p.deadline >= first &&
        p.deadline <= last &&
        (!card.openedOn || p.deadline >= card.openedOn)
      )
        events.push({
          id: `${card.id}-${b.id}-${p.deadline}`,
          title: `${b.category} allowance expires`,
          date: p.deadline,
          href: detailLink(card, b),
          category: b.category,
          product: getProduct(card.productId).shortName,
        });
    }
  return events.sort(
    (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
  );
}
function CardForm({
  card,
  asOf,
  onSave,
}: {
  card: UserCard;
  asOf: string;
  onSave: (patch: Partial<UserCard>) => boolean;
}) {
  const [opened, setOpened] = useState(card.openedOn),
    [fee, setFee] = useState(
      card.annualFeeCents === null ? "" : String(card.annualFeeCents / 100),
    ),
    [error, setError] = useState("");
  return (
    <form
      className="card-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (opened && (!validDate(opened) || opened > asOf)) {
          setError("Choose a valid opening date on or before today.");
          return;
        }
        if (fee && (!/^\d+(\.\d{1,2})?$/.test(fee) || +fee > 10000)) {
          setError(
            "Enter an annual fee from $0 to $10,000, with at most two decimals.",
          );
          return;
        }
        setError("");
        onSave({
          openedOn: opened,
          annualFeeCents: fee === "" ? null : Math.round(+fee * 100),
        });
      }}
    >
      <label>
        Card opening date
        <input
          type="date"
          value={opened}
          max={asOf}
          onChange={(e) => setOpened(e.target.value)}
        />
        <small>Needed for anniversary scenarios.</small>
      </label>
      <label>
        Your annual fee (USD)
        <input
          inputMode="decimal"
          value={fee}
          placeholder="Unknown"
          onChange={(e) => setFee(e.target.value)}
        />
        <small>Self-reported. Leave blank if unknown.</small>
      </label>
      <button className="button secondary" type="submit">
        Save card details
      </button>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
    </form>
  );
}
function EnrollmentForm({
  current,
  onSubmit,
}: {
  current: Enrollment;
  onSubmit: (to: Enrollment, confirmed: boolean) => string;
}) {
  const [to, setTo] = useState<Enrollment>(current),
    [confirmed, setConfirmed] = useState(false),
    [error, setError] = useState("");
  return (
    <form
      className="dialog-form"
      onSubmit={(e) => {
        e.preventDefault();
        setError(onSubmit(to, confirmed));
      }}
    >
      <DemoLabel />
      <p>
        Review the fictional enrollment status. In a real account, confirm this
        in the issuer portal first. PERK cannot enroll you or verify this
        status.
      </p>
      <label>
        Enrollment status
        <select
          value={to}
          onChange={(e) => setTo(e.target.value as Enrollment)}
        >
          <option value="unknown">Unknown</option>
          <option value="not-enrolled">Not enrolled</option>
          <option value="enrolled">Enrolled (self-reported)</option>
        </select>
      </label>
      <label className="checkbox-label">
        <input
          required
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
        I explicitly confirm this fictional demo status.
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="button primary" type="submit">
        Save my confirmation <Check size={16} />
      </button>
    </form>
  );
}
function UsageForm({
  asOf,
  max,
  onSubmit,
}: {
  asOf: string;
  max: number;
  onSubmit: (cents: number, date: string) => string;
}) {
  const [amount, setAmount] = useState(""),
    [date, setDate] = useState(asOf),
    [error, setError] = useState("");
  return (
    <form
      className="dialog-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
          setError("Enter a dollar amount with at most two decimal places.");
          return;
        }
        setError(onSubmit(Math.round(+amount * 100), date));
      }}
    >
      <DemoLabel />
      <p>
        Record only a fictional credit received. This creates a self-reported
        entry, never issuer-confirmed evidence.
      </p>
      <label>
        Value received (USD)
        <input
          required
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
        />
        <small>Up to {money(max)} of demo allowance remains.</small>
      </label>
      <label>
        Service date
        <input
          type="date"
          required
          value={date}
          max={asOf}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>
      <label className="checkbox-label">
        <input required type="checkbox" />I confirm this is a fictional
        redemption I am reporting.
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="button primary" type="submit">
        Record self-reported value <Check size={16} />
      </button>
    </form>
  );
}
