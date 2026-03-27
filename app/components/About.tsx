"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import TechStack from "./TechStack";
import { GSDevTools } from "gsap/GSDevTools";

gsap.registerPlugin(ScrollTrigger);

const aboutLines = [
  {
    text: "I build at the intersection of Frontend, AI, and Web3 from real-time collaboration tools to blockchain gaming marketplaces.",
    activeColor: "var(--hero-text)",
  },
  {
    text: "I care about the details others skip.",
    activeColor: "var(--hero-text)",
  },
  {
    text: "When I'm not shipping, I'm behind a camera chasing wildlife or deep in a rabbit hole about history and emerging tech.",
    activeColor: "var(--hero-accent)",
  },
];

export default function About() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const asideRef = useRef<HTMLDivElement | null>(null);
  const techRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      lineRefs.current.forEach((line, index) => {
        if (!line) {
          return;
        }

        gsap.fromTo(
          line,
          {
            opacity: 0.18,
            color: "var(--muted)",
          },
          {
            opacity: 1,
            color: aboutLines[index].activeColor,
            ease: "none",
            scrollTrigger: {
              trigger: line,
              start: "top 18%",
              end: "bottom 90%",
              scrub: true,
            },
          },
        );
      });

      //   if (asideRef.current) {
      //     gsap.fromTo(
      //       asideRef.current,
      //       { autoAlpha: 0, y: 28 },
      //       {
      //         autoAlpha: 1,
      //         y: 0,
      //         duration: 0.9,
      //         ease: "power3.out",
      //         scrollTrigger: {
      //           trigger: asideRef.current,
      //           start: "top 82%",
      //         },
      //       },
      //     );
      //   }

      techRefs.current.forEach((chip, index) => {
        if (!chip) return;

        const startX = 600;
        const startY = index % 2 === 0 ? -400 : 300;

        gsap.fromTo(
          chip,
          {
            autoAlpha: 0,
            x: startX,
            y: startY,
            rotate: 60,
            scale: 0.84,
            id: "chip",
          },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            rotate: 0,
            scale: 1,
            duration: 1,
            ease: "power3.out",
            delay: index * 0.08,
            // keyframes: [
            //   {
            //     x: startX - 90,
            //     y: startY * -0.45,
            //     duration: 0.2,
            //     ease: "power2.out",
            //   },
            //   {
            //     x: startX - 170,
            //     y: startY * 0.3,
            //     duration: 0.1,
            //     ease: "power2.inOut",
            //   },
            //   { x: 40, y: -18, duration: 0.1, ease: "power2.inOut" },
            //   { x: 0, y: 0, duration: 0.1, ease: "power3.out" },
            // ],
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 74%",
            },
          },
        );
      });
    }, sectionRef);

    return () => {
      GSDevTools.create();
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="mx-auto w-full max-w-full px-6 pb-64 pt-4 sm:px-6 lg:px-10"
    >
      {/* shadow-[0_20px_80px_rgba(20,18,16,0.1)] backdrop-blur-xl */}
      <div
        className="relative overflow-hidden rounded-[2.2rem] px-6 py-8  sm:px-8 sm:py-10 lg:px-10 lg:py-12"
        style={
          {
            //   background: "var(--hero-shell)",
            //   border: "1px solid var(--hero-border)",
          }
        }
      >
        <div
          className="absolute inset-x-10 top-0 h-px opacity-80"
          style={{
            backgroundImage:
              "linear-gradient(to right, transparent, var(--hero-kicker-soft-bg), transparent)",
          }}
        />

        <div className="grid gap-10 lg:ml-80 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)] lg:gap-14">
          <div className="space-y-8">
            <div className="space-y-3">
              <p
                className="text-[0.72rem] font-semibold uppercase tracking-[0.32em]"
                style={{ color: "var(--muted)" }}
              >
                About
              </p>
              <h2
                className="max-w-3xl text-3xl font-black uppercase leading-[0.95] tracking-[-0.06em] sm:text-5xl lg:text-6xl"
                style={{ color: "var(--hero-text)" }}
              >
                {/* Frontend systems with care, motion, and a bit of edge. */}
              </h2>
            </div>

            <div className="space-y-6">
              {aboutLines.map((line, index) => (
                <p
                  key={line.text}
                  ref={(node) => {
                    lineRefs.current[index] = node;
                  }}
                  className="max-w-4xl text-[clamp(1.55rem,3.4vw,3.6rem)] font-black leading-[1.04] tracking-[-0.055em]"
                  style={{
                    opacity: 0.18,
                    color: "var(--muted)",
                  }}
                >
                  {line.text}
                </p>
              ))}
            </div>
          </div>

          <TechStack asideRef={asideRef} techRefs={techRefs} />
        </div>
      </div>
    </section>
  );
}
