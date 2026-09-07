import React from "react";

import { FaGitAlt, FaNodeJs, FaReact } from "react-icons/fa";
import {
  SiApachekafka,
  SiHtml5,
  SiJavascript,
  SiNextdotjs,
  SiPython,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";
import { TbBrandThreejs } from "react-icons/tb";
const TechStack = ({ asideRef, techRefs }: any) => {
  const techStack = [
    {
      name: "React",
      icon: <FaReact size={40} />,
      tint: "#5ed3f3",
    },
    {
      name: "Next",
      icon: <SiNextdotjs size={40} />,
      tint: "var(--hero-text)",
    },
    {
      name: "TypeScript",
      icon: <SiTypescript size={40} />,
      tint: "#3f7ad9",
    },
    {
      name: "JavaScript",
      icon: <SiJavascript size={40} />,
      tint: "#f5dd4b",
    },
    {
      name: "HTML",
      icon: <SiHtml5 size={40} />,
      tint: "#ff6d3a",
    },
    {
      name: "Tailwind",
      icon: <SiTailwindcss size={40} />,
      tint: "#44c5e7",
    },
    {
      name: "Three",
      icon: <TbBrandThreejs size={40} />,
      tint: "var(--hero-text)",
    },
    {
      name: "Node",
      icon: <FaNodeJs size={40} />,
      tint: "#77c162",
    },
    {
      name: "Python",
      icon: <SiPython size={40} />,
      tint: "#5a95e4",
    },
    {
      name: "Kafka",
      icon: <SiApachekafka size={40} />,
      tint: "#d96bff",
    },
    {
      name: "Git",
      icon: <FaGitAlt size={40} />,
      tint: "#ff7f50",
    },
  ] as const;

  return (
    <div
      ref={asideRef}
      className="grid h-full w-full max-w-[34rem] gap-5 self-start justify-self-center lg:max-w-none"
    >
      <div
        className="h-full w-full rounded-[1.6rem] px-2 py-2 sm:px-3 sm:py-3"
        style={
          {
            //   background: "var(--hero-panel-bg)",
            //   border: "1px solid var(--hero-border)",
          }
        }
      >
        <p
          className="text-[0.68rem] font-semibold uppercase tracking-[0.3em]"
          style={{ color: "var(--hero-panel-caption)" }}
        >
          Toolkit
        </p>
        <p
          className="mt-3 text-sm leading-7"
          style={{ color: "var(--hero-text-muted)" }}
        >
          Tools I use to make thoughtful interfaces fast, reliable, and fun to use.
        </p>
        <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 lg:gap-x-8 lg:gap-y-12">
          {techStack.map((tech, index) => (
            <div
              key={tech.name}
              ref={(node) => {
                techRefs.current[index] = node;
              }}
              className="flex flex-col items-center gap-3 text-center"
              style={{ opacity: 0 }}
            >
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full shadow-[0_16px_40px_rgba(20,18,16,0.1)] sm:h-24 sm:w-24 lg:h-28 lg:w-28"
                style={{
                  background:
                    "color-mix(in srgb, var(--hero-shell) 78%, white 22%)",
                  border: "1px solid var(--hero-border)",
                  color: tech.tint,
                }}
              >
                {tech.icon}
              </div>
              <span
                className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] sm:text-[0.68rem]"
                style={{ color: "var(--hero-text)" }}
              >
                {tech.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechStack;
