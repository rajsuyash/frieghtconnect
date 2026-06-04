import { prisma } from "@/lib/db";
import type { DirectoryFilter } from "@/lib/validation/forwarder";
import type { Prisma } from "@prisma/client";

// PUBLIC projections only. These selects are the trust boundary: they never
// include KYC documents, ownerUserId, reviewer notes, or rejection reasons.

export interface ForwarderSummary {
  id: string;
  slug: string;
  companyName: string;
  primaryCountry: string;
  countriesServed: number;
  modes: string[];
  services: string[];
  verified: boolean;
  logoUrl: string | null;
}

export interface ForwarderDetail extends Omit<ForwarderSummary, "countriesServed"> {
  yearEstablished: number | null;
  about: string | null;
  websiteUrl: string | null;
  countries: Array<{
    country: string;
    city: string | null;
    isHeadquarters: boolean;
    ports: string[];
  }>;
  lanes: Array<{ originCountry: string; destinationCountry: string }>;
}

export interface DirectoryResult {
  page: number;
  pageSize: number;
  total: number;
  results: ForwarderSummary[];
}

/** Build the Prisma `where` for the directory — approved-only, plus filters. */
function buildWhere(filter: DirectoryFilter): Prisma.ForwarderProfileWhereInput {
  const where: Prisma.ForwarderProfileWhereInput = { status: "approved" };

  if (filter.country) {
    where.OR = [
      { primaryCountry: filter.country },
      { countries: { some: { country: filter.country } } },
    ];
  }
  if (filter.mode) where.modes = { has: filter.mode };
  if (filter.service) where.services = { has: filter.service };
  if (filter.port) where.countries = { some: { ports: { has: filter.port } } };
  if (filter.originCountry || filter.destinationCountry) {
    where.lanes = {
      some: {
        ...(filter.originCountry ? { originCountry: filter.originCountry } : {}),
        ...(filter.destinationCountry
          ? { destinationCountry: filter.destinationCountry }
          : {}),
      },
    };
  }
  if (filter.q) {
    where.companyName = { contains: filter.q, mode: "insensitive" };
  }
  return where;
}

export async function queryForwarders(
  filter: DirectoryFilter,
): Promise<DirectoryResult> {
  const where = buildWhere(filter);
  const skip = (filter.page - 1) * filter.pageSize;

  const [total, rows] = await Promise.all([
    prisma.forwarderProfile.count({ where }),
    prisma.forwarderProfile.findMany({
      where,
      orderBy: [{ verified: "desc" }, { createdAt: "desc" }],
      skip,
      take: filter.pageSize,
      select: {
        id: true,
        slug: true,
        companyName: true,
        primaryCountry: true,
        modes: true,
        services: true,
        verified: true,
        logoUrl: true,
        _count: { select: { countries: true } },
      },
    }),
  ]);

  return {
    page: filter.page,
    pageSize: filter.pageSize,
    total,
    results: rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      companyName: r.companyName,
      primaryCountry: r.primaryCountry,
      countriesServed: r._count.countries,
      modes: r.modes,
      services: r.services,
      verified: r.verified,
      logoUrl: r.logoUrl,
    })),
  };
}

/** Public profile detail — only approved profiles resolve; KYC is never selected. */
export async function getForwarderBySlug(
  slug: string,
): Promise<ForwarderDetail | null> {
  const f = await prisma.forwarderProfile.findFirst({
    where: { slug, status: "approved" },
    select: {
      id: true,
      slug: true,
      companyName: true,
      primaryCountry: true,
      yearEstablished: true,
      about: true,
      websiteUrl: true,
      logoUrl: true,
      modes: true,
      services: true,
      verified: true,
      countries: {
        select: { country: true, city: true, isHeadquarters: true, ports: true },
        orderBy: { isHeadquarters: "desc" },
      },
      lanes: { select: { originCountry: true, destinationCountry: true } },
    },
  });
  return f;
}
