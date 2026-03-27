"use client";

import { Badge, Group, Text, ThemeIcon, Timeline } from "@mantine/core";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { FaCode, FaLayerGroup, FaRocket } from "react-icons/fa";

gsap.registerPlugin(ScrollTrigger);

const experiences = [
  {
    company: "ReactXpress",
    period: "2024 - Present",
    role: "Frontend Developer",
    location: "India",
    icon: <FaRocket size={12} />,
    summary:
      "Built expressive landing pages, interactive UI sections, and motion systems for modern web experiences.",
    highlights: [
      "Shipped responsive React interfaces with animation-forward interaction design.",
      "Turned rough concepts into polished sections with clean hierarchy and stronger visual rhythm.",
      "Worked across GSAP, Next.js, and component systems to keep motion and usability aligned.",
    ],
    tags: ["Next.js", "GSAP", "Mantine"],
  },
  {
    company: "Independent Projects",
    period: "2023 - 2024",
    role: "Creative Frontend Builder",
    location: "Remote",
    icon: <FaLayerGroup size={12} />,
    summary:
      "Designed and developed portfolio-style experiences with a focus on visual identity and smooth interaction.",
    highlights: [
      "Created immersive hero sections, modular layouts, and storytelling-driven page flows.",
      "Experimented with Three.js scenes, scroll choreography, and animated backgrounds.",
      "Balanced bold visual ideas with maintainable code and reusable patterns.",
    ],
    tags: ["Three.js", "UI Motion", "Design Systems"],
  },
  {
    company: "Self-led Learning",
    period: "Ongoing",
    role: "Design Engineer in Progress",
    location: "Always shipping",
    icon: <FaCode size={12} />,
    summary:
      "Constantly refining how code, layout, typography, and motion can work together as one experience.",
    highlights: [
      "Studied interaction design patterns that make interfaces feel deliberate instead of generic.",
      "Built projects to sharpen frontend engineering, animation timing, and visual composition.",
      "Focused on making work feel memorable while staying sharp, readable, and professional.",
    ],
    tags: ["Creative Dev", "Frontend", "Interaction"],
  },
] as const;

function ExperienceDetails({
  summary,
  highlights,
  tags,
}: {
  summary: string;
  highlights: readonly string[];
  tags: readonly string[];
}) {
  return (
    <div
      className="rounded-[1.5rem] px-5 py-5 backdrop-blur-md"
      style={{
        background: "var(--hero-panel-bg)",
        border: "1px solid var(--hero-border)",
      }}
    >
      <Text
        className="max-w-2xl text-base leading-8 sm:text-lg"
        style={{ color: "var(--hero-text-muted)" }}
      >
        {summary}
      </Text>

      <div className="mt-5 grid gap-3">
        {highlights.map((item) => (
          <div
            key={item}
            className="flex items-start gap-3 rounded-[1.15rem] px-4 py-3"
            style={{
              background: "color-mix(in srgb, var(--hero-shell) 82%, transparent 18%)",
              border: "1px solid var(--hero-border)",
            }}
          >
            <span
              className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: "var(--hero-accent)" }}
            />
            <Text className="text-sm leading-7 sm:text-[0.98rem]" style={{ color: "var(--hero-text)" }}>
              {item}
            </Text>
          </div>
        ))}
      </div>

      <Group gap="xs" className="mt-5 flex-wrap">
        {tags.map((tag) => (
          <Badge
            key={tag}
            radius="xl"
            variant="light"
            styles={{
              root: {
                background: "var(--hero-shell)",
                border: "1px solid var(--hero-border)",
                color: "var(--hero-text)",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontWeight: 700,
                paddingInline: "0.8rem",
              },
            }}
          >
            {tag}
          </Badge>
        ))}
      </Group>
    </div>
  );
}

export default function Experience() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-exp-item]",
        { autoAlpha: 0, y: 32 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.14,
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
      id="experience"
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
              Experience
            </p>
            <h2
              className="max-w-3xl text-3xl font-black uppercase leading-[0.95] tracking-[-0.06em] sm:text-5xl lg:text-6xl"
              style={{ color: "var(--hero-text)" }}
            >
              Building work where visuals, interaction, and execution move together.
            </h2>
          </div>

          <Text
            className="max-w-md text-sm leading-7 sm:text-base"
            style={{ color: "var(--hero-text-muted)" }}
          >
            A modular timeline of the roles, experiments, and frontend work that shaped how I design and build.
          </Text>
        </div>

        <Timeline
          active={experiences.length}
          bulletSize={34}
          lineWidth={2}
          color="sakura"
          styles={{
            itemBullet: {
              background: "var(--hero-shell)",
              borderColor: "var(--hero-border)",
              color: "var(--hero-accent)",
              boxShadow: "0 8px 24px rgba(18, 18, 18, 0.08)",
            },
            itemTitle: {
              color: "var(--hero-text)",
            },
          }}
        >
          {experiences.map((item) => (
            <Timeline.Item
              key={`${item.company}-${item.role}`}
              bullet={
                <ThemeIcon
                  size={24}
                  radius="xl"
                  variant="transparent"
                  styles={{ root: { color: "inherit" } }}
                >
                  {item.icon}
                </ThemeIcon>
              }
              title=""
            >
              <div
                data-exp-item
                className="grid gap-4 pb-8 lg:grid-cols-[minmax(14rem,0.55fr)_minmax(0,1.2fr)] lg:gap-8"
              >
                <div className="space-y-2">
                  <Text
                    className="text-[0.72rem] font-semibold uppercase tracking-[0.28em]"
                    style={{ color: "var(--hero-panel-caption)" }}
                  >
                    {item.period}
                  </Text>
                  <Text
                    className="text-2xl font-black uppercase tracking-[-0.05em]"
                    style={{ color: "var(--hero-text)" }}
                  >
                    {item.company}
                  </Text>
                  <Text className="text-sm font-medium uppercase tracking-[0.18em]" style={{ color: "var(--hero-accent)" }}>
                    {item.role}
                  </Text>
                  <Text className="text-sm" style={{ color: "var(--hero-text-muted)" }}>
                    {item.location}
                  </Text>
                </div>

                <ExperienceDetails
                  summary={item.summary}
                  highlights={item.highlights}
                  tags={item.tags}
                />
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      </div>
    </section>
  );
}
