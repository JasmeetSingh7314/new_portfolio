import About from "./components/About";
import Banner from "./components/Banner";
import Experience from "./components/Experience";
import Footer from "./components/Footer";
import Projects from "./components/Projects";


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col font-sans">
      <div className="relative isolate">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-95"
            style={{
              backgroundImage: "var(--hero-glow)",
              backgroundSize: "180% 180%",
            }}
          />
          <div
            className="absolute left-[-10%] top-[8%] h-80 w-80 rounded-full blur-3xl"
            style={{ backgroundColor: "var(--hero-orbit-one)" }}
          />
          <div
            className="absolute right-[-4%] top-[16%] h-[28rem] w-[28rem] rounded-full blur-3xl"
            style={{ backgroundColor: "var(--hero-orbit-two)" }}
          />
          <div
            className="absolute bottom-[10%] left-[22%] h-96 w-96 rounded-full blur-3xl"
            style={{ backgroundColor: "var(--hero-orbit-three)" }}
          />
          <div
            className="absolute inset-0 opacity-35"
            style={{
              backgroundImage:
                "linear-gradient(var(--hero-grid) 1px, transparent 1px), linear-gradient(90deg, var(--hero-grid) 1px, transparent 1px)",
              backgroundSize: "90px 90px",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at center, transparent 0, transparent 44%, var(--hero-vignette) 100%)",
            }}
          />
        </div>

        <div className="relative z-10">
          <Banner />
          <About />
          <Experience />
          <Projects />
          <Footer />
        </div>
      </div>
    </main>
  );
}
