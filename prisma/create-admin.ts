import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth/password";

// Admin accounts are provisioned manually (no public signup).
// Usage: ADMIN_EMAIL=you@x.com ADMIN_PASSWORD=secret pnpm create:admin
const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@freightconnect.local";
  const password = process.env.ADMIN_PASSWORD || "admin12345";
  const passwordHash = await hashPassword(password);
  await prisma.user.upsert({
    where: { email },
    update: { role: "admin", emailVerified: true, passwordHash },
    create: { email, passwordHash, role: "admin", emailVerified: true },
  });
  console.info(`Admin ready: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
