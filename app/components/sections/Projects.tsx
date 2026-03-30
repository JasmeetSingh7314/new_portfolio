"use client";

import { Badge, Group, Text } from "@mantine/core";
import type { StaticImageData } from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { MutableRefObject } from "react";
import { useEffect, useRef } from "react";
import admImage from "../../assets/projects/ADM.jpg";
import owlImage from "../../assets/projects/Owl.png";
import stsImage from "../../assets/projects/sts.jpg";
import tutorAiImage from "../../assets/projects/tutorai.png";

gsap.registerPlugin(ScrollTrigger);

type Project = {
  title: string;
  category: string;
  year: string;
  description: string;
  stack: string[];
  image: StaticImageData;
  imagePosition?: string;
};

type BentoVariant = "feature" | "wide" | "tile";

const projects: Project[] = [
  {
    title: "Owl",
    category: "Web3",
    year: "2023",
    description:
      "A dApp for video game distribution employing NFT licensing. This led us to securing the highest position out of 12,000 participants in the esteemed TezAsia 2k23 hackathon",
    stack: ["Next.js", "Wallets", "GSAP"],
    image: owlImage,
    imagePosition: "center center",
  },

  {
    title: "STS",
    category: "Data Interface",
    year: "2023",
    description:
      "A support ticket system using round-robin assignment and dynamic agent allocation to streamline resolution and keep operations running at optimal efficiency.",
    stack: ["Dashboards", "Systems", "UI"],
    image: stsImage,
    imagePosition: "center center",
  },
  {
    title: "ADM",
    category: "Scheduling",
    year: "2023",
    description:
      "A full-stack ad platform personalizing campaigns to user demographics via reverse geo-coding — featuring a self-serve dashboard for seamless ad creation and management.",
    stack: ["Planning", "Product", "UX"],
    image: admImage,
    imagePosition: "center center",
  },
  {
    title: "Tutor.ai",
    category: "AI",
    year: "2024",
    description:
      "An adaptive learning platform generating personalized lessons, quizzes, and gamified experiences per user. Built with ReactJS, Node.js, and Python — integrating OpenRouter and Deepseek to overcome API limitations and deliver precision AI-driven education.",
    stack: ["React", "AI UX", "Frontend"],
    image: tutorAiImage,
    imagePosition: "center center",
  },
];

const bentoPattern: BentoVariant[] = [
  "feature",
  "tile",
  "tile",
  "wide",
  "tile",
  "tile",
];

const variantClasses: Record<BentoVariant, string> = {
  feature: "md:col-span-2 md:row-span-2 xl:col-span-2 xl:row-span-2",
  wide: "md:col-span-2 md:row-span-1 xl:col-span-2 xl:row-span-1",
  tile: "md:col-span-1 md:row-span-1",
};

function getVariant(index: number): BentoVariant {
  return bentoPattern[index % bentoPattern.length];
}

