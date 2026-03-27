"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

const aboutLines = [
  {
    text: "I build interfaces that feel composed, tactile, and alive.",
    activeColor: "var(--hero-text)",
  },
  {
    text: "I care about rhythm as much as hierarchy, so motion supports the message instead of stealing focus.",
    activeColor: "var(--hero-text)",
  },
  {
    text: "The goal is work that looks distinct, feels smooth, and still reads as sharp and professional.",
    activeColor: "var(--hero-accent)",
  },
];

export default function About() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const asideRef = useRef<HTMLDivElement | null>(null);

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
              start: "top 88%",
              end: "bottom 58%",
              scrub: true,
            },
          },
        );
      });

      if (asideRef.current) {
        gsap.fromTo(
          asideRef.current,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: asideRef.current,
              start: "top 82%",
            },
          },
        );
      }
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="mx-auto w-full max-w-[95rem] px-4 pb-8 pt-4 sm:px-6 lg:px-10"
    >
      <div
        className="relative overflow-hidden rounded-[2.2rem] px-6 py-8 shadow-[0_20px_80px_rgba(20,18,16,0.1)] backdrop-blur-xl sm:px-8 sm:py-10 lg:px-10 lg:py-12"
        style={{
          background: "var(--hero-shell)",
          border: "1px solid var(--hero-border)",
        }}
      >
        <div
          className="absolute inset-x-10 top-0 h-px opacity-80"
          style={{
            backgroundImage:
              "linear-gradient(to right, transparent, var(--hero-kicker-soft-bg), transparent)",
          }}
        />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.7fr)] lg:gap-14">
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
                Design-led frontend, with motion that earns its place.
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

          <div
            ref={asideRef}
            className="grid gap-4 self-end sm:grid-cols-2 lg:grid-cols-1"
          >
            <div
              className="rounded-[1.6rem] px-5 py-5 backdrop-blur-md"
              style={{
                background: "var(--hero-panel-bg)",
                border: "1px solid var(--hero-border)",
              }}
            >
              <p
                className="text-[0.68rem] font-semibold uppercase tracking-[0.3em]"
                style={{ color: "var(--hero-panel-caption)" }}
              >
                Strength
              </p>
              <p
                className="mt-3 text-lg font-semibold leading-8"
                style={{ color: "var(--hero-text)" }}
              >
                Building polished interfaces where layout, interaction, and brand tone feel tightly connected.
              </p>
            </div>

            <div
              className="rounded-[1.6rem] px-5 py-5"
              style={{
                background: "var(--hero-shell)",
                border: "1px solid var(--hero-border)",
              }}
            >
              <p
                className="text-[0.68rem] font-semibold uppercase tracking-[0.3em]"
                style={{ color: "var(--hero-panel-caption)" }}
              >
                Toolkit
              </p>
              <p
                className="mt-3 text-lg font-semibold leading-8"
                style={{ color: "var(--hero-text)" }}
              >
                React, Next.js, GSAP, Three.js, Mantine, and design systems that scale without feeling generic.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
