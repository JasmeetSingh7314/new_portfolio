"use client";

import { Badge, Group, Text } from "@mantine/core";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    title: "Spectre Commerce",
    category: "E-commerce",
    year: "2026",
    description:
      "A premium storefront concept with product storytelling, layered motion, and fast browsing patterns.",
    stack: ["Next.js", "GSAP", "Mantine"],
  },
  {
    title: "Sakura Studio",
    category: "Creative Portfolio",
    year: "2026",
    description:
      "An editorial portfolio experience focused on typography, atmospheric gradients, and smooth transitions.",
    stack: ["React", "Tailwind", "Motion"],
  },
  {
    title: "Pulse Dashboard",
    category: "Data Interface",
    year: "2025",
    description:
      "A live operations dashboard balancing dense information, clarity, and animated feedback loops.",
    stack: ["Charts", "UI Systems", "Realtime"],
  },
  {
    title: "Frame Journal",
    category: "Publishing",
    year: "2025",
    description:
      "A magazine-style reading experience with bold section breaks, scroll rhythm, and rich visual hierarchy.",
    stack: ["Next.js", "CMS", "Typography"],
  },
  {
    title: "Nebula Launch",
    category: "Marketing Site",
    year: "2025",
    description:
      "A campaign microsite built to feel cinematic while staying conversion-focused and responsive.",
    stack: ["Landing Pages", "Animation", "Branding"],
  },
  {
    title: "Atlas Workspace",
    category: "Product Design",
    year: "2024",
    description:
      "A collaborative workspace concept with modular UI patterns, feature storytelling, and tactile interactions.",
    stack: ["Design System", "React", "Prototyping"],
  },
] as const;

function ProjectCard({
  title,
  category,
  year,
  description,
  stack,
}: (typeof projects)[number]) {
  return (
    <article
      data-project-card
      className="group relative overflow-hidden rounded-[1.75rem] px-5 py-5 shadow-[0_18px_60px_rgba(20,18,16,0.08)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 sm:px-6 sm:py-6"
      style={{
        background: "var(--hero-shell)",
        border: "1px solid var(--hero-border)",
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px opacity-80"
        style={{
          backgroundImage:
            "linear-gradient(to right, transparent, var(--hero-kicker-soft-bg), transparent)",
        }}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Text
            className="text-[0.68rem] font-semibold uppercase tracking-[0.3em]"
            style={{ color: "var(--hero-panel-caption)" }}
          >
            {category}
          </Text>
          <h3
            className="text-2xl font-black uppercase tracking-[-0.05em]"
            style={{ color: "var(--hero-text)" }}
          >
            {title}
          </h3>
        </div>

        <span
          className="rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.24em]"
          style={{
            background: "var(--hero-panel-bg)",
            border: "1px solid var(--hero-border)",
            color: "var(--hero-text)",
          }}
        >
          {year}
        </span>
      </div>

      <Text
        className="mt-5 text-sm leading-7 sm:text-base"
        style={{ color: "var(--hero-text-muted)" }}
      >
        {description}
      </Text>

      <Group gap="xs" className="mt-6 flex-wrap">
        {stack.map((item) => (
          <Badge
            key={item}
            radius="xl"
            variant="light"
            styles={{
              root: {
                background: "color-mix(in srgb, var(--hero-panel-bg) 88%, transparent 12%)",
                border: "1px solid var(--hero-border)",
                color: "var(--hero-text)",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontWeight: 700,
                paddingInline: "0.75rem",
              },
            }}
          >
            {item}
          </Badge>
        ))}
      </Group>
    </article>
  );
}

export default function Projects() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-project-card]",
        {
          autoAlpha: 0,
          x: -72,
        },
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 72%",
          },
        },
      );
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="selected-work"
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

        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p
              className="text-[0.72rem] font-semibold uppercase tracking-[0.32em]"
              style={{ color: "var(--muted)" }}
            >
              Selected Work
            </p>
            <h2
              className="max-w-3xl text-3xl font-black uppercase leading-[0.95] tracking-[-0.06em] sm:text-5xl lg:text-6xl"
              style={{ color: "var(--hero-text)" }}
            >
              Project cards with presence, not a slideshow hiding the good parts.
            </h2>
          </div>

          <Text
            className="max-w-md text-sm leading-7 sm:text-base"
            style={{ color: "var(--hero-text-muted)" }}
          >
            A six-card project grid for now, with room to expand into deeper case studies later.
          </Text>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.title} {...project} />
          ))}
        </div>
      </div>
    </section>
  );
}
