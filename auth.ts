import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Role } from "@prisma/client";
import { verifyCredentials } from "@/lib/auth/credentials";
import { loginSchema } from "@/lib/validation/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Required behind a reverse proxy (Railway) — Auth.js v5 otherwise rejects the
  // request host and returns a "server configuration" error on sign-in.
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (raw) => {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        return verifyCredentials(parsed.data.email, parsed.data.password);
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.uid = user.id ?? "";
        token.role = user.role;
        token.isVerified = user.isVerified;
      }
      return token;
    },
    session({ session, token }) {
      // token values are written by the jwt callback above; cast on read.
      session.user.id = token.uid as string;
      session.user.role = token.role as Role;
      session.user.isVerified = token.isVerified as boolean;
      return session;
    },
  },
});
