import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { MODES, SERVICES } from "../lib/taxonomy";
import { slugify } from "../lib/forwarders/slug";

const prisma = new PrismaClient();

const COUNTRIES: Array<[string, string]> = [
  ["DE", "Germany"],
  ["NL", "Netherlands"],
  ["SG", "Singapore"],
  ["US", "United States"],
  ["AE", "United Arab Emirates"],
  ["CN", "China"],
  ["PE", "Peru"],
  ["BR", "Brazil"],
  ["IN", "India"],
  ["GB", "United Kingdom"],
  ["JP", "Japan"],
  ["FR", "France"],
];

const PORTS: Array<[string, string, string]> = [
  ["DEHAM", "Hamburg", "DE"],
  ["NLRTM", "Rotterdam", "NL"],
  ["SGSIN", "Singapore", "SG"],
  ["USLAX", "Los Angeles", "US"],
  ["AEJEA", "Jebel Ali", "AE"],
  ["CNSHA", "Shanghai", "CN"],
  ["PECLL", "Callao", "PE"],
  ["BRSSZ", "Santos", "BR"],
  ["INNSA", "Nhava Sheva", "IN"],
  ["JPTYO", "Tokyo", "JP"],
];

interface SeedForwarder {
  company: string;
  country: string;
  city: string;
  port: string;
  modes: string[];
  services: string[];
  year: number;
  lanes: Array<[string, string]>;
}

const FORWARDERS: SeedForwarder[] = [
  { company: "Hanseatic Bridge Logistik", country: "DE", city: "Hamburg", port: "DEHAM", modes: ["sea_fcl", "sea_lcl", "air"], services: ["customs_clearance", "warehousing"], year: 2009, lanes: [["CN", "DE"], ["US", "DE"]] },
  { company: "Meridian Shipping Rotterdam", country: "NL", city: "Rotterdam", port: "NLRTM", modes: ["sea_fcl", "rail"], services: ["reefer", "consolidation"], year: 2004, lanes: [["CN", "NL"], ["BR", "NL"]] },
  { company: "Kestrel Air Cargo", country: "SG", city: "Singapore", port: "SGSIN", modes: ["air", "sea_lcl"], services: ["dangerous_goods", "consolidation"], year: 2017, lanes: [["SG", "US"], ["SG", "DE"]] },
  { company: "Andes Forwarding Callao", country: "PE", city: "Callao", port: "PECLL", modes: ["sea_fcl", "road"], services: ["project_cargo"], year: 2013, lanes: [["PE", "US"], ["PE", "CN"]] },
  { company: "Polaris Freight Yantian", country: "CN", city: "Shenzhen", port: "CNSHA", modes: ["sea_fcl", "sea_lcl", "air"], services: ["consolidation", "warehousing"], year: 2008, lanes: [["CN", "DE"], ["CN", "US"]] },
  { company: "Cedar Line Logistics", country: "AE", city: "Dubai", port: "AEJEA", modes: ["sea_fcl", "air", "road"], services: ["dangerous_goods", "customs_clearance"], year: 2015, lanes: [["AE", "IN"], ["AE", "GB"]] },
  { company: "Atlantic Gate Forwarding", country: "US", city: "Los Angeles", port: "USLAX", modes: ["sea_fcl", "road"], services: ["warehousing", "customs_clearance"], year: 2006, lanes: [["CN", "US"], ["JP", "US"]] },
  { company: "Verde Cargo Santos", country: "BR", city: "Santos", port: "BRSSZ", modes: ["sea_fcl", "sea_lcl"], services: ["reefer", "project_cargo"], year: 2011, lanes: [["BR", "NL"], ["BR", "CN"]] },
  { company: "Indus Reach Logistics", country: "IN", city: "Mumbai", port: "INNSA", modes: ["sea_fcl", "air"], services: ["customs_clearance", "consolidation"], year: 2012, lanes: [["IN", "AE"], ["IN", "GB"]] },
  { company: "Albion Freight Partners", country: "GB", city: "Felixstowe", port: "DEHAM", modes: ["sea_fcl", "road"], services: ["warehousing"], year: 2003, lanes: [["GB", "DE"], ["GB", "US"]] },
  { company: "Sakura Logistics Tokyo", country: "JP", city: "Tokyo", port: "JPTYO", modes: ["sea_fcl", "air"], services: ["reefer", "dangerous_goods"], year: 2010, lanes: [["JP", "US"], ["JP", "NL"]] },
  { company: "Loire Valley Forwarding", country: "FR", city: "Le Havre", port: "NLRTM", modes: ["sea_lcl", "road", "rail"], services: ["consolidation", "customs_clearance"], year: 2014, lanes: [["FR", "US"], ["FR", "CN"]] },
];

const SEED_PASSWORD_HASH = "seed-account-no-login";

async function main() {
  // Taxonomy
  for (const [code, label] of COUNTRIES) {
    await prisma.country.upsert({ where: { code }, update: { label }, create: { code, label } });
  }
  for (const [code, label, countryCode] of PORTS) {
    await prisma.port.upsert({ where: { code }, update: { label, countryCode }, create: { code, label, countryCode } });
  }
  for (const m of MODES) {
    await prisma.mode.upsert({ where: { code: m.code }, update: { label: m.label }, create: { code: m.code, label: m.label } });
  }
  for (const s of SERVICES) {
    await prisma.service.upsert({ where: { code: s.code }, update: { label: s.label }, create: { code: s.code, label: s.label } });
  }

  // Approved forwarders (each with an owner account)
  for (const f of FORWARDERS) {
    const slug = slugify(f.company, f.country);
    const email = `${slug}@seed.freightconnect.example`;

    const owner = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, passwordHash: SEED_PASSWORD_HASH, role: "forwarder", emailVerified: true },
    });

    await prisma.forwarderProfile.upsert({
      where: { slug },
      update: {},
      create: {
        ownerUserId: owner.id,
        slug,
        companyName: f.company,
        primaryCountry: f.country,
        yearEstablished: f.year,
        status: "approved",
        verified: true,
        modes: f.modes,
        services: f.services,
        countries: {
          create: [{ country: f.country, city: f.city, isHeadquarters: true, ports: [f.port] }],
        },
        lanes: {
          create: f.lanes.map(([originCountry, destinationCountry]) => ({ originCountry, destinationCountry })),
        },
      },
    });
  }

  const count = await prisma.forwarderProfile.count({ where: { status: "approved" } });
  console.info(`Seed complete: ${count} approved forwarders.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
