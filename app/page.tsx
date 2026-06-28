import { Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/landing/Hero";
import Skills from "@/components/landing/Skills";
import Timeline from "@/components/landing/Timeline";
import KnowledgeGraph from "@/components/landing/KnowledgeGraph";
import ExpiredBanner from "@/components/landing/ExpiredBanner";
import { getMasterCV, getProjects } from "@/lib/api";

export default async function Home() {
  const [cv, projects] = await Promise.all([getMasterCV(), getProjects()]);
  return (
    <>
      <Header />
      <Suspense fallback={null}>
        <ExpiredBanner />
      </Suspense>
      <main className="max-w-4xl mx-auto px-4">
        <Hero cv={cv} />
        <Skills skills={cv.skills_core} languages={cv.languages} />
        <Timeline projects={projects} />
        <KnowledgeGraph projects={projects} />
      </main>
      <Footer />
    </>
  );
}
