import { modeLabel } from "@/lib/taxonomy";
import { countryLabel } from "@/lib/geo";

export interface InquiryNotificationFields {
  shipperName: string;
  shipperEmail: string;
  shipperCompany?: string | null;
  originCountry?: string | null;
  originPort?: string | null;
  destinationCountry?: string | null;
  destinationPort?: string | null;
  mode?: string | null;
  cargoType?: string | null;
  message: string;
}

/** Forwarder-facing notification body for a new inquiry. */
export function inquiryNotificationText(
  inquiry: InquiryNotificationFields,
  company: string,
): string {
  const lane =
    inquiry.originCountry || inquiry.destinationCountry
      ? `${countryLabel(inquiry.originCountry ?? "?")}${inquiry.originPort ? ` (${inquiry.originPort})` : ""} -> ${countryLabel(inquiry.destinationCountry ?? "?")}${inquiry.destinationPort ? ` (${inquiry.destinationPort})` : ""}`
      : "Not specified";
  return [
    `New inquiry for ${company} via Global Trade Collective.`,
    "",
    `From: ${inquiry.shipperName}${inquiry.shipperCompany ? `, ${inquiry.shipperCompany}` : ""}`,
    `Reply to: ${inquiry.shipperEmail}`,
    `Lane: ${lane}`,
    `Mode: ${inquiry.mode ? modeLabel(inquiry.mode) : "Any"}`,
    `Cargo: ${inquiry.cargoType ?? "Not specified"}`,
    "",
    "Message:",
    inquiry.message,
  ].join("\n");
}

export function inquiryNotificationSubject(company: string): string {
  return `New shipping inquiry — ${company}`;
}
