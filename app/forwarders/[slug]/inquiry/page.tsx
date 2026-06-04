import { notFound } from "next/navigation";
import Link from "next/link";
import { CaretLeft, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { Monogram } from "@/components/brand/monogram";
import { InquiryForm } from "@/components/forwarders/inquiry-form";
import { getForwarderBySlug } from "@/lib/forwarders/repository";
import { countryLabel } from "@/lib/geo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const f = await getForwarderBySlug(slug);
  return { title: f ? `Send an inquiry to ${f.companyName}` : "Inquiry — FreightConnect" };
}

export default async function InquiryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
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
            Send an inquiry
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-[var(--color-muted)]">
            To {f.companyName}, {countryLabel(f.primaryCountry)}
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
        Share your lane and cargo once. {f.companyName} receives the details and
        replies with a quote directly to your email. No account needed.
      </p>

      <div className="mt-6">
        <InquiryForm slug={f.slug} company={f.companyName} />
      </div>
    </main>
  );
}
