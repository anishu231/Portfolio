import Seo from "../components/public/Seo";
import Hero from "../components/public/Hero";
import About from "../components/public/About";
import Skills from "../components/public/Skills";
import Projects from "../components/public/Projects";
import ExperienceEducation from "../components/public/ExperienceEducation";
import Contact from "../components/public/Contact";

export default function Home() {
  return (
    <>
      <Seo />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <ExperienceEducation />
      <Contact />
    </>
  );
}