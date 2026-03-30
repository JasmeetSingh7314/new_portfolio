"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

export default function StartupLoader() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const shimmerRef = useRef<HTMLDivElement | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!rootRef.current || !panelRef.current || !progressRef.current) {
      return;
    }

    const startTime = performance.now();
    const minDuration = 700;
    let completionTimer: ReturnType<typeof setTimeout> | null = null;

    gsap.set(progressRef.current, { scaleX: 0, transformOrigin: "0% 50%" });
    gsap.set(shimmerRef.current, { xPercent: -120 });

    const introTimeline = gsap.timeline();
    introTimeline
      .fromTo(
        panelRef.current,
        { autoAlpha: 0, y: 28, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: "power3.out" },
      )
      .to(
        progressRef.current,
        { scaleX: 1, duration: 0.4, ease: "power2.out" },
        0.14,
      )
      .to(
        shimmerRef.current,
        { xPercent: 160, duration: 0.8, ease: "power2.inOut" },
        0.1,
      );

    const finish = () => {
      const elapsed = performance.now() - startTime;
      const remaining = Math.max(0, minDuration - elapsed);

      completionTimer = setTimeout(() => {
        const outro = gsap.timeline({
          onComplete: () => setHidden(true),
        });

        outro
          .to(panelRef.current, {
            autoAlpha: 0,
            y: -18,
            scale: 0.985,
            duration: 0.45,
            ease: "power3.inOut",
          })
          .to(
            rootRef.current,
            {
              autoAlpha: 0,
              duration: 0.35,
              ease: "power2.out",
            },
            0.08,
          );
      }, remaining);
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
    }

    return () => {
      window.removeEventListener("load", finish);
      if (completionTimer) {
        clearTimeout(completionTimer);
      }
      introTimeline.kill();
    };
  }, []);

  if (hidden) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[70] flex items-center justify-center px-5"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--background) 94%, black 6%) 0%, color-mix(in srgb, var(--background) 78%, var(--hero-accent) 22%) 100%)",
      }}
    >
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage: "var(--hero-glow)",
          backgroundSize: "180% 180%",
        }}
      />
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "linear-gradient(var(--hero-grid) 1px, transparent 1px), linear-gradient(90deg, var(--hero-grid) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
        }}
      />

      <div
        ref={panelRef}
        className="relative w-full max-w-xl overflow-hidden rounded-[2rem] px-6 py-8 shadow-[0_30px_120px_rgba(10,10,10,0.18)] backdrop-blur-2xl sm:px-8 sm:py-9"
        style={{
          background: "var(--hero-shell)",
          border: "1px solid var(--hero-border)",
        }}
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <p
              className="text-[0.72rem] font-semibold uppercase tracking-[0.32em]"
              style={{ color: "var(--hero-panel-caption)" }}
            >
              Booting portfolio
            </p>
            {/* <span
              className="rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.28em]"
              style={{
                color: "var(--hero-kicker-strong-text)",
                background: "var(--hero-kicker-strong-bg)",
                border: "1px solid var(--hero-border)",
              }}
            >
              Live
            </span> */}
          </div>

          <div className="space-y-2">
            {/* <h2
              className="text-[clamp(2.3rem,7vw,4.8rem)] font-black uppercase leading-[0.9] tracking-[-0.07em]"
              style={{ color: "var(--hero-text)" }}
            >
              Jasmeet
            </h2> */}
            <h2
              className="text-[clamp(2.3rem,7vw,4.8rem)] font-black uppercase leading-[0.9] tracking-[-0.07em]"
              style={{ color: "var(--hero-accent)" }}
            >
              loading
            </h2>
          </div>

          <p
            className="max-w-md text-sm leading-7 sm:text-base"
            style={{ color: "var(--hero-text-muted)" }}
          >
            Preparing motion, textures, and theme-aware atmospheres for the
            first reveal.
          </p>

          <div className="space-y-3 pt-2">
            <div
              className="relative h-2 overflow-hidden rounded-full"
              style={{
                background:
                  "color-mix(in srgb, var(--hero-panel-bg) 80%, transparent 20%)",
              }}
            >
              <div
                ref={progressRef}
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: "100%",
                  background:
                    "linear-gradient(90deg, color-mix(in srgb, var(--hero-accent) 55%, white 45%) 0%, var(--hero-accent) 100%)",
                }}
              />
              <div
                ref={shimmerRef}
                className="absolute inset-y-0 left-0 w-1/3 skew-x-[-18deg] opacity-70"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.72) 50%, transparent 100%)",
                }}
              />
            </div>

            <div
              className="flex items-center justify-between text-[0.68rem] font-semibold uppercase tracking-[0.24em]"
              style={{ color: "var(--hero-panel-caption)" }}
            >
              <span>Initializing scene</span>
              <span>Almost ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
