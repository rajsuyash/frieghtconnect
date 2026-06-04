import { SignIn } from "@clerk/nextjs";

export const metadata = { title: "Sign in — Global Trade Collective" };

export default function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--color-canvas)] px-4 py-16">
      <SignIn />
    </div>
  );
}