function ProjectCard({
  project,
  index,
  overlayRefs,
  detailsRefs,
  imageRefs,
}: {
  project: Project;
  index: number;
  overlayRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  detailsRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  imageRefs: MutableRefObject<(HTMLDivElement | null)[]>;
}) {
  const variant = getVariant(index);
  const isFeature = variant === "feature";

  const animateHover = (entering: boolean) => {
    const overlay = overlayRefs.current[index];
    const details = detailsRefs.current[index];
    const image = imageRefs.current[index];

    if (!overlay || !details || !image) {
      return;
    }

    gsap.to(overlay, {
      yPercent: entering ? 0 : -100,
      duration: entering ? 0.48 : 0.36,
      ease: "power3.out",
      overwrite: "auto",
    });

    gsap.to(details, {
      autoAlpha: entering ? 1 : 0,
      y: entering ? 0 : 24,
      duration: entering ? 0.32 : 0.24,
      delay: entering ? 0.08 : 0,
      ease: "power3.out",
      overwrite: "auto",
    });

    gsap.to(image, {
      scale: 1,
      duration: 0.78,
      ease: "power3.out",
      overwrite: "auto",
    });
  };
  // shadow-[0_18px_60px_rgba(20,18,16,0.08)]
  return (
    <article
      data-project-card
      className={`group project-cut-card relative h-full min-h-[21rem] overflow-hidden rounded-[1.6rem] transition-transform duration-300 hover:-translate-y-1 ${variantClasses[variant]}`}
      onMouseEnter={() => animateHover(true)}
      onMouseLeave={() => animateHover(false)}
      onFocus={() => animateHover(true)}
      onBlur={() => animateHover(false)}
      tabIndex={0}
    >
      <div
        className="project-cut-card__border absolute inset-0"
        // style={{
        //   background:
        //     "color-mix(in srgb, var(--hero-border) 88%, rgba(255,255,255,0.18) 12%)",
        // }}
      />

      <div className="project-cut-card__inner absolute inset-[1px] overflow-hidden">
        <div
          ref={(node) => {
            imageRefs.current[index] = node;
          }}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${project.image.src})`,
            backgroundPosition: project.imagePosition ?? "center center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            transformOrigin: "50% 50%",
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,10,12,0.04) 0%, rgba(10,10,12,0.16) 100%)",
          }}
        />

        <div
          ref={(node) => {
            overlayRefs.current[index] = node;
          }}
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(13,13,16,0.24) 0%, rgba(13,13,16,0.78) 45%, rgba(13,13,16,0.92) 100%)",
          }}
        />

        <div
          ref={(node) => {
            detailsRefs.current[index] = node;
          }}
          className="absolute inset-0 flex flex-col justify-between p-5 sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <Text
              className="text-[0.68rem] font-semibold uppercase tracking-[0.3em]"
              style={{ color: "rgba(245, 248, 251, 0.82)" }}
            >
              {project.category}
            </Text>

            <span
              className={`font-black tracking-[-0.07em] ${
                isFeature ? "text-4xl" : "text-3xl"
              }`}
              style={{ color: "#f5f8fb" }}
            >
              {project.year}
            </span>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h3
                className={`font-black uppercase tracking-[-0.05em] ${
                  isFeature ? "text-[2rem]" : "text-2xl"
                }`}
                style={{ color: "#f5f8fb" }}
              >
                {project.title}
              </h3>
              <Text
                className={
                  isFeature
                    ? "max-w-xl text-base leading-7"
                    : "text-sm leading-6"
                }
                style={{ color: "rgba(241, 244, 248, 0.78)" }}
              >
                {isFeature || variant === "wide" ? project.description : ""}
              </Text>
            </div>

            <Group
              gap="xs"
              className={`flex-wrap ${isFeature ? "mb-26" : "mb-12"}`}
            >
              {project.stack.map((item) => (
                <Badge
                  key={item}
                  radius="xl"
                  variant="light"
                  styles={{
                    root: {
                      background: "rgba(245, 248, 251, 0.08)",
                      border: "1px solid rgba(245, 248, 251, 0.14)",
                      color: "#f5f8fb",
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
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Projects() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const detailsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(overlayRefs.current.filter(Boolean), {
        yPercent: -100,
      });

      gsap.set(detailsRefs.current.filter(Boolean), {
        autoAlpha: 0,
        y: 24,
      });

      gsap.fromTo(
        "[data-project-card]",
        {
          x: -72,
        },
        {
          x: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.1,
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
              Image-first project cards with details revealed on hover.
            </h2>
          </div>

          <Text
            className="max-w-md text-sm leading-7 sm:text-base"
            style={{ color: "var(--hero-text-muted)" }}
          >
            The artwork stays visible by default, and a translucent panel drops
            in only when you engage with a card.
          </Text>
        </div>

        <div className="grid gap-5 md:grid-flow-dense md:auto-rows-[18rem] md:grid-cols-2 xl:auto-rows-[22rem] xl:grid-cols-4">
          {projects.map((project, index) => (
            <ProjectCard
              key={`${project.title}-${index}`}
              project={project}
              index={index}
              overlayRefs={overlayRefs}
              detailsRefs={detailsRefs}
              imageRefs={imageRefs}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
