// Canonical reference taxonomy. Codes are the source of truth used by the
// directory filters, Zod validation, the seed, and the UI labels.

export const MODES = [
  { code: "sea_fcl", label: "Sea FCL" },
  { code: "sea_lcl", label: "Sea LCL" },
  { code: "air", label: "Air" },
  { code: "rail", label: "Rail" },
  { code: "road", label: "Road" },
  { code: "intermodal", label: "Intermodal" },
] as const;

export const SERVICES = [
  { code: "customs_clearance", label: "Customs clearance" },
  { code: "warehousing", label: "Warehousing" },
  { code: "project_cargo", label: "Project cargo" },
  { code: "reefer", label: "Reefer & cold chain" },
  { code: "dangerous_goods", label: "Dangerous goods" },
  { code: "consolidation", label: "Consolidation" },
] as const;

export const MODE_CODES = MODES.map((m) => m.code);
export const SERVICE_CODES = SERVICES.map((s) => s.code);

const MODE_LABELS = new Map<string, string>(MODES.map((m) => [m.code, m.label]));
const SERVICE_LABELS = new Map<string, string>(
  SERVICES.map((s) => [s.code, s.label]),
);

export function modeLabel(code: string): string {
  return MODE_LABELS.get(code) ?? code;
}

export function serviceLabel(code: string): string {
  return SERVICE_LABELS.get(code) ?? code;
}

export function isModeCode(code: string): boolean {
  return MODE_LABELS.has(code);
}

export function isServiceCode(code: string): boolean {
  return SERVICE_LABELS.has(code);
}
