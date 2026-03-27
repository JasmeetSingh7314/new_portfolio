"use client";

import { Button, Group, Text } from "@mantine/core";
import gsap from "gsap";
import Link from "next/link";
import { useEffect, useRef } from "react";
import BannerModel from "./BannerModel";

const orbitConfigs = [
  { selector: "[data-orbit='one']", x: 44, y: -28, scale: 1.18, duration: 10 },
  { selector: "[data-orbit='two']", x: -52, y: 36, scale: 0.88, duration: 12 },
  { selector: "[data-orbit='three']", x: 34, y: 24, scale: 1.1, duration: 14 },
];

export default function Banner() {
  const rootRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!rootRef.current || !contentRef.current) {
      return;
    }

    const root = rootRef.current;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-hero-kicker]",
        { autoAlpha: 0, y: 32 },
        { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" },
      );

      gsap.fromTo(
        "[data-hero-line]",
        { autoAlpha: 0, y: 54, rotateX: -14 },
        {
          autoAlpha: 1,
          y: 0,
          rotateX: 0,
          duration: 1,
          ease: "power4.out",
          stagger: 0.12,
          delay: 0.1,
        },
      );

      gsap.fromTo(
        "[data-hero-copy], [data-hero-actions], [data-hero-meta]",
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.85,
          ease: "power3.out",
          stagger: 0.1,
          delay: 0.4,
        },
      );

      orbitConfigs.forEach((orbit) => {
        gsap.to(orbit.selector, {
          xPercent: orbit.x,
          yPercent: orbit.y,
          scale: orbit.scale,
          duration: orbit.duration,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      gsap.to("[data-glow]", {
        backgroundPosition: "100% 50%",
        duration: 18,
        repeat: -1,
        yoyo: true,
        ease: "none",
      });
    }, root);

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = root.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;

      gsap.to("[data-parallax='soft']", {
        x: x * 36,
        y: y * 30,
        duration: 1.2,
        ease: "power3.out",
        overwrite: "auto",
      });

      gsap.to(contentRef.current, {
        x: x * 10,
        y: y * 8,
        duration: 1.1,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    const handlePointerLeave = () => {
      gsap.to("[data-parallax='soft']", {
        x: 0,
        y: 0,
        duration: 1.4,
        ease: "power3.out",
        overwrite: "auto",
      });

      gsap.to(contentRef.current, {
        x: 0,
        y: 0,
        duration: 1.2,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    root.addEventListener("pointermove", handlePointerMove);
    root.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      root.removeEventListener("pointermove", handlePointerMove);
      root.removeEventListener("pointerleave", handlePointerLeave);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative isolate flex min-h-screen w-full items-center overflow-hidden px-4 py-10 sm:px-6 lg:px-10"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          data-glow
          className="absolute inset-0 opacity-95"
          style={{
            backgroundImage: "var(--hero-glow)",
            backgroundSize: "180% 180%",
          }}
        />
        <div
          data-orbit="one"
          data-parallax="soft"
          className="absolute left-[-8%] top-[10%] h-72 w-72 rounded-full blur-3xl"
          style={{ backgroundColor: "var(--hero-orbit-one)" }}
        />
        <div
          data-orbit="two"
          data-parallax="soft"
          className="absolute right-[-2%] top-[20%] h-96 w-96 rounded-full blur-3xl"
          style={{ backgroundColor: "var(--hero-orbit-two)" }}
        />
        <div
          data-orbit="three"
          data-parallax="soft"
          className="absolute bottom-[-12%] left-[28%] h-80 w-80 rounded-full blur-3xl"
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

      <div
        className="relative mx-auto flex w-full max-w-[95rem] flex-col justify-between gap-10 rounded-[2rem] p-5 shadow-[0_20px_80px_rgba(20,18,16,0.12)] backdrop-blur-xl sm:p-8 lg:min-h-[88vh] lg:flex-row lg:items-stretch lg:rounded-[2.75rem] lg:p-10"
        style={{
          background: "var(--hero-shell)",
          border: "1px solid var(--hero-border)",
        }}
      >
        <div
          className="absolute inset-x-8 top-0 h-px opacity-80"
          style={{
            backgroundImage:
              "linear-gradient(to right, transparent, var(--hero-kicker-soft-bg), transparent)",
          }}
        />

        <div
          ref={contentRef}
          className="relative z-10 flex flex-1 flex-col justify-between gap-12 lg:max-w-[56%]"
        >
          <div className="space-y-8">
            <Group gap="sm" className="flex-wrap">
              <span
                data-hero-kicker
                className="inline-flex items-center rounded-full px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.28em]"
                style={{
                  background: "var(--hero-kicker-strong-bg)",
                  border: "1px solid var(--hero-border)",
                  color: "var(--hero-kicker-strong-text)",
                }}
              >
                Design x Motion x Code
              </span>
              <span
                data-hero-kicker
                className="inline-flex items-center rounded-full px-4 py-2 text-[0.68rem] font-medium uppercase tracking-[0.28em]"
                style={{
                  background: "var(--hero-kicker-soft-bg)",
                  border: "1px solid var(--hero-border)",
                  color: "var(--hero-kicker-soft-text)",
                }}
              >
                Based in India, building for the web
              </span>
            </Group>

            <div className="space-y-3" style={{ color: "var(--hero-text)" }}>
              <h1
                data-hero-line
                className="max-w-5xl text-[clamp(3.4rem,10vw,8.7rem)] font-black uppercase leading-[0.9] tracking-[-0.07em]"
                style={{ transformOrigin: "50% 100%" }}
              >
                Hi!
              </h1>
              <h1
                data-hero-line
                className="max-w-5xl text-[clamp(3.4rem,10vw,8.7rem)] font-black uppercase leading-[0.9] tracking-[-0.07em]"
                style={{ transformOrigin: "50% 100%" }}
              >
                I am
              </h1>
              <h1
                data-hero-line
                className="max-w-8xl text-[clamp(3.4rem,10vw,8.7rem)] font-black uppercase leading-[0.9] tracking-[-0.07em]"
                style={{
                  transformOrigin: "50% 100%",
                  color: "var(--hero-accent)",
                }}
              >
                Jasmeet Singh
              </h1>
            </div>

            <Text
              data-hero-copy
              className="max-w-2xl text-base leading-8 sm:text-lg"
              style={{ color: "var(--hero-text-muted)" }}
            >
              I craft expressive portfolio experiences with motion, structure,
              and just enough attitude to stand out while still feeling sharp,
              credible, and easy to navigate.
            </Text>
          </div>

          <div className="space-y-8">
            <Group data-hero-actions gap="md" className="flex-wrap">
              <Button
                component={Link}
                href="#selected-work"
                radius="xl"
                size="lg"
                className="!h-auto !px-6 !py-4 !text-sm !font-semibold !uppercase !tracking-[0.24em] transition-transform duration-300 hover:!-translate-y-0.5"
                style={{
                  background: "var(--hero-text)",
                  border: "1px solid var(--hero-text)",
                  color: "var(--background)",
                }}
              >
                Explore work
              </Button>
              <Button
                component={Link}
                href="#about"
                variant="transparent"
                radius="xl"
                size="lg"
                className="!h-auto !px-6 !py-4 !text-sm !font-semibold !uppercase !tracking-[0.24em] transition-transform duration-300 hover:!-translate-y-0.5"
                style={{
                  background: "var(--hero-panel-bg)",
                  border: "1px solid var(--hero-border)",
                  color: "var(--hero-text)",
                }}
              >
                Meet the builder
              </Button>
            </Group>

            <div
              data-hero-meta
              className="grid gap-4 pt-6 text-sm sm:grid-cols-3"
              style={{
                borderTop: "1px solid var(--hero-section-line)",
                color: "var(--hero-text-muted)",
              }}
            >
              <div>
                <p
                  className="text-[0.72rem] uppercase tracking-[0.28em]"
                  style={{ color: "var(--hero-panel-caption)" }}
                >
                  Focus
                </p>
                <p
                  className="mt-2 text-base font-medium"
                  style={{ color: "var(--hero-text)" }}
                >
                  Frontend systems and portfolio storytelling
                </p>
              </div>
              <div>
                <p
                  className="text-[0.72rem] uppercase tracking-[0.28em]"
                  style={{ color: "var(--hero-panel-caption)" }}
                >
                  Style
                </p>
                <p
                  className="mt-2 text-base font-medium"
                  style={{ color: "var(--hero-text)" }}
                >
                  Editorial layouts, motion-first details, clean UX
                </p>
              </div>
              <div>
                <p
                  className="text-[0.72rem] uppercase tracking-[0.28em]"
                  style={{ color: "var(--hero-panel-caption)" }}
                >
                  Energy
                </p>
                <p
                  className="mt-2 text-base font-medium"
                  style={{ color: "var(--hero-text)" }}
                >
                  Confident, modern, and never template-looking
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-1  items-center ">
          <div className="flex h-[48rem]  w-full flex-col overflow-hidden rounded-4xl p-4 sm:p-5">
            <BannerModel />
          </div>
        </div>
      </div>
    </section>
  );
}
