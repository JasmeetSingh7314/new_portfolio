"use client";

import { Group, Text } from "@mantine/core";
import {
  forceCollide,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
} from "d3-force";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

const SVG_NS = "http://www.w3.org/2000/svg";

const footerLinks = [
  { label: "Email", href: "mailto:hello@portfolio.dev" },
  { label: "GitHub", href: "https://github.com/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
  { label: "Resume", href: "#" },
] as const;

const blobPath =
  "M38.9,-71C45.3,-63.6,41.9,-42.9,44.2,-28.9C46.5,-14.8,54.5,-7.4,62,4.3C69.5,16.1,76.5,32.1,73,44.2C69.6,56.3,55.7,64.4,41.8,71.5C27.9,78.6,13.9,84.7,1.2,82.6C-11.5,80.5,-23,70.1,-34.6,61.6C-46.2,53.2,-58,46.8,-57,36.8C-56,26.9,-42.2,13.4,-43.7,-0.9C-45.3,-15.2,-62.1,-30.4,-62.3,-39C-62.6,-47.6,-46.2,-49.7,-33.1,-53.2C-19.9,-56.6,-10,-61.5,3.1,-66.9C16.2,-72.3,32.4,-78.3,38.9,-71Z";

const ringConfig = [
  { scale: 1, strokeWidth: 1.24, opacity: 0.92 },
  { scale: 0.8, strokeWidth: 1.12, opacity: 0.76 },
  { scale: 0.6, strokeWidth: 1, opacity: 0.58 },
  { scale: 0.4, strokeWidth: 0.9, opacity: 0.42 },
  { scale: 0.2, strokeWidth: 0.82, opacity: 0.26 },
] as const;

const ecosystemConfigs = [
  {
    anchor: { x: 0.18, y: 0.2 },
    visualScale: 1.56,
    strokeMix: 0.52,
    pulseDuration: 2.8,
    wanderX: 44,
    wanderY: 26,
    wanderDuration: 12.4,
    wanderPhase: 0.3,
  },
  {
    anchor: { x: 0.18, y: 0.21 },
    visualScale: 1.34,
    strokeMix: 0.38,
    pulseDuration: 3.1,
    wanderX: 36,
    wanderY: 22,
    wanderDuration: 14.8,
    wanderPhase: 1.4,
  },
  {
    anchor: { x: 0.18, y: 0.21 },
    visualScale: 1.34,
    strokeMix: 0.38,
    pulseDuration: 3.1,
    wanderX: 36,
    wanderY: 22,
    wanderDuration: 14.8,
    wanderPhase: 1.4,
  },
  {
    anchor: { x: 0.18, y: 0.21 },
    visualScale: 1.34,
    strokeMix: 0.38,
    pulseDuration: 3.1,
    wanderX: 36,
    wanderY: 22,
    wanderDuration: 14.8,
    wanderPhase: 1.4,
  },
] as const;

const CONTOUR_POINT_COUNT = 100;
const CONTOUR_REPEL_DISTANCE = 30;
const CONTOUR_REPEL_STRENGTH = 0.12;
const CONTOUR_NEIGHBOR_FALLOFF = [1, 0.88, 0.72, 0.48, 0.23] as const;
const POINT_RETURN_STRENGTH = 0.01;
const POINT_SMOOTH_STRENGTH = 0.07;
const POINT_DAMPING = 0.98;
const AREA_PRESERVE_STRENGTH = 0.13;
const CENTER_VELOCITY_TRANSFER = 0.18;
const COARSE_HOME_X_STRENGTH = 0.038;
const COARSE_HOME_Y_STRENGTH = 0.12;
const COARSE_COLLIDE_MULTIPLIER = 1.1;
const COARSE_CHARGE_STRENGTH = -26;
const TOP_OVERFLOW_ALLOWANCE = 0.28;
const SIDE_MARGIN = 18;
const BOTTOM_MARGIN = 18;
const MIN_SIMULATION_ALPHA = 0.085;
const WANDER_X_BLEND = 0.0026;
const WANDER_Y_BLEND = 0.0042;
const RING_BREATHE_AMPLITUDE = 0.07;
const RING_BREATHE_LAG = 0.8;
const RING_BREATHE_FALLOFF = 0.12;
const MOUSE_REPEL_RADIUS = 120; // how far mouse influence reaches (SVG units)
const MOUSE_REPEL_STRENGTH = 0.1; // how hard it pushes blob centers
const MOUSE_CONTOUR_RADIUS = 40; // how close mouse gets to surface points
const MOUSE_CONTOUR_STRENGTH = 0.1; // how hard it deforms the surface

type Vec2 = {
  x: number;
  y: number;
};

type FooterBlobNode = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  homeX: number;
  homeY: number;
  radius: number;
  noiseOffsetX: number;
  noiseOffsetY: number;
};

