// Country + port reference for filter options and display labels.
// Matches the seed taxonomy; expand as coverage grows.

export const COUNTRIES: Array<{ code: string; label: string }> = [
  { code: "DE", label: "Germany" },
  { code: "NL", label: "Netherlands" },
  { code: "SG", label: "Singapore" },
  { code: "US", label: "United States" },
  { code: "AE", label: "United Arab Emirates" },
  { code: "CN", label: "China" },
  { code: "PE", label: "Peru" },
  { code: "BR", label: "Brazil" },
  { code: "IN", label: "India" },
  { code: "GB", label: "United Kingdom" },
  { code: "JP", label: "Japan" },
  { code: "FR", label: "France" },
];

const COUNTRY_LABELS = new Map(COUNTRIES.map((c) => [c.code, c.label]));

export function countryLabel(code: string): string {
  return COUNTRY_LABELS.get(code) ?? code;
}
