import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/landing/Hero";
import Timeline from "@/components/landing/Timeline";
import { getMasterCV, getProjects } from "@/lib/api";

export default async function Home() {
  const [cv, projects] = await Promise.all([getMasterCV(), getProjects()]);
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4">
        <Hero cv={cv} />
        <Timeline projects={projects} />
      </main>
      <Footer />
    </>
  );
}
