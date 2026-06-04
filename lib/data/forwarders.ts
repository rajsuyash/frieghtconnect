// Mock data for the marketing surface. Real data arrives from /api/forwarders
// once the directory backend (PRD F1) is built. Brand names are invented.

export type Mode = "Sea FCL" | "Sea LCL" | "Air" | "Rail" | "Road";

export interface FeaturedForwarder {
  slug: string;
  company: string;
  primaryCountry: string;
  countryCode: string;
  countriesServed: number;
  modes: Mode[];
  topService: string;
  yearsActive: number;
  verified: boolean;
}

export const FEATURED_FORWARDERS: FeaturedForwarder[] = [
  {
    slug: "hanseatic-bridge-logistik",
    company: "Hanseatic Bridge Logistik",
    primaryCountry: "Germany",
    countryCode: "DE",
    countriesServed: 7,
    modes: ["Sea FCL", "Sea LCL", "Air"],
    topService: "EU customs clearance",
    yearsActive: 16,
    verified: true,
  },
  {
    slug: "meridian-shipping-rotterdam",
    company: "Meridian Shipping Rotterdam",
    primaryCountry: "Netherlands",
    countryCode: "NL",
    countriesServed: 5,
    modes: ["Sea FCL", "Rail"],
    topService: "Reefer & cold chain",
    yearsActive: 22,
    verified: true,
  },
  {
    slug: "kestrel-air-cargo-singapore",
    company: "Kestrel Air Cargo",
    primaryCountry: "Singapore",
    countryCode: "SG",
    countriesServed: 11,
    modes: ["Air", "Sea LCL"],
    topService: "Time-critical air freight",
    yearsActive: 9,
    verified: true,
  },
  {
    slug: "andes-forwarding-callao",
    company: "Andes Forwarding Callao",
    primaryCountry: "Peru",
    countryCode: "PE",
    countriesServed: 4,
    modes: ["Sea FCL", "Road"],
    topService: "Project & breakbulk cargo",
    yearsActive: 13,
    verified: true,
  },
  {
    slug: "polaris-freight-yantian",
    company: "Polaris Freight Yantian",
    primaryCountry: "China",
    countryCode: "CN",
    countriesServed: 9,
    modes: ["Sea FCL", "Sea LCL", "Air"],
    topService: "Origin consolidation",
    yearsActive: 18,
    verified: true,
  },
  {
    slug: "cedar-line-logistics-jebel-ali",
    company: "Cedar Line Logistics",
    primaryCountry: "United Arab Emirates",
    countryCode: "AE",
    countriesServed: 6,
    modes: ["Sea FCL", "Air", "Road"],
    topService: "Dangerous goods handling",
    yearsActive: 11,
    verified: true,
  },
];

// Popular search suggestions surfaced under the hero search bar.
export const POPULAR_SEARCHES = [
  "Germany · Sea FCL",
  "China to Europe",
  "Air freight · Singapore",
  "Customs clearance · Netherlands",
  "Reefer · Rotterdam",
];

export const FILTER_MODES: Mode[] = ["Sea FCL", "Sea LCL", "Air", "Rail", "Road"];
