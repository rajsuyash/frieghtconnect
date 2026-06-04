import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

// `isVerified` (not `emailVerified`) to avoid clashing with next-auth's own
// `emailVerified: Date` on the base User/JWT interfaces.
declare module "next-auth" {
  interface User {
    role: Role;
    isVerified: boolean;
  }
  interface Session {
    user: {
      id: string;
      role: Role;
      isVerified: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid: string;
    role: Role;
    isVerified: boolean;
  }
}

// Auth.js v5 resolves the JWT type from @auth/core/jwt — augment it too.
declare module "@auth/core/jwt" {
  interface JWT {
    uid: string;
    role: Role;
    isVerified: boolean;
  }
}
