import { prisma } from "@/lib/db";

// All dashboard reads are scoped to the authenticated owner's forwarder. The
// owner id comes from the session — never from a client-supplied id — so a
// forwarder can only ever see their own profile and inquiries (PRD F7 AC4).

export async function getMyForwarder(ownerUserId: string) {
  return prisma.forwarderProfile.findUnique({
    where: { ownerUserId },
    select: {
      id: true,
      slug: true,
      companyName: true,
      primaryCountry: true,
      status: true,
      verified: true,
      about: true,
      rejectionReason: true,
      _count: { select: { documents: true, countries: true, inquiries: true } },
    },
  });
}

export interface InquiryRow {
  id: string;
  shipperName: string;
  shipperEmail: string;
  shipperCompany: string | null;
  originCountry: string | null;
  originPort: string | null;
  destinationCountry: string | null;
  destinationPort: string | null;
  mode: string | null;
  cargoType: string | null;
  message: string;
  createdAt: Date;
}

export async function getMyInquiries(ownerUserId: string): Promise<InquiryRow[]> {
  const forwarder = await prisma.forwarderProfile.findUnique({
    where: { ownerUserId },
    select: { id: true },
  });
  if (!forwarder) return [];
  return prisma.inquiry.findMany({
    where: { forwarderId: forwarder.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      shipperName: true,
      shipperEmail: true,
      shipperCompany: true,
      originCountry: true,
      originPort: true,
      destinationCountry: true,
      destinationPort: true,
      mode: true,
      cargoType: true,
      message: true,
      createdAt: true,
    },
  });
}
