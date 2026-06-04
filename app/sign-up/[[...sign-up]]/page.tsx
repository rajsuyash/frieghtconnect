import { SignUp } from "@clerk/nextjs";

export const metadata = { title: "Sign up — Global Trade Collective" };

export default function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--color-canvas)] px-4 py-16">
      <SignUp />
    </div>
  );
}
