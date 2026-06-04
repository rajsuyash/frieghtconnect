import Link from "next/link";
import {
  CaretLeft,
  Tray,
  EnvelopeSimple,
  Path,
} from "@phosphor-icons/react/dist/ssr";
import { getCurrentUser } from "@/lib/auth/guards";
import { getMyInquiries } from "@/lib/dashboard/queries";
import { modeLabel } from "@/lib/taxonomy";
import { countryLabel } from "@/lib/geo";

export const metadata = { title: "Inquiries — FreightConnect" };

function laneLabel(o?: string | null, op?: string | null, d?: string | null, dp?: string | null) {
  if (!o && !d) return null;
  const left = `${o ? countryLabel(o) : "?"}${op ? ` (${op})` : ""}`;
  const right = `${d ? countryLabel(d) : "?"}${dp ? ` (${dp})` : ""}`;
  return { left, right };
}

// Per-request data (DB + session) — never prerender at build.
export const dynamic = "force-dynamic";

export default async function InquiriesPage() {
  const user = await getCurrentUser();
  const inquiries = user?.role === "forwarder" ? await getMyInquiries(user.id) : [];

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)]">
        <CaretLeft size={14} weight="bold" />
        Dashboard
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--color-ink)]">Inquiries</h1>
      <p className="mt-2 text-[var(--color-muted)]">
        {inquiries.length} {inquiries.length === 1 ? "inquiry" : "inquiries"}. Reply
        directly to the shipper&apos;s email.
      </p>

      {inquiries.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-[var(--color-line)] bg-white py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-canvas)] text-[var(--color-faint)]">
            <Tray size={26} />
          </span>
          <h2 className="mt-5 text-lg font-semibold text-[var(--color-ink)]">No inquiries yet</h2>
          <p className="mt-1 max-w-sm text-sm text-[var(--color-muted)]">
            When shippers contact you from your profile, their requests show up here.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {inquiries.map((i) => {
            const lane = laneLabel(i.originCountry, i.originPort, i.destinationCountry, i.destinationPort);
            return (
              <li key={i.id} className="rounded-2xl border border-[var(--color-line)] bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-[var(--color-ink)]">
                      {i.shipperName}
                      {i.shipperCompany && (
                        <span className="font-normal text-[var(--color-muted)]"> · {i.shipperCompany}</span>
                      )}
                    </div>
                    <div className="text-sm text-[var(--color-faint)]">
                      {new Date(i.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                    </div>
                  </div>
                  <a href={`mailto:${i.shipperEmail}`} className="flex items-center gap-1.5 rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-strong)]">
                    <EnvelopeSimple size={15} weight="fill" />
                    Reply
                  </a>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--color-muted)]">
                  {lane && (
                    <span className="flex items-center gap-2">
                      {lane.left}
                      <Path size={13} className="text-[var(--color-accent)]" />
                      {lane.right}
                    </span>
                  )}
                  {i.mode && <span>Mode: {modeLabel(i.mode)}</span>}
                  {i.cargoType && <span>Cargo: {i.cargoType}</span>}
                </div>

                <p className="mt-3 whitespace-pre-wrap rounded-xl bg-[var(--color-canvas)] px-4 py-3 text-sm text-[var(--color-ink)]">
                  {i.message}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
