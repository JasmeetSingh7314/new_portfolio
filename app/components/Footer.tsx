"use client";

import { Group, Text } from "@mantine/core";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

const footerLinks = [
  { label: "Email", href: "mailto:jasmeet@example.com" },
  { label: "GitHub", href: "https://github.com/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
  { label: "Resume", href: "#" },
] as const;

export default function Footer() {
  const footerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!footerRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-footer-reveal]",
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 80%",
          },
        },
      );
    }, footerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <footer
      ref={footerRef}
    className="mx-auto w-full px-4   pb-10 pt-4  "
    >
      <div
        className="relative overflow-hidden rounded-2xl  px-6 py-8 shadow-[0_20px_80px_rgba(20,18,16,0.1)] backdrop-blur-xl sm:px-8 sm:py-10 lg:px-10 lg:py-12"
        style={{
          background: "var(--hero-shell)",
        //   border: "1px solid var(--hero-border)",
        }}
      >
        <div
          className="absolute inset-x-10 top-0 h-px opacity-80"
          style={{
            backgroundImage:
              "linear-gradient(to right, transparent, var(--hero-kicker-soft-bg), transparent)",
          }}
        />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.7fr)] lg:items-end">
          <div className="space-y-4">
            <p
              data-footer-reveal
              className="text-[0.72rem] font-semibold uppercase tracking-[0.32em]"
              style={{ color: "var(--muted)" }}
            >
              Let&apos;s build something sharp
            </p>
            <h2
              data-footer-reveal
              className="max-w-4xl text-3xl font-black uppercase leading-[0.95] tracking-[-0.06em] sm:text-5xl lg:text-6xl"
              style={{ color: "var(--hero-text)" }}
            >
              If the idea needs motion, clarity, and presence, I&apos;m in.
            </h2>
            <Text
              data-footer-reveal
              className="max-w-2xl text-sm leading-7 sm:text-base"
              style={{ color: "var(--hero-text-muted)" }}
            >
              Open to frontend roles, creative web builds, and portfolio-grade product experiences.
            </Text>
          </div>

          <div
            data-footer-reveal
            className="rounded-[1.6rem] px-5 py-5"
            style={{
              background: "var(--hero-panel-bg)",
              border: "1px solid var(--hero-border)",
            }}
          >
            <Text
              className="text-[0.68rem] font-semibold uppercase tracking-[0.3em]"
              style={{ color: "var(--hero-panel-caption)" }}
            >
              Reach out
            </Text>

            <Group gap="xs" className="mt-5 flex-wrap">
              {footerLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] transition-transform duration-300 hover:-translate-y-0.5"
                  style={{
                    background: "color-mix(in srgb, var(--hero-shell) 86%, transparent 14%)",
                    border: "1px solid var(--hero-border)",
                    color: "var(--hero-text)",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Group>

            <div
              className="mt-6 flex flex-col gap-2 text-sm"
              style={{ color: "var(--hero-text-muted)" }}
            >
              <span>Jasmeet Singh</span>
              <span>Frontend developer and motion-focused builder</span>
              <span>Based in India</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