type BlobState = {
  restPoints: Vec2[];
  points: Vec2[];
  velocities: Vec2[];
  restAverageRadius: number;
};

function createVec2(x = 0, y = 0): Vec2 {
  return { x, y };
}

function clonePoints(points: Vec2[]) {
  return points.map((point) => createVec2(point.x, point.y));
}

function scalePoints(points: Vec2[], scale: number) {
  return points.map((point) => createVec2(point.x * scale, point.y * scale));
}

function averagePoint(points: Vec2[]) {
  const total = points.reduce((sum, point) => {
    sum.x += point.x;
    sum.y += point.y;
    return sum;
  }, createVec2());

  return createVec2(total.x / points.length, total.y / points.length);
}

function averageRadius(points: Vec2[]) {
  return (
    points.reduce((sum, point) => sum + Math.hypot(point.x, point.y), 0) /
    points.length
  );
}

function round(value: number) {
  return Number(value.toFixed(3));
}

function buildSmoothClosedPath(points: Vec2[]) {
  if (points.length < 2) {
    return "";
  }

  let path = `M ${round(points[0].x)} ${round(points[0].y)}`;
  const count = points.length;

  for (let index = 0; index < count; index += 1) {
    const previous = points[(index - 1 + count) % count];
    const current = points[index];
    const next = points[(index + 1) % count];
    const afterNext = points[(index + 2) % count];

    const controlPointOne = createVec2(
      current.x + (next.x - previous.x) / 6,
      current.y + (next.y - previous.y) / 6,
    );
    const controlPointTwo = createVec2(
      next.x - (afterNext.x - current.x) / 6,
      next.y - (afterNext.y - current.y) / 6,
    );

    path += ` C ${round(controlPointOne.x)} ${round(controlPointOne.y)} ${round(controlPointTwo.x)} ${round(controlPointTwo.y)} ${round(next.x)} ${round(next.y)}`;
  }

  return `${path} Z`;
}

function addDistributedForce(
  forces: Vec2[],
  index: number,
  forceX: number,
  forceY: number,
) {
  const count = forces.length;

  CONTOUR_NEIGHBOR_FALLOFF.forEach((weight, spread) => {
    if (spread === 0) {
      forces[index].x += forceX * weight;
      forces[index].y += forceY * weight;
      return;
    }

    const nextIndex = (index + spread) % count;
    const previousIndex = (index - spread + count) % count;

    forces[nextIndex].x += forceX * weight;
    forces[nextIndex].y += forceY * weight;
    forces[previousIndex].x += forceX * weight;
    forces[previousIndex].y += forceY * weight;
  });
}

