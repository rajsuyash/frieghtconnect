import { notFound } from "next/navigation";
import Link from "next/link";
import { CaretLeft, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { Monogram } from "@/components/brand/monogram";
import { ReviewForm } from "@/components/forwarders/review-form";
import { getForwarderBySlug } from "@/lib/forwarders/repository";
import { countryLabel } from "@/lib/geo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const f = await getForwarderBySlug(slug);
  return { title: f ? `Review ${f.companyName}` : "Review — Global Trade Collective" };
}

// Per-request data (DB) — never prerender at build.
export const dynamic = "force-dynamic";

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ inquiry?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const f = await getForwarderBySlug(slug);
  if (!f) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href={`/forwarders/${f.slug}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)]"
      >
        <CaretLeft size={14} weight="bold" />
        Back to {f.companyName}
      </Link>

      <div className="mt-6 flex items-center gap-4">
        <Monogram name={f.companyName} size={56} />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)]">
            Rate your experience
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-[var(--color-muted)]">
            With {f.companyName}, {countryLabel(f.primaryCountry)}
            {f.verified && (
              <Badge variant="verified">
                <ShieldCheck size={12} weight="fill" />
                Verified
              </Badge>
            )}
          </p>
        </div>
      </div>

      <p className="mt-5 max-w-xl text-sm text-[var(--color-muted)]">
        Reviews are tied to a real inquiry — enter the inquiry reference from
        your confirmation and the email you used. Your review is checked by our
        team before it goes live.
      </p>

      <div className="mt-6">
        <ReviewForm
          slug={f.slug}
          company={f.companyName}
          initialInquiryId={typeof sp.inquiry === "string" ? sp.inquiry : undefined}
        />
      </div>
    </main>
  );
}
