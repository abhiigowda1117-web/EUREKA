import { Benefits } from "@/components/landing/benefits";
import { Categories } from "@/components/landing/categories";
import { Faq } from "@/components/landing/faq";
import { FeaturedProjects } from "@/components/landing/featured-projects";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PlatformStats } from "@/components/landing/stats";
import { Testimonials } from "@/components/landing/testimonials";
import { WhyForge } from "@/components/landing/why-forge";
import { getCategories, getOpenProjects, getPlatformStats } from "@/lib/queries/public";

export default async function HomePage() {
  // Fetch in parallel. All three are real database reads.
  const [categories, projects, stats] = await Promise.all([getCategories(), getOpenProjects(6), getPlatformStats()]);

  return (
    <>
      <Hero />
      <HowItWorks />
      <Categories categories={categories} />
      <FeaturedProjects projects={projects} />
      <WhyForge />
      <Benefits />
      <PlatformStats stats={stats} categories={categories.length} />
      <Testimonials />
      <Faq />
      <FinalCta />
    </>
  );
}
