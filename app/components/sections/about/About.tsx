"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import TechStack from "./TechStack";

gsap.registerPlugin(ScrollTrigger);

const aboutLines = [
  {
    text: "I build expressive digital products at the intersection of frontend, AI, and Web3.",
    activeColor: "var(--hero-text)",
  },
  {
    text: "From systems to motion, I care about the details that make an interface feel alive.",
    activeColor: "var(--hero-text)",
  },
  {
    text: "My 3D creature work is the same instinct in another medium: shape, texture, light, and personality.",
    activeColor: "var(--hero-accent)",
  },
];

export default function About() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const asideRef = useRef<HTMLDivElement | null>(null);
  const techRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      const viewportWidth = window.innerWidth;
      const startX = Math.min(viewportWidth * 0.42, 360);
      const verticalSpread = viewportWidth < 640 ? 140 : 220;
      const letters = letterRefs.current.filter(
        (letter): letter is HTMLSpanElement => Boolean(letter),
      );

      if (copyRef.current && letters.length) {
        gsap.set(letters, {
          alpha: 0.1,
        });

        gsap.fromTo(
          letters,
          {
            alpha: 0.1,
          },
          {
            color: (_, target) =>
              target.getAttribute("data-active-color") ?? "var(--hero-text)",
            ease: "none",
            alpha: 1,
            duration: 0.2,
            stagger: {
              each: 0.1,
              from: "start",
            },
            scrollTrigger: {
              trigger: copyRef.current,
              start: "top 89%",
              end: "top 30%",
              scrub: true,
            },
          },
        );
      }

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

        const startY = index % 2 === 0 ? -verticalSpread : verticalSpread;

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
      ctx.revert();
    };
  }, []);

  let letterIndex = 0;

  return (
    <section
      id="about"
      ref={sectionRef}
      className="mx-auto mb-24 w-full max-w-full px-4 pt-4 sm:px-6 lg:mb-32 lg:px-10"
    >
      {/* shadow-[0_20px_80px_rgba(20,18,16,0.1)] backdrop-blur-xl */}
      <div
        className="relative overflow-hidden rounded-[2.2rem] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12"
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

        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(16rem,0.92fr)] lg:gap-12 xl:grid-cols-[minmax(0,1.02fr)_minmax(20rem,0.92fr)] xl:gap-24 2xl:px-74 ">
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
                Building the digital side of strange ideas.
              </h2>
            </div>

            <div ref={copyRef} className="space-y-6">
              {aboutLines.map((line, index) => (
                <p
                  key={line.text}
                  aria-label={line.text}
                  className="max-w-4xl text-[clamp(1.28rem,5.2vw,3.45rem)] font-black leading-[1.04] tracking-[-0.055em] sm:text-[clamp(1.45rem,4.7vw,3.55rem)]"
                  style={{
                    color: "var(--muted)",
                  }}
                >
                  {Array.from(line.text).map((character, characterIndex) => {
                    if (character === " ") {
                      return (
                        <span
                          key={`${line.text}-${characterIndex}-space`}
                          aria-hidden="true"
                          className="inline-block w-[0.28em]"
                        />
                      );
                    }

                    const currentLetterIndex = letterIndex;
                    letterIndex += 1;

                    return (
                      <span
                        key={`${line.text}-${characterIndex}`}
                        ref={(node) => {
                          letterRefs.current[currentLetterIndex] = node;
                        }}
                        aria-hidden="true"
                        data-active-color={line.activeColor}
                        className="inline-block will-change-[color]"
                        style={{
                          color: "var(--muted)",
                        }}
                      >
                        {character}
                      </span>
                    );
                  })}
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