function sampleClosedPathPoints(pathData: string, sampleCount: number) {
  const svg = document.createElementNS(SVG_NS, "svg");
  const path = document.createElementNS(SVG_NS, "path");

  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.setAttribute("viewBox", "0 0 1 1");
  svg.style.position = "absolute";
  svg.style.opacity = "0";
  // svg.style.pointerEvents = "none";
  svg.style.overflow = "hidden";
  svg.style.left = "-9999px";
  svg.style.top = "-9999px";

  path.setAttribute("d", pathData);
  svg.appendChild(path);
  document.body.appendChild(svg);

  const totalLength = path.getTotalLength();
  const sampledPoints: Vec2[] = [];

  for (let index = 0; index < sampleCount; index += 1) {
    const point = path.getPointAtLength((index / sampleCount) * totalLength);
    sampledPoints.push(createVec2(point.x, point.y));
  }

  document.body.removeChild(svg);

  const centroid = averagePoint(sampledPoints);

  return sampledPoints.map((point) =>
    createVec2(point.x - centroid.x, point.y - centroid.y),
  );
}

export default function Footer() {
  const footerRef = useRef<HTMLElement | null>(null);
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const clusterRefs = useRef<(SVGGElement | null)[]>([]);
  const ringRefs = useRef<(SVGPathElement | null)[][]>(
    ecosystemConfigs.map(() => []),
  );

  useEffect(() => {
    if (!footerRef.current || !fieldRef.current) {
      return;
    }

    const basePoints = sampleClosedPathPoints(blobPath, CONTOUR_POINT_COUNT);
    const baseAverageRadius = averageRadius(basePoints);

    const nodes: FooterBlobNode[] = [];
    const blobStates: BlobState[] = [];
    let simulation: ReturnType<typeof forceSimulation<FooterBlobNode>> | null =
      null;
    let resizeObserver: ResizeObserver | null = null;
    let animationFrameId: number | null = null;
    // store refs at the top of buildSystem for cleanup
    let cleanupMouseMove: (() => void) | null = null;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-footer-reveal]",
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.84,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 78%",
          },
        },
      );

      ringRefs.current.forEach((ringSet, blobIndex) => {
        ringSet.forEach((ring, ringIndex) => {
          if (!ring) {
            return;
          }

          const config = ecosystemConfigs[blobIndex];
          const baseOpacity = ringConfig[ringIndex].opacity;

          gsap.to(ring, {
            opacity:
              ringIndex === 0
                ? baseOpacity
                : Math.max(baseOpacity - 0.18, 0.08),
            duration: config.pulseDuration + ringIndex * 0.14,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: blobIndex * 0.08 + ringIndex * 0.05,
          });
        });
      });

      const buildSystem = () => {
        const bounds = fieldRef.current?.getBoundingClientRect();

        if (!bounds || bounds.width === 0 || bounds.height === 0) {
          return;
        }

        simulation?.stop(); //stop running simulation
        cleanupMouseMove?.(); //clenaup mouse events
        cleanupMouseMove = null; //reset mouse

        if (animationFrameId !== null) {
          window.cancelAnimationFrame(animationFrameId);
        }

        nodes.length = 0;
        blobStates.length = 0;

        ecosystemConfigs.forEach((config, index) => {
          const restPoints = scalePoints(basePoints, config.visualScale);
          const interactionRadius = averageRadius(restPoints);
          const homeX = bounds.width * config.anchor.x;
          const homeY = bounds.height * config.anchor.y;

          nodes.push({
            x: homeX,
            y: homeY,
            vx: 0,
            vy: 0,
            homeX,
            homeY,
            radius: interactionRadius,
            noiseOffsetX: Math.random() * 1000,
            noiseOffsetY: Math.random() * 1000,
          });

          blobStates.push({
            restPoints,
            points: clonePoints(restPoints),
            velocities: restPoints.map(() => createVec2()),
            restAverageRadius: interactionRadius,
          });

          const cluster = clusterRefs.current[index];

          if (cluster) {
            gsap.set(cluster, { x: homeX, y: homeY });
          }
        });

        simulation = forceSimulation(nodes)
          .stop()
          .alpha(1)
          .alphaDecay(0.02)
          .velocityDecay(0.28)
          .force(
            "charge",
            forceManyBody<FooterBlobNode>().strength(
              //repulsion force
              (node) =>
                COARSE_CHARGE_STRENGTH * (node.radius / baseAverageRadius),
            ),
          )
          .force(
            "collide",
            forceCollide<FooterBlobNode>()
              .radius((node) => node.radius * COARSE_COLLIDE_MULTIPLIER)
              .iterations(2),
          )
          .force(
            "x",
            forceX<FooterBlobNode>((node) => node.homeX).strength(
              COARSE_HOME_X_STRENGTH,
            ),
          )
          .force(
            "y",
            forceY<FooterBlobNode>((node) => node.homeY).strength(
              COARSE_HOME_Y_STRENGTH,
            ),
          );
        //MOUSE MOVEMENTS
        let hasLoggedMouseEffect = false;
        const mouse = { x: -9999, y: -9999 }; // off-screen default

        const handleMouseEnter = () => {
          console.log("footer mouse enter");
          hasLoggedMouseEffect = false;
        };

        const handleMouseMove = (e: MouseEvent) => {
          const bounds = fieldRef.current?.getBoundingClientRect();
          if (!bounds) return;
          // convert page coords to coords relative to the field div
          mouse.x = e.clientX - bounds.left;
          mouse.y = e.clientY - bounds.top;
        };
        const handleMouseLeave = () => {
          console.log("footer mouse leave");
          mouse.x = -9999;
          mouse.y = -9999;
          hasLoggedMouseEffect = false;
        };

        footerRef.current?.addEventListener("mouseenter", handleMouseEnter);
        footerRef.current?.addEventListener("mousemove", handleMouseMove);
        footerRef.current?.addEventListener("mouseleave", handleMouseLeave);

        cleanupMouseMove = () => {
          footerRef.current?.removeEventListener(
            "mouseenter",
            handleMouseEnter,
          );
          footerRef.current?.removeEventListener("mousemove", handleMouseMove);
          footerRef.current?.removeEventListener(
            "mouseleave",
            handleMouseLeave,
          );
        };

        const renderFrame = () => {
          const time = performance.now() / 1000;
          let mouseEffectTriggered = false;

          if (simulation) {
            simulation.alpha(
              Math.max(simulation.alpha(), MIN_SIMULATION_ALPHA),
            );
            simulation.tick();
          }

          const currentBounds = fieldRef.current?.getBoundingClientRect();

          if (!currentBounds) {
            return;
          }

          nodes.forEach((node, index) => {
            const config = ecosystemConfigs[index];
            const phase =
              (time / config.wanderDuration) * Math.PI * 2 + config.wanderPhase;
            // Use sin/cos at irrational multiples to fake noise

            node.noiseOffsetX += 0.004;
            node.noiseOffsetY += 0.004;
            const wanderTargetX =
              currentBounds.width * 0.5 +
              Math.sin(node.noiseOffsetX * 1.3) * currentBounds.width * 0.38 +
              Math.sin(node.noiseOffsetX * 0.7) * currentBounds.width * 0.18;

            const wanderTargetY =
              currentBounds.height * 0.5 +
              Math.cos(node.noiseOffsetY * 1.1) * currentBounds.height * 0.32 +
              Math.cos(node.noiseOffsetY * 0.5) * currentBounds.height * 0.14;

            // Mouse repulsion on blob CENTER (coarse layer)
            const mdx = node.x - mouse.x;
            const mdy = node.y - mouse.y;
            const mouseDist = Math.hypot(mdx, mdy);

            if (mouseDist < MOUSE_REPEL_RADIUS && mouseDist > 0.01) {
              // force stronger when closer — inverse square falloff
              const strength =
                (1 - mouseDist / MOUSE_REPEL_RADIUS) ** 2 *
                MOUSE_REPEL_STRENGTH;
              node.vx += (mdx / mouseDist) * strength;
              node.vy += (mdy / mouseDist) * strength;
              mouseEffectTriggered = true;
            }

            node.vx += (wanderTargetX - node.x) * WANDER_X_BLEND;
            node.vy += (wanderTargetY - node.y) * WANDER_Y_BLEND;

            const xMargin = node.radius * 0.78 + SIDE_MARGIN;
            const topLimit = -node.radius * TOP_OVERFLOW_ALLOWANCE;
            const bottomLimit =
              currentBounds.height - (node.radius * 0.78 + BOTTOM_MARGIN);

            node.x = gsap.utils.clamp(
              xMargin,
              currentBounds.width - xMargin,
              node.x,
            );
            node.y = gsap.utils.clamp(topLimit, bottomLimit, node.y);
          });

          const contourForces = blobStates.map((state) =>
            state.points.map(() => createVec2()),
          );

          for (
            let blobIndex = 0;
            blobIndex < blobStates.length - 1;
            blobIndex += 1
          ) {
            for (
              let otherBlobIndex = blobIndex + 1;
              otherBlobIndex < blobStates.length;
              otherBlobIndex += 1
            ) {
              const blobState = blobStates[blobIndex];
              const otherBlobState = blobStates[otherBlobIndex];
              const blobNode = nodes[blobIndex];
              const otherBlobNode = nodes[otherBlobIndex];
              const centerDistance = Math.hypot(
                otherBlobNode.x - blobNode.x,
                otherBlobNode.y - blobNode.y,
              );
              const interactionRange =
                blobNode.radius +
                otherBlobNode.radius +
                CONTOUR_REPEL_DISTANCE * 3;

              if (centerDistance > interactionRange) {
                continue;
              }

              blobState.points.forEach((point, pointIndex) => {
                const worldPointX = blobNode.x + point.x;
                const worldPointY = blobNode.y + point.y;

                otherBlobState.points.forEach((otherPoint, otherPointIndex) => {
                  const otherWorldPointX = otherBlobNode.x + otherPoint.x;
                  const otherWorldPointY = otherBlobNode.y + otherPoint.y;
                  let deltaX = worldPointX - otherWorldPointX;
                  let deltaY = worldPointY - otherWorldPointY;
                  let distance = Math.hypot(deltaX, deltaY);

                  if (distance >= CONTOUR_REPEL_DISTANCE) {
                    return;
                  }

                  if (distance < 0.0001) {
                    deltaX = worldPointX >= otherWorldPointX ? 1 : -1;
                    deltaY = 0;
                    distance = 1;
                  }

                  const normalX = deltaX / distance;
                  const normalY = deltaY / distance;
                  const overlap = CONTOUR_REPEL_DISTANCE - distance;
                  const forceAmount =
                    (overlap / CONTOUR_REPEL_DISTANCE) * CONTOUR_REPEL_STRENGTH;

                  addDistributedForce(
                    contourForces[blobIndex],
                    pointIndex,
                    normalX * forceAmount,
                    normalY * forceAmount,
                  );
                  addDistributedForce(
                    contourForces[otherBlobIndex],
                    otherPointIndex,
                    -normalX * forceAmount,
                    -normalY * forceAmount,
                  );
                });
              });
            }
          }

          blobStates.forEach((state, blobIndex) => {
            const node = nodes[blobIndex];
            const pointCount = state.points.length;

            // Mouse repulsion on blob SURFACE (fine layer)
            state.points.forEach((point, pointIndex) => {
              const worldX = node.x + point.x;
              const worldY = node.y + point.y;
              const mdx = worldX - mouse.x;
              const mdy = worldY - mouse.y;
              const dist = Math.hypot(mdx, mdy);

              if (dist < MOUSE_CONTOUR_RADIUS && dist > 0.01) {
                const strength =
                  (1 - dist / MOUSE_CONTOUR_RADIUS) ** 2 *
                  MOUSE_CONTOUR_STRENGTH;
                addDistributedForce(
                  contourForces[blobIndex],
                  pointIndex,
                  (mdx / dist) * strength,
                  (mdy / dist) * strength,
                );
                mouseEffectTriggered = true;
              }
            });

            state.points.forEach((point, pointIndex) => {
              const velocity = state.velocities[pointIndex];
              const restPoint = state.restPoints[pointIndex];
              const previousPoint =
                state.points[(pointIndex - 1 + pointCount) % pointCount];
              const nextPoint = state.points[(pointIndex + 1) % pointCount];
              const smoothingTarget = createVec2(
                (previousPoint.x + nextPoint.x) * 0.5,
                (previousPoint.y + nextPoint.y) * 0.5,
              );
              const force = contourForces[blobIndex][pointIndex];

              velocity.x += (restPoint.x - point.x) * POINT_RETURN_STRENGTH;
              velocity.y += (restPoint.y - point.y) * POINT_RETURN_STRENGTH;
              velocity.x +=
                (smoothingTarget.x - point.x) * POINT_SMOOTH_STRENGTH;
              velocity.y +=
                (smoothingTarget.y - point.y) * POINT_SMOOTH_STRENGTH;
              velocity.x += force.x;
              velocity.y += force.y;
              velocity.x += node.vx * CENTER_VELOCITY_TRANSFER;
              velocity.y += node.vy * CENTER_VELOCITY_TRANSFER;
              velocity.x *= POINT_DAMPING;
              velocity.y *= POINT_DAMPING;
            });

            state.points.forEach((point, pointIndex) => {
              const velocity = state.velocities[pointIndex];
              point.x += velocity.x;
              point.y += velocity.y;
            });

            const currentAverageRadius = averageRadius(state.points);
            const radiusCorrection =
              ((state.restAverageRadius - currentAverageRadius) /
                state.restAverageRadius) *
              AREA_PRESERVE_STRENGTH;

            state.points.forEach((point) => {
              point.x += point.x * radiusCorrection;
              point.y += point.y * radiusCorrection;
            });

            const cluster = clusterRefs.current[blobIndex];

            if (cluster) {
              gsap.set(cluster, { x: node.x, y: node.y });
            }

            const ringSet = ringRefs.current[blobIndex] ?? [];

            ringSet.forEach((ring, ringIndex) => {
              if (!ring) {
                return;
              }

              const breatheAmount =
                RING_BREATHE_AMPLITUDE *
                Math.max(0.32, 1 - ringIndex * RING_BREATHE_FALLOFF);
              const breathePhase =
                (time / ecosystemConfigs[blobIndex].pulseDuration) *
                  Math.PI *
                  2 -
                ringIndex * RING_BREATHE_LAG;
              const breatheScale = 1 + Math.sin(breathePhase) * breatheAmount;

              const scaledPoints = state.points.map((point) =>
                createVec2(
                  point.x * ringConfig[ringIndex].scale * breatheScale,
                  point.y * ringConfig[ringIndex].scale * breatheScale,
                ),
              );

              ring.setAttribute("d", buildSmoothClosedPath(scaledPoints));
            });
          });

          if (mouseEffectTriggered && !hasLoggedMouseEffect) {
            console.log("footer mouse effect");
            hasLoggedMouseEffect = true;
          }

          animationFrameId = window.requestAnimationFrame(renderFrame);
        };

        renderFrame();
      };

      buildSystem();
      resizeObserver = new ResizeObserver(() => {
        buildSystem();
      });
      resizeObserver.observe(fieldRef.current);
    }, footerRef);

    return () => {
      simulation?.stop();
      resizeObserver?.disconnect();
      cleanupMouseMove?.();
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }

      ctx.revert();
    };
  }, []);

  return (
    <footer
      id="contact"
      ref={footerRef}
      className="mx-auto w-full max-w-[95rem] px-4 pb-10 pt-4 sm:px-6 lg:px-10"
    >
      <div
        className="relative min-h-[75rem] overflow-hidden rounded-[2.2rem] px-6 py-8 shadow-[0_20px_80px_rgba(20,18,16,0.1)] backdrop-blur-xl sm:px-8 sm:py-10 lg:px-10 lg:py-12"
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

        <div ref={fieldRef} className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.76]"
            style={{
              background:
                "radial-gradient(circle at 18% 22%, color-mix(in srgb, var(--hero-accent) 10%, transparent) 0%, transparent 34%), radial-gradient(circle at 78% 18%, color-mix(in srgb, var(--hero-accent) 7%, transparent) 0%, transparent 28%), radial-gradient(circle at 52% 78%, color-mix(in srgb, var(--hero-accent) 9%, transparent) 0%, transparent 32%)",
            }}
          />

          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 1000 600"
            preserveAspectRatio="none"
          >
            {ecosystemConfigs.map((config, clusterIndex) => (
              <g
                key={`footer-blob-${clusterIndex}`}
                ref={(node) => {
                  clusterRefs.current[clusterIndex] = node;
                }}
              >
                {ringConfig.map((ring, ringIndex) => (
                  <path
                    key={`${clusterIndex}-${ring.scale}`}
                    ref={(node) => {
                      ringRefs.current[clusterIndex][ringIndex] = node;
                    }}
                    d={blobPath}
                    fill="none"
                    vectorEffect="non-scaling-stroke"
                    strokeWidth={ring.strokeWidth}
                    opacity={ring.opacity}
                    style={{
                      stroke:
                        ringIndex === 0
                          ? `color-mix(in srgb, var(--hero-accent) ${Math.round(
                              config.strokeMix * 100,
                            )}%, var(--hero-text) 22%)`
                          : `color-mix(in srgb, var(--hero-accent) ${Math.round(
                              config.strokeMix * 62,
                            )}%, var(--hero-border) 78%)`,
                    }}
                  />
                ))}
              </g>
            ))}
          </svg>
        </div>

        <div className="relative z-10 flex min-h-[21rem] flex-col justify-between gap-12">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div className="space-y-5">
              <p
                data-footer-reveal
                className="text-[0.72rem] font-semibold uppercase tracking-[0.32em]"
                style={{ color: "var(--muted)" }}
              >
                Contact
              </p>

              <h2
                data-footer-reveal
                className="max-w-4xl text-3xl font-black uppercase leading-[0.95] tracking-[-0.06em] sm:text-5xl lg:text-6xl"
                style={{ color: "var(--hero-text)" }}
              >
                Let&apos;s build something strange, smooth, and impossible to
                ignore.
              </h2>

              <Text
                data-footer-reveal
                className="max-w-2xl text-sm leading-7 sm:text-base"
                style={{ color: "var(--hero-text-muted)" }}
              >
                Open to product engineering, creative frontend systems, AI-led
                interfaces, and cinematic web experiences that still ship
                cleanly.
              </Text>
            </div>

            <div
              data-footer-reveal
              className="justify-self-start rounded-[1.8rem] p-5 backdrop-blur-xl lg:justify-self-end"
              style={{
                background: "var(--hero-panel-bg)",
                border: "1px solid var(--hero-border)",
              }}
            >
              <Text
                className="text-[0.68rem] font-semibold uppercase tracking-[0.3em]"
                style={{ color: "var(--muted)" }}
              >
                Next Move
              </Text>
              <Text
                className="mt-3 max-w-xs text-sm leading-7"
                style={{ color: "var(--hero-text-muted)" }}
              >
                Available for ambitious contracts, experimental builds, and
                product collaborations that want both polish and personality.
              </Text>
            </div>
          </div>

          <div
            className="flex flex-col gap-6 border-t pt-6 sm:flex-row sm:items-end sm:justify-between"
            style={{ borderColor: "var(--hero-border)" }}
          >
            <Group data-footer-reveal gap="sm" className="flex-wrap">
              {footerLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.26em] transition-colors duration-300"
                  style={{
                    color: "var(--hero-text)",
                    background: "var(--hero-panel-bg)",
                    border: "1px solid var(--hero-border)",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Group>

            <Text
              data-footer-reveal
              className="text-[0.72rem] font-semibold uppercase tracking-[0.3em]"
              style={{ color: "var(--muted)" }}
            >
              Portfolio system / 2026
            </Text>
          </div>
        </div>
      </div>
    </footer>
  );
}
