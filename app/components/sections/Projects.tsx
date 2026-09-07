"use client";

import { Text, useMantineColorScheme } from "@mantine/core";
import type { StaticImageData } from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import admImage from "../../assets/projects/adm.png";
import owlImage from "../../assets/projects/Owl.png";
import stsImage from "../../assets/projects/sts.jpg";
import tutorAiImage from "../../assets/projects/tutorai.png";

gsap.registerPlugin(ScrollTrigger);

type ProjectMetric = {
  value: string;
  label: string;
};

type Project = {
  title: string;
  category: string;
  year: string;
  description: string;
  stack: string[];
  metrics: ProjectMetric[];
  image: StaticImageData;
  imagePosition?: string;
  accent: string;
};

const projects: Project[] = [
  {
    title: "Tutor.ai",
    category: "AI Learning",
    year: "2025",
    description:
      "An adaptive learning platform that generated lessons, quizzes, and progression paths per user. The UI had to make AI output feel trustworthy, structured, and usable instead of overwhelming.",
    stack: ["React", "AI UX", "Frontend"],
    metrics: [
      { value: "AI", label: "lesson generation" },
      { value: "Full", label: "learning loop" },
    ],
    image: tutorAiImage,
    imagePosition: "center center",
    accent: "#5ed3f3",
  },
  {
    title: "Owl",
    category: "Web3 Product",
    year: "2024",
    description:
      "A game-distribution dApp that turned NFT licensing into a cleaner player flow. The project blended wallet onboarding, motion-led storytelling, and a sharper release experience for a hackathon-scale launch.",
    stack: ["Next.js", "Wallets", "GSAP"],
    metrics: [
      { value: "12k+", label: "hackathon participants" },
      { value: "Top 1", label: "tezasia finish" },
    ],
    image: owlImage,
    imagePosition: "center center",
    accent: "#bc8cff",
  },

  {
    title: "ADM",
    category: "Campaign Platform",
    year: "2023",
    description:
      "A full-stack ad platform with reverse geocoding and self-serve campaign creation. The challenge was translating targeting logic and scheduling complexity into a product teams could use without friction.",
    stack: ["Planning", "Product", "UX"],
    metrics: [
      { value: "Geo", label: "personalized delivery" },
      { value: "Self", label: "serve workflow" },
    ],
    image: admImage,
    imagePosition: "center center",
    accent: "#ff9d7d",
  },
];

