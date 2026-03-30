"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";

const orbitConfigs = [
  { x: 44, y: -28, scale: 1.18, duration: 10 },
  { x: -52, y: 36, scale: 0.88, duration: 12 },
  { x: 34, y: 24, scale: 1.1, duration: 14 },
] as const;

export default function PageBackdrop() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const orbitRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!rootRef.current || !glowRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.to(glowRef.current, {
        backgroundPosition: "100% 50%",
        duration: 18,
        repeat: -1,
        yoyo: true,
        ease: "none",
      });

      orbitRefs.current.forEach((orbit, index) => {
        if (!orbit) {
          return;
        }

        const config = orbitConfigs[index];

        gsap.to(orbit, {
          xPercent: config.x,
          yPercent: config.y,
          scale: config.scale,
          duration: config.duration,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
    }, rootRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        ref={glowRef}
        className="absolute inset-0 opacity-95"
        style={{
          backgroundImage: "var(--hero-glow)",
          backgroundSize: "180% 180%",
        }}
      />
      <div
        ref={(node) => {
          orbitRefs.current[0] = node;
        }}
        className="absolute left-[-8%] top-[10%] h-72 w-72 rounded-full blur-3xl"
        style={{ backgroundColor: "var(--hero-orbit-one)" }}
      />
      <div
        ref={(node) => {
          orbitRefs.current[1] = node;
        }}
        className="absolute right-[-2%] top-[20%] h-96 w-96 rounded-full blur-3xl"
        style={{ backgroundColor: "var(--hero-orbit-two)" }}
      />
      <div
        ref={(node) => {
          orbitRefs.current[2] = node;
        }}
        className="absolute bottom-[22%] left-[28%] h-80 w-80 rounded-full blur-3xl"
        style={{ backgroundColor: "var(--hero-orbit-three)" }}
      />
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "linear-gradient(var(--hero-grid) 1px, transparent 1px), linear-gradient(90deg, var(--hero-grid) 1px, transparent 1px)",
          backgroundSize: "90px 90px",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, transparent 0, transparent 44%, var(--hero-vignette) 100%)",
        }}
      />
    </div>
  );
}
