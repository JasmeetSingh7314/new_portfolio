"use client";

import { Button, Text } from "@mantine/core";
import gsap from "gsap";
import Link from "next/link";
import { useEffect, useRef } from "react";
import IBG from "../../effects/IBG";

export default function Banner() {
  const rootRef = useRef<HTMLElement | null>(null);
  const introRef = useRef<HTMLSpanElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const greetRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const greetings = ["Hi", "こんにちは!", "नमस्ते!"];

  useEffect(() => {
    if (!rootRef.current || !introRef.current || !stageRef.current) {
      return;
    }

    const root = rootRef.current;
    const refs = greetRefs.current;

    const ctx = gsap.context(() => {
      gsap.set("[data-hero-kicker]", { autoAlpha: 0, y: 18 });
      gsap.set("[data-name-frame]", { autoAlpha: 0, y: 52, scale: 0.98 });
      gsap.set("[data-name-outline]", { autoAlpha: 0, y: 76 });
      gsap.set("[data-hero-copy], [data-hero-actions]", {
        autoAlpha: 0,
        y: 28,
      });

      refs.forEach((el) => {
        if (!el) return;
        gsap.set(el, { autoAlpha: 0 });
      });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      const tl2 = gsap.timeline({
        // repeat: 0,
        repeatDelay: 0.2,
        delay: 0.8,
      });

      refs.forEach((el) => {
        if (!el) return;

        tl2.set(el, {
          autoAlpha: 1,
        });
        tl2.to({}, { duration: 0.3 });

        tl2.set(el, {
          autoAlpha: 0,
        });
      });

      tl.fromTo(
        introRef.current,
        {
          autoAlpha: 0,
          scale: 0.62,
          filter: "blur(16px)",
        },
        {
          autoAlpha: 1,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.72,
        },
      )
        .to(
          introRef.current,
          {
            autoAlpha: 0,
            scale: 0.34,
            yPercent: -138,
            duration: 1.4,
            ease: "power4.inOut",
          },
          "+=0.15",
        )
        .to(
          "[data-hero-kicker]",
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.42,
          },
          "-=0.16",
        )
        .to(
          "[data-name-frame]",
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.82,
            ease: "power4.out",
          },
          "-=0.08",
        )
        .to(
          "[data-name-outline]",
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.88,
            ease: "power4.out",
          },
          "-=0.52",
        )
        .to(
          "[data-hero-copy], [data-hero-actions]",
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.72,
            stagger: 0.1,
          },
          "-=0.42",
        );
    }, root);

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = root.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;

      gsap.to(stageRef.current, {
        x: x * 18,
        y: y * 14,
        duration: 1,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    const handlePointerLeave = () => {
      gsap.to(stageRef.current, {
        x: 0,
        y: 0,
        duration: 1.1,
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

  const shiftGreeting = () => {
    return greetings.map((greet, idx) => {
      return (
        <span
          key={idx}
          ref={(node) => {
            greetRefs.current[idx] = node;
          }}
          className="absolute inset-0 inline-flex items-center justify-center whitespace-nowrap text-center"
        >
          {greet}
        </span>
      );
    });
  };

  return (
    <section
      id="hero"
      ref={rootRef}
      className="relative isolate min-h-screen overflow-hidden"
    >
      <IBG className="absolute inset-0 h-full w-full" />

      <div className="pointer-events-none relative z-10 flex min-h-screen items-center justify-center px-6 py-12 sm:px-8">
        <span
          ref={introRef}
          className="pointer-events-none absolute left-1/2 top-1/2 inline-flex min-h-[1em] min-w-[8ch] items-center justify-center -translate-x-1/2 -translate-y-1/2 text-center text-[clamp(5rem,18vw,13rem)] font-black uppercase tracking-[-0.09em]"
          style={{ color: "var(--hero-text)" }}
        >
          {shiftGreeting()}
        </span>

        <div
          ref={stageRef}
          className="flex w-full max-w-[76rem] flex-col items-center text-center"
        >
          <p
            data-hero-kicker
            className="pointer-events-auto text-[0.72rem] font-semibold uppercase tracking-[0.38em]"
            style={{ color: "var(--muted)" }}
          >
            Navigating the unknown, pixel by pixel.
          </p>

          <div
            data-name-frame
            className="pointer-events-auto mt-4 inline-flex items-center justify-center rounded-[1.5rem] border border-dashed px-4 py-3 sm:px-8 sm:py-5"
            style={{ borderColor: "var(--hero-border)" }}
          >
            <h1
              className="text-[clamp(4.6rem,18vw,10.5rem)] font-black uppercase leading-none tracking-[-0.09em]"
              style={{ color: "var(--hero-text)" }}
            >
              Jasmeet
            </h1>
          </div>

          <h1
            data-name-outline
            className="pointer-events-auto mt-2 text-[clamp(4.6rem,18vw,10.5rem)] font-black uppercase leading-none tracking-[-0.09em] text-transparent"
            style={{
              WebkitTextStroke:
                "1px color-mix(in srgb, var(--hero-text) 56%, transparent)",
            }}
          >
            Singh
          </h1>

          <Text
            data-hero-copy
            className="pointer-events-auto mt-8 max-w-2xl text-base leading-8 sm:text-lg"
            style={{ color: "var(--hero-text-muted)" }}
          >
            I build expressive frontend experiences where motion, typography,
            and structure work together to feel cinematic, clear, and memorable.
          </Text>

          <div
            data-hero-actions
            className="pointer-events-auto mt-8 flex flex-wrap items-center justify-center gap-4"
          >
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
          </div>
        </div>
      </div>
    </section>
  );
}
