"use client";

import {
  MantineColorScheme,
  UnstyledButton,
  useMantineColorScheme,
} from "@mantine/core";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { FaMoon } from "react-icons/fa";
import { FaSun } from "react-icons/fa";

type ThemeOption = {
  value: MantineColorScheme;
  label: string;
  direction: "left" | "right";
  icon: React.ReactNode;
};

const options: ThemeOption[] = [
  {
    value: "light",
    label: "Sakura",
    direction: "left",
    icon: <FaSun size={18} />,
  },
  {
    value: "dark",
    label: "Spectre",
    direction: "right",
    icon: <FaMoon size={16} />,
  },
];

export default function ThemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    labelRefs.current.forEach((label, index) => {
      if (!label) {
        return;
      }

      gsap.set(label, {
        autoAlpha: 0,
        x: options[index].direction === "left" ? -14 : 14,
      });
    });

    buttonRefs.current.forEach((button) => {
      if (!button) {
        return;
      }

      gsap.set(button, { width: 50 });
    });
  }, [mounted]);

  if (!mounted) {
    return null;
  }

  const animateOption = (index: number, expanding: boolean) => {
    const button = buttonRefs.current[index];
    const label = labelRefs.current[index];

    if (!button || !label) {
      return;
    }

    gsap.to(button, {
      width: expanding ? 128 : 50,
      duration: 0.32,
      ease: "power3.out",
      overwrite: "auto",
    });

    gsap.to(label, {
      autoAlpha: expanding ? 1 : 0,
      x: expanding ? 0 : options[index].direction === "left" ? -14 : 14,
      duration: expanding ? 0.28 : 0.22,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  return (
    <div className="fixed right-4 top-4 z-50 sm:right-6 sm:top-6">
      <div
        className="flex items-center gap-2 rounded-full border p-2 shadow-[0_20px_60px_rgba(10,10,10,0.12)] backdrop-blur-xl"
        style={{
          background: "var(--toggle-shell)",
          borderColor: "var(--toggle-border)",
        }}
      >
        {options.map((option, index) => {
          const isActive = colorScheme === option.value;

          return (
            <UnstyledButton
              key={option.value}
              ref={(node) => {
                buttonRefs.current[index] = node;
              }}
              onClick={() => setColorScheme(option.value)}
              onMouseEnter={() => animateOption(index, true)}
              onMouseLeave={() => animateOption(index, false)}
              onFocus={() => animateOption(index, true)}
              onBlur={() => animateOption(index, false)}
              className={`relative flex h-11 items-center overflow-hidden rounded-full px-4 ${
                option.direction === "right" ? "justify-end" : "justify-start"
              }`}
              style={{
                background: isActive
                  ? "var(--toggle-indicator)"
                  : "transparent",
                border: `1px solid ${
                  isActive ? "var(--toggle-indicator-border)" : "transparent"
                }`,
                color: "var(--toggle-text)",
                boxShadow: isActive
                  ? "0 10px 26px rgba(18, 18, 18, 0.12)"
                  : "none",
              }}
              aria-label={`Switch to ${option.label} theme`}
            >
              <span
                className={`relative z-10 flex items-center justify-center px-4 ${
                  option.direction === "right" ? "flex-row-reverse" : ""
                }`}
              >
                <span className="shrink-0">{option.icon}</span>
                <span
                  ref={(node) => {
                    labelRefs.current[index] = node;
                  }}
                  className={`pointer-events-none whitespace-nowrap text-[0.72rem] font-bold uppercase tracking-[0.18em] ${
                    option.direction === "right" ? "mr-3" : "ml-3"
                  }`}
                >
                  {option.label}
                </span>
              </span>
            </UnstyledButton>
          );
        })}
      </div>
    </div>
  );
}
