import { Categories } from "@/components/landing/categories";
import { FeaturedProjects } from "@/components/landing/featured-projects";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Mission } from "@/components/landing/mission";
import { getCategories, getOpenProjects } from "@/lib/queries/public";

// Kept deliberately short: what EUREKA is, why it matters, how it works, what's available.
// (Benefits, stats, testimonials and FAQ sections still exist in components/landing if we want them back.)
export default async function HomePage() {
  const [categories, projects] = await Promise.all([getCategories(), getOpenProjects(6)]);
  return (
    <>
      <Hero />
      <Mission />
      <HowItWorks />
      <FeaturedProjects projects={projects} />
      <Categories categories={categories} />
      <FinalCta />
    </>
  );
}
