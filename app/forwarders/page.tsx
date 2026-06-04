import { Suspense } from "react";
import Link from "next/link";
import { CaretLeft, CaretRight, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { directoryFilterSchema } from "@/lib/validation/forwarder";
import { queryForwarders } from "@/lib/forwarders/repository";
import { FilterBar } from "@/components/forwarders/filter-bar";
import { ForwarderCard } from "@/components/forwarders/forwarder-card";

export const metadata = {
  title: "Forwarder directory — FreightConnect",
  description: "Search verified freight forwarders by country, mode, and service.",
};

type SP = Record<string, string | string[] | undefined>;

function pageHref(sp: SP, page: number): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string" && k !== "page") params.set(k, v);
  }
  params.set("page", String(page));
  return `/forwarders?${params.toString()}`;
}

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  // Invalid filter values are ignored gracefully (F1): fall back to defaults.
  const parsed = directoryFilterSchema.safeParse(sp);
  const filter = parsed.success ? parsed.data : directoryFilterSchema.parse({});
  const data = await queryForwarders(filter);
  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-ink)] md:text-4xl">
          Verified freight forwarders
        </h1>
        <p className="mt-2 text-[var(--color-muted)]">
          {data.total} {data.total === 1 ? "agent" : "agents"} match your search.
          Every one cleared a document-based verification.
        </p>
      </div>

      <div className="mt-6">
        <Suspense fallback={<div className="h-20" />}>
          <FilterBar
            initial={{
              q: typeof sp.q === "string" ? sp.q : undefined,
              country: typeof sp.country === "string" ? sp.country : undefined,
              mode: typeof sp.mode === "string" ? sp.mode : undefined,
              service: typeof sp.service === "string" ? sp.service : undefined,
            }}
          />
        </Suspense>
      </div>

      {data.results.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-line)] bg-white py-20 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-canvas)] text-[var(--color-faint)]">
            <MagnifyingGlass size={26} />
          </span>
          <h2 className="mt-5 text-lg font-semibold text-[var(--color-ink)]">
            No forwarders match these filters
          </h2>
          <p className="mt-1 max-w-sm text-sm text-[var(--color-muted)]">
            Try widening your search, or clear a filter to see more verified
            agents.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.results.map((f) => (
            <ForwarderCard key={f.slug} f={f} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-2">
          {data.page > 1 && (
            <Link
              href={pageHref(sp, data.page - 1)}
              className="flex h-10 items-center gap-1 rounded-full border border-[var(--color-line)] bg-white px-4 text-sm font-medium text-[var(--color-navy)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              <CaretLeft size={14} weight="bold" />
              Previous
            </Link>
          )}
          <span className="px-3 text-sm text-[var(--color-muted)]">
            Page {data.page} of {totalPages}
          </span>
          {data.page < totalPages && (
            <Link
              href={pageHref(sp, data.page + 1)}
              className="flex h-10 items-center gap-1 rounded-full border border-[var(--color-line)] bg-white px-4 text-sm font-medium text-[var(--color-navy)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              Next
              <CaretRight size={14} weight="bold" />
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}
