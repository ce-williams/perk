export type Evidence = "confirmed" | "self-reported" | "estimated" | "unknown";
export type Cadence = "monthly" | "quarterly" | "calendar-year" | "anniversary";
export type Enrollment =
  "unknown" | "not-enrolled" | "enrolled" | "not-required";
export type Eligibility = "unknown" | "eligible" | "ineligible";
export type CardProduct = {
  id: string;
  issuer: string;
  name: string;
  shortName: string;
  color: string;
  ink: string;
  officialUrl: string;
  publishedBenefits?: {
    reviewedOn: string;
    sourceUrl: string;
    guideUrl: string;
    items: { title: string; description: string }[];
  };
};
export type Benefit = {
  id: string;
  revisionId: string;
  title: string;
  category: string;
  capCents: number;
  cadence: Cadence;
  requiresEnrollment: boolean;
  provenance: "demo";
  instructions: string;
  verification: string;
};
export type UserCard = {
  id: string;
  productId: string;
  openedOn: string;
  annualFeeCents: number | null;
  archived: boolean;
};
export type BenefitState = {
  enrollment: Enrollment;
  eligibility: Eligibility;
  relevant: boolean;
  evidence: Evidence;
};
export type Usage = {
  id: string;
  cardId: string;
  benefitId: string;
  revisionId: string;
  cents: number;
  date: string;
  evidence: Evidence;
  recordedAt: string;
  reverses?: string;
};
export type EnrollmentEvent = {
  id: string;
  cardId: string;
  benefitId: string;
  from: Enrollment;
  to: Enrollment;
  evidence: Evidence;
  at: string;
};
export type Store = {
  version: 1;
  cards: UserCard[];
  states: Record<string, BenefitState>;
  usages: Usage[];
  events: EnrollmentEvent[];
  preferences: {
    calendarReminders: boolean;
    leadDays: number;
    timezone: string;
  };
};
