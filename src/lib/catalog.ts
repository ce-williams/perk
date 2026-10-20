import type { Benefit, CardProduct } from "./types";
// Product identities only. No issuer benefit terms, fees, eligibility or values are asserted.
export const catalog: CardProduct[] = [
  {
    id: "amex-platinum",
    issuer: "American Express",
    name: "The Platinum Card",
    shortName: "Platinum",
    color: "#d8dbd9",
    ink: "#253f3a",
    officialUrl: "https://www.americanexpress.com/",
  },
  {
    id: "chase-reserve",
    issuer: "Chase",
    name: "Sapphire Reserve",
    shortName: "Sapphire Reserve",
    color: "#223b50",
    ink: "#f4f3e9",
    officialUrl: "https://www.chase.com/",
  },
  {
    id: "capital-venture-x",
    issuer: "Capital One",
    name: "Venture X",
    shortName: "Venture X",
    color: "#334b69",
    ink: "#f4f3e9",
    officialUrl: "https://www.capitalone.com/",
  },
  {
    id: "amex-gold",
    issuer: "American Express",
    name: "American Express Gold Card",
    shortName: "Gold Card",
    color: "#bba16e",
    ink: "#292b26",
    officialUrl: "https://www.americanexpress.com/",
  },
  {
    id: "chase-preferred",
    issuer: "Chase",
    name: "Sapphire Preferred",
    shortName: "Sapphire Preferred",
    color: "#43607b",
    ink: "#fffef9",
    officialUrl: "https://www.chase.com/",
  },
  {
    id: "chase-freedom",
    issuer: "Chase",
    name: "Freedom Unlimited",
    shortName: "Freedom Unlimited",
    color: "#789597",
    ink: "#142c2a",
    officialUrl: "https://www.chase.com/",
  },
  {
    id: "capital-venture",
    issuer: "Capital One",
    name: "Venture Rewards",
    shortName: "Venture",
    color: "#4c5c66",
    ink: "#fffef9",
    officialUrl: "https://www.capitalone.com/",
  },
  {
    id: "capital-savor",
    issuer: "Capital One",
    name: "Savor",
    shortName: "Savor",
    color: "#b86c42",
    ink: "#fffef9",
    officialUrl: "https://www.capitalone.com/",
  },
  {
    id: "citi-strata",
    issuer: "Citi",
    name: "Strata Premier",
    shortName: "Strata Premier",
    color: "#4e657c",
    ink: "#fffef9",
    officialUrl: "https://www.citi.com/",
  },
  {
    id: "citi-double",
    issuer: "Citi",
    name: "Double Cash",
    shortName: "Double Cash",
    color: "#455e80",
    ink: "#fffef9",
    officialUrl: "https://www.citi.com/",
  },
  {
    id: "discover-it",
    issuer: "Discover",
    name: "Discover it Cash Back",
    shortName: "Discover it",
    color: "#c5a67a",
    ink: "#302f29",
    officialUrl: "https://www.discover.com/",
  },
  {
    id: "amex-blue",
    issuer: "American Express",
    name: "Blue Cash Preferred",
    shortName: "Blue Cash Preferred",
    color: "#586c8b",
    ink: "#fffef9",
    officialUrl: "https://www.americanexpress.com/",
  },
];
// Deliberately generic, identical fictional scenarios for every card. Never production terms.
export const benefits: Benefit[] = [
  {
    id: "dining",
    revisionId: "demo-dining-v1",
    title: "A meal worth remembering",
    category: "Dining",
    capCents: 2500,
    cadence: "monthly",
    requiresEnrollment: true,
    provenance: "demo",
    instructions:
      "Fictional scenario: check the enrollment requirement, then use your selected card at a qualifying restaurant. No real merchant or issuer eligibility is implied.",
    verification:
      "In a live catalog, check the issuer enrollment status and posted statement credit. In this demo, explicitly confirm enrollment and record a fictional redemption.",
  },
  {
    id: "travel",
    revisionId: "demo-travel-v1",
    title: "A little further, for a little less",
    category: "Travel",
    capCents: 12000,
    cadence: "calendar-year",
    requiresEnrollment: false,
    provenance: "demo",
    instructions:
      "Fictional scenario: review the qualifying travel categories before booking. Record only the value actually received, not the full purchase amount.",
    verification:
      "In a live catalog, compare the eligible charge with the posted credit. This demo accepts your explicit self-report only.",
  },
  {
    id: "wellbeing",
    revisionId: "demo-wellbeing-v1",
    title: "Make room for yourself",
    category: "Wellbeing",
    capCents: 4500,
    cadence: "quarterly",
    requiresEnrollment: true,
    provenance: "demo",
    instructions:
      "Fictional scenario: review enrollment before using a wellbeing service. These amounts, categories and rules are invented for testing.",
    verification:
      "Check enrollment independently, then confirm here. A link click never confirms a benefit or its use.",
  },
  {
    id: "anniversary",
    revisionId: "demo-anniversary-v1",
    title: "Something to mark the year",
    category: "Anniversary",
    capCents: 8000,
    cadence: "anniversary",
    requiresEnrollment: false,
    provenance: "demo",
    instructions:
      "Fictional scenario: add the card opening date to calculate an anniversary-based period. The sample allowance does not carry over.",
    verification:
      "In production, check the actual anniversary and terms in the issuer account. Dates here follow the opening date you enter.",
  },
];
export const getProduct = (id: string) => catalog.find((c) => c.id === id)!;
export const getBenefit = (id: string) => benefits.find((b) => b.id === id)!;
export const cadenceLabel = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  "calendar-year": "Calendar year",
  anniversary: "Card anniversary",
};
