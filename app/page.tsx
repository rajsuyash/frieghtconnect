import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { TrustStrip } from "@/components/site/trust-strip";
import { HowItWorks } from "@/components/site/how-it-works";
import { FeaturedForwarders } from "@/components/site/featured-forwarders";
import { BecomeForwarder } from "@/components/site/become-forwarder";
import { Footer } from "@/components/site/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <HowItWorks />
        <FeaturedForwarders />
        <BecomeForwarder />
      </main>
      <Footer />
    </>
  );
}
