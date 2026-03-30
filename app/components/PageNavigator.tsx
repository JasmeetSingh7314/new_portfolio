"use client";

import { UnstyledButton } from "@mantine/core";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const navSections = [
  { id: "hero", label: "Intro", index: "01" },
  { id: "about", label: "About", index: "02" },
  { id: "experience", label: "Experience", index: "03" },
  { id: "selected-work", label: "Projects", index: "04" },
  { id: "contact", label: "Contact", index: "05" },
] as const;

export default function PageNavigator() {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const indicatorRef = useRef<HTMLSpanElement | null>(null);
  const [activeId, setActiveId] = useState<(typeof navSections)[number]["id"]>(
    navSections[0].id,
  );

  useEffect(() => {
    const triggers = navSections
      .map((section) => {
        const element = document.getElementById(section.id);

        if (!element) {
          return null;
        }

        return ScrollTrigger.create({
          trigger: element,
          start: "top 42%",
          end: "bottom 42%",
          onEnter: () => setActiveId(section.id),
          onEnterBack: () => setActiveId(section.id),
        });
      })
      .filter((trigger): trigger is ScrollTrigger => Boolean(trigger));

    return () => {
      triggers.forEach((trigger) => trigger.kill());
    };
  }, []);

  useEffect(() => {
    const activeIndex = navSections.findIndex(
      (section) => section.id === activeId,
    );
    const activeItem = itemRefs.current[activeIndex];

    if (!activeItem || !indicatorRef.current) {
      return;
    }

    gsap.to(indicatorRef.current, {
      y: activeItem.offsetTop + activeItem.offsetHeight / 2 - 24,
      duration: 0.45,
      ease: "power3.out",
      overwrite: "auto",
    });

    itemRefs.current.forEach((item, index) => {
      const label = item?.querySelector("[data-nav-label]");
      const counter = item?.querySelector("[data-nav-counter]");
      const dot = item?.querySelector("[data-nav-dot]");
      const isActive = navSections[index]?.id === activeId;

      if (label) {
        gsap.to(label, {
          x: isActive ? 0 : 10,
          autoAlpha: isActive ? 1 : 0.42,
          duration: 0.28,
          ease: "power3.out",
          overwrite: "auto",
        });
      }

      if (counter) {
        gsap.to(counter, {
          autoAlpha: isActive ? 0.85 : 0.32,
          duration: 0.28,
          ease: "power3.out",
          overwrite: "auto",
        });
      }

      if (dot) {
        gsap.to(dot, {
          scale: isActive ? 1.12 : 0.92,
          opacity: isActive ? 1 : 0.58,
          duration: 0.28,
          ease: "power3.out",
          overwrite: "auto",
        });
      }
    });
  }, [activeId]);

  const handleNavigate = (id: (typeof navSections)[number]["id"]) => {
    const target = document.getElementById(id);

    if (!target) {
      return;
    }

    const smoother = ScrollSmoother.get();

    if (smoother) {
      if (id === "experience") {
        smoother.scrollTo(target, true, "top top");
      } else {
        smoother.scrollTo(target, true, "center center");
      }

      return;
    }
    if (id === "experience") {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      target.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  return (
    <nav
      aria-label="Page sections"
      className="pointer-events-none fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 xl:block"
    >
      <div
        className="pointer-events-auto relative overflow-hidden rounded-[1.9rem] border px-4 py-5 shadow-[0_20px_60px_rgba(10,10,10,0.12)] backdrop-blur-xl"
        style={{
          background: "none",
          borderColor: "transparent",
        }}
      >
        <span
          className="absolute bottom-6 right-[1.15rem] top-6 w-px"
          style={{
            background:
              "linear-gradient(to bottom, transparent, var(--hero-section-line), transparent)",
          }}
        />

        {/* <span
          ref={indicatorRef}
          className="absolute right-[0.9rem] top-5 h-12 w-[0.42rem] rounded-full"
          style={{
            background:
              "linear-gradient(to bottom, color-mix(in srgb, var(--hero-accent) 64%, white 36%), var(--hero-text))",
            boxShadow:
              "0 0 20px color-mix(in srgb, var(--hero-accent) 26%, transparent)",
          }}
        /> */}

        <div className="relative flex flex-col gap-3 scrollbar-width-none">
          {navSections.map((section, index) => {
            const isActive = section.id === activeId;

            return (
              <UnstyledButton
                key={section.id}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                onClick={() => handleNavigate(section.id)}
                className="group flex min-w-[9rem] items-center justify-between gap-4 rounded-full py-1 pl-2 pr-6"
                aria-current={isActive ? "true" : undefined}
                aria-label={`Jump to ${section.label}`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    data-nav-counter
                    className="text-[0.62rem] font-semibold uppercase tracking-[0.3em]"
                    style={{ color: "var(--hero-panel-caption)" }}
                  >
                    {section.index}
                  </span>
                  <span
                    data-nav-label
                    className="text-[0.7rem] font-semibold uppercase tracking-[0.24em]"
                    style={{
                      color: isActive
                        ? "var(--hero-text)"
                        : "var(--hero-text-muted)",
                    }}
                  >
                    {section.label}
                  </span>
                </div>

                <span
                  data-nav-dot
                  className="relative z-10 h-3 w-3 rounded-full border"
                  style={{
                    borderColor: "var(--hero-border)",
                    background: isActive
                      ? "color-mix(in srgb, var(--hero-accent) 60%, white 40%)"
                      : "color-mix(in srgb, var(--hero-shell) 86%, transparent 14%)",
                  }}
                />
              </UnstyledButton>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