function ProjectPlate({
  project,
  index,
  plateRefs,
  isDark,
}: {
  project: Project;
  index: number;
  plateRefs: React.MutableRefObject<(HTMLElement | null)[]>;
  isDark: boolean;
}) {
  const visualAccent = isDark ? project.accent : "#8a8a8a";

  return (
    <article
      ref={(node) => {
        plateRefs.current[index] = node;
      }}
      className="absolute inset-0 group overflow-hidden rounded-[1.9rem] border p-4 sm:p-5 xl:p-6"
      style={{
        zIndex: projects.length - index,
        background:
          isDark
            ? "linear-gradient(180deg, rgba(9,9,11,0.96) 0%, rgba(12,12,14,0.985) 100%)"
            : "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(229,229,229,0.98) 100%)",
        borderColor:
          isDark
            ? "color-mix(in srgb, var(--hero-border) 88%, rgba(255,255,255,0.12) 12%)"
            : "rgba(17,17,17,0.14)",
        boxShadow: isDark
          ? "0 20px 60px rgba(8, 8, 10, 0.18)"
          : "0 20px 60px rgba(17,17,17,0.12)",
      }}
    >
      <div className="grid h-full gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(20rem,1.18fr)] lg:items-stretch xl:gap-8">
        <div className="flex min-w-0 flex-col justify-between gap-8 px-2 py-2 sm:px-4 sm:py-4">
          <div className="space-y-5">
            <p
              className="text-[0.68rem] font-semibold uppercase tracking-[0.28em]"
              style={{
                color: isDark ? "rgba(245,248,251,0.42)" : "#626262",
              }}
            >
              {project.category}
            </p>

            <div className="space-y-4">
              <h3
                className="max-w-[12ch] text-[clamp(2rem,5vw,4rem)] font-black leading-[0.92] tracking-[-0.08em]"
                style={{ color: isDark ? "#f5f8fb" : "#111111" }}
              >
                {project.title}
              </h3>

              <Text
                className="max-w-[34rem] text-[0.95rem] leading-7 sm:text-base sm:leading-8"
                style={{
                  color: isDark ? "rgba(241,244,248,0.7)" : "#505050",
                }}
              >
                {project.description}
              </Text>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-wrap gap-6 sm:gap-10">
              {project.metrics.map((metric) => (
                <div key={metric.label} className="min-w-[8rem] space-y-1">
                  <p
                    className="text-3xl font-black tracking-[-0.08em] sm:text-4xl"
                    style={{ color: isDark ? "#f5f8fb" : "#111111" }}
                  >
                    {metric.value}
                  </p>
                  <p
                    className="text-[0.64rem] font-semibold uppercase tracking-[0.22em]"
                    style={{
                      color: isDark ? "rgba(245,248,251,0.46)" : "#626262",
                    }}
                  >
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <a
                href="#contact"
                className="inline-flex items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.24em]"
                style={{ color: isDark ? "#f5f8fb" : "#111111" }}
              >
                View case study
                <span aria-hidden="true" className="text-base leading-none">
                  {">"}
                </span>
              </a>

              <span
                className="text-[0.62rem] uppercase tracking-[0.2em]"
                style={{
                  color: isDark ? "rgba(245,248,251,0.34)" : "#707070",
                }}
              >
                {project.stack.join(" / ")}
              </span>
            </div>
          </div>
        </div>

        <div className="relative min-h-[19rem] overflow-hidden rounded-[1.35rem] lg:min-h-[33rem]">
          <div
            className="absolute inset-0"
            style={{
              background: isDark
                ? `linear-gradient(180deg, color-mix(in srgb, ${visualAccent} 76%, transparent) 0%, color-mix(in srgb, ${visualAccent} 42%, rgba(12,12,14,0.2) 58%) 32%, rgba(12,12,14,0.06) 100%)`
                : `linear-gradient(180deg, color-mix(in srgb, ${visualAccent} 36%, #ffffff 64%) 0%, color-mix(in srgb, ${visualAccent} 18%, #f0f0f0 82%) 58%, #e2e2e2 100%)`,
            }}
          />

          <div
            className="absolute inset-0 opacity-55"
            style={{
              background:
                "radial-gradient(circle at 15% 20%, rgba(255,255,255,0.16) 0%, transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 30%)",
            }}
          />

          <div
            className="absolute left-[8%] top-[18%] h-[68%] w-[24%] overflow-hidden rounded-[2rem] border backdrop-blur-sm"
            style={{
              transform: `translateY(${index % 2 === 0 ? "4%" : "10%"})`,
              background: isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.78)",
              borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(17,17,17,0.12)",
              boxShadow: isDark
                ? "0 20px 60px rgba(8,8,10,0.32)"
                : "0 20px 60px rgba(17,17,17,0.16)",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${project.image.src})`,
                backgroundPosition: project.imagePosition ?? "center center",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                filter: isDark
                  ? "brightness(0.6)"
                  : "grayscale(1) brightness(0.82) contrast(1.05)",
                transform: "scale(1.14)",
              }}
            />
          </div>

          <div
            className="absolute right-[6%] top-[5%] h-[94%] w-[82%] overflow-hidden rounded-[1.5rem] border"
            style={{
              background: isDark ? "rgba(0,0,0,0.82)" : "rgba(255,255,255,0.82)",
              borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(17,17,17,0.12)",
              boxShadow: isDark
                ? "0 26px 80px rgba(6,6,8,0.38)"
                : "0 26px 80px rgba(17,17,17,0.18)",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${project.image.src})`,
                backgroundPosition: project.imagePosition ?? "center center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                filter: isDark ? undefined : "grayscale(1) contrast(1.06)",
              }}
            />

            <div
              className="absolute inset-0"
              style={{
              background:
                  isDark
                    ? "linear-gradient(180deg, rgba(10,10,12,0.02) 0%, rgba(10,10,12,0.24) 100%)"
                    : "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.2) 100%)",
              }}
            />

            <div
              className="absolute left-3 top-3 h-6 w-6 border-l border-t"
              style={{
                borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(17,17,17,0.2)",
              }}
            />

            <div
              className="absolute bottom-4 right-4 rounded-full px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.2em]"
              style={{
                color: isDark ? "#f5f8fb" : "#111111",
                background: isDark
                  ? "rgba(8,8,10,0.48)"
                  : "rgba(255,255,255,0.78)",
                border: isDark
                  ? "1px solid rgba(255,255,255,0.08)"
                  : "1px solid rgba(17,17,17,0.12)",
              }}
            >
              {project.year}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Projects() {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const plateRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current || !stageRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      const plates = plateRefs.current.filter(
        (plate): plate is HTMLElement => Boolean(plate),
      );

      if (!plates.length) {
        return;
      }

      gsap.set(plates, {
        autoAlpha: 0,
        yPercent: 24,
        scale: 1.14,
        rotateX: -8,
        filter: "blur(12px)",
        transformOrigin: "50% 50%",
        force3D: true,
      });

      gsap.set(plates[0], {
        autoAlpha: 1,
        yPercent: 0,
        scale: 1,
        rotateX: 0,
        filter: "blur(0px)",
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: stageRef.current,
          start: "top top+=88",
          end: () =>
            `+=${Math.max(plates.length - 1, 1) * stageRef.current!.offsetHeight * 1.18}`,
          scrub: 1.15,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      plates.forEach((plate, index) => {
        if (index === plates.length - 1) {
          return;
        }

        const nextPlate = plates[index + 1];

        timeline
          .to(
            plate,
            {
              yPercent: -12,
              scale: 0.8,
              rotateX: 8,
              autoAlpha: 0,
              filter: "blur(14px)",
              ease: "power2.inOut",
              duration: 1,
            },
            index,
          )
          .fromTo(
            nextPlate,
            {
              yPercent: 24,
              scale: 1.14,
              rotateX: -8,
              autoAlpha: 0,
              filter: "blur(12px)",
            },
            {
              yPercent: 0,
              scale: 1,
              rotateX: 0,
              autoAlpha: 1,
              filter: "blur(0px)",
              ease: "power3.out",
              duration: 1,
            },
            index + 0.06,
          );
      });
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
              className="max-w-3xl text-[clamp(2rem,6vw,4.5rem)] font-black uppercase leading-[0.95] tracking-[-0.06em]"
              style={{ color: "var(--hero-text)" }}
            >
              Scroll through project plates, one story at a time.
            </h2>
          </div>

          <Text
            className="max-w-md text-[0.9rem] leading-7 sm:text-base"
            style={{ color: "var(--hero-text-muted)" }}
          >
            Each plate sits in one fixed stage. As you scroll, the current
            project lifts, recedes, and clears out while the next plate takes
            its place. Scrolling back up reverses the whole sequence.
          </Text>
        </div>

        <div ref={stageRef} className="relative h-[76vh] min-h-[36rem]">
          <div className="relative h-full">
            {projects.map((project, index) => (
              <ProjectPlate
                key={`${project.title}-${index}`}
                project={project}
                index={index}
                plateRefs={plateRefs}
                isDark={isDark}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
