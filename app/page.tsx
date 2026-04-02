import About from "./components/sections/about/About";
import Banner from "./components/sections/Banner/Banner";
import Experience from "./components/sections/Experience";
import Footer from "./components/sections/Footer";

import PageBackdrop from "./components/PageBackdrop";
import Projects from "./components/sections/Projects";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col font-sans">
      <div className="relative isolate">
        <PageBackdrop />

        <div className="relative z-10">
          <Banner />
          <About />
          <Experience />
          <Projects />
          <Footer />
          {/* <YinYang /> */}
        </div>
      </div>
    </main>
  );
}
