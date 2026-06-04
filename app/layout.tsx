import {ClerkProvider} from "@clerk/nextjs";
import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Global Trade Collective — Find verified freight forwarders, anywhere",
  description:
    "Search verified freight-forwarding agents by country, trade lane, and service. Send a structured inquiry in minutes. No membership fees.",
  openGraph: {
    title: "Global Trade Collective — Find verified freight forwarders, anywhere",
    description:
      "Search verified freight-forwarding agents by country, trade lane, and service.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${outfit.variable} ${jakarta.variable}`}>
      <body className="min-h-[100dvh] antialiased">
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#0369a1",
              colorText: "#0F172A",
              borderRadius: "0.75rem",
              fontFamily: "var(--font-jakarta), system-ui, sans-serif",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}