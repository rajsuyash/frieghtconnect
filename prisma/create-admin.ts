import "dotenv/config";
import { PrismaClient } from "@prisma/client";

// Mark an email as admin. Auth itself is handled by Clerk — when this person
// signs in via Clerk with this email, syncCurrentUser() links their clerkId
// to this row and they get the admin role.
// Usage: ADMIN_EMAIL=you@x.com pnpm create:admin
const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@freightconnect.local";
  await prisma.user.upsert({
    where: { email },
    update: { role: "admin", emailVerified: true },
    create: { email, role: "admin", emailVerified: true },
  });
  console.info(`Admin marked: ${email}. Sign in via Clerk with this email to activate.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
