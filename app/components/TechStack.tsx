import React, { useEffect } from "react";

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

  useEffect(() => {}, []);
  return (
    <div ref={asideRef} className="grid gap-5 self-end mr-60 h-full">
      <div
        className="rounded-[1.6rem] h-full px-5 py-5 "
        style={{
        //   background: "var(--hero-panel-bg)",
        //   border: "1px solid var(--hero-border)",
        }}
      >
        {/* <p
          className="text-[0.68rem] font-semibold uppercase tracking-[0.3em]"
          style={{ color: "var(--hero-panel-caption)" }}
        >
          Tech stack
        </p>
        <p
          className="mt-3 text-sm leading-7"
          style={{ color: "var(--hero-text-muted)" }}
        >
          The stack comes in from the right and settles here as the About
          section lands.
        </p> */}

        <div className="mt-6 grid grid-cols-2 gap-16 sm:grid-cols-3">
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
                className="flex h-30 w-30 items-center justify-center rounded-full shadow-[0_16px_40px_rgba(20,18,16,0.1)]"
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
                className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]"
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
