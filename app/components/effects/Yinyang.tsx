"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3-force";

const YIN = "yin" as const;
const YANG = "yang" as const;
type NodeType = typeof YIN | typeof YANG;

type BallNode = {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

type YinYangGeometry = {
  cx: number;
  cy: number;
  radius: number;
  topCx: number;
  topCy: number;
  bottomCx: number;
  bottomCy: number;
  innerRadius: number;
};

const NODE_RADIUS_MIN = 8;
const NODE_RADIUS_MAX = 14;
const NODE_COUNT_EACH = 100;
const MOUSE_RADIUS = 800;
const MOUSE_STRENGTH = 1200;
const VELOCITY_DECAY = 0.18;
const ALPHA_DECAY = 0.08;
const ALPHA_MIN = 0.002;
const MOUSE_ALPHA_TARGET = 0.12;
const COLLIDE_PADDING = 1.8;
const COLLIDE_STRENGTH = 0.95;
const INITIAL_NODE_GAP = NODE_RADIUS_MAX * 2.25;
const BOUNDS_PADDING = 6;
const BOUNDS_BOUNCE = 0.6;

// negative = attraction, positive = repulsion
const SAME_ATTRACT = 0.055; // same color: soft spacing, not sticky clustering
const DIFF_ATTRACT = 0.02; // diff color: mild spacing as they interleave
const HARD_REPEL = 0.2; // everyone: hard bounce when physically overlapping
const REGION_PULL = 0.75;
const REGION_SNAP = 0.5;
function getGeometry(w: number, h: number): YinYangGeometry {
  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.min(w, h) * 0.38;
  const innerRadius = radius / 2;

  return {
    cx,
    cy,
    radius,
    topCx: cx,
    topCy: cy - innerRadius,
    bottomCx: cx,
    bottomCy: cy + innerRadius,
    innerRadius,
  };
}

function isInsideCircle(
  x: number,
  y: number,
  cx: number,
  cy: number,
  radius: number,
) {
  return Math.hypot(x - cx, y - cy) <= radius;
}

function isInRegion(
  type: NodeType,
  x: number,
  y: number,
  g: YinYangGeometry,
  nodeRadius = NODE_RADIUS_MAX,
) {
  const outerRadius = g.radius - nodeRadius * 0.55;
  const innerRadius = g.innerRadius - nodeRadius * 0.45;

  if (!isInsideCircle(x, y, g.cx, g.cy, outerRadius)) {
    return false;
  }

  const inTopCircle = isInsideCircle(x, y, g.topCx, g.topCy, innerRadius);
  const inBottomCircle = isInsideCircle(
    x,
    y,
    g.bottomCx,
    g.bottomCy,
    innerRadius,
  );

  const isWhiteRegion = !inBottomCircle && (x <= g.cx || inTopCircle);

  return type === YIN ? isWhiteRegion : !isWhiteRegion;
}

function getRegionAnchor(type: NodeType, g: YinYangGeometry) {
  if (type === YIN) {
    return {
      x: g.cx - g.radius * 0.24,
      y: g.cy - g.radius * 0.22,
    };
  }

  return {
    x: g.cx + g.radius * 0.24,
    y: g.cy + g.radius * 0.22,
  };
}

function projectIntoRegion(
  type: NodeType,
  x: number,
  y: number,
  g: YinYangGeometry,
  nodeRadius = NODE_RADIUS_MAX,
) {
  const anchor = getRegionAnchor(type, g);
  let projectedX = x;
  let projectedY = y;

  for (let step = 0; step < 18; step += 1) {
    if (isInRegion(type, projectedX, projectedY, g, nodeRadius)) {
      break;
    }

    projectedX += (anchor.x - projectedX) * 0.24;
    projectedY += (anchor.y - projectedY) * 0.24;
  }

  if (!isInRegion(type, projectedX, projectedY, g, nodeRadius)) {
    projectedX = anchor.x;
    projectedY = anchor.y;
  }

  return { x: projectedX, y: projectedY };
}

function makeNodes(
  count: number,
  type: NodeType,
  geometry: YinYangGeometry,
): BallNode[] {
  const minX = geometry.cx - geometry.radius;
  const maxX = geometry.cx + geometry.radius;
  const minY = geometry.cy - geometry.radius;
  const maxY = geometry.cy + geometry.radius;

  const nodes: BallNode[] = [];

  for (let i = 0; i < count; i += 1) {
    let x = geometry.cx;
    let y = geometry.cy;
    const radius =
      NODE_RADIUS_MIN + Math.random() * (NODE_RADIUS_MAX - NODE_RADIUS_MIN);

    for (let attempt = 0; attempt < 900; attempt += 1) {
      x = minX + Math.random() * (maxX - minX);
      y = minY + Math.random() * (maxY - minY);

      if (!isInRegion(type, x, y, geometry, radius)) {
        continue;
      }

      const hasNearbyNode = nodes.some(
        (node) =>
          Math.hypot(node.x - x, node.y - y) <
          Math.max(INITIAL_NODE_GAP, node.r + radius + COLLIDE_PADDING * 2),
      );

      if (!hasNearbyNode) {
        break;
      }
    }

    nodes.push({
      id: `${type}-${i}`,
      type,
      x,
      y,
      vx: 0,
      vy: 0,
      r: radius,
    });
  }

  return nodes;
}

export default function YinYang() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mouse = { x: -9999, y: -9999 };

    const onMove = (e: MouseEvent) => {
      const b = canvas.getBoundingClientRect();
      mouse.x = e.clientX - b.left;
      mouse.y = e.clientY - b.top;
      sim?.alphaTarget(MOUSE_ALPHA_TARGET).restart();
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
      sim?.alphaTarget(0);
    };

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    const W = () => canvas.getBoundingClientRect().width;
    const H = () => canvas.getBoundingClientRect().height;

    let sim: ReturnType<typeof d3.forceSimulation<BallNode>> | null = null;

    function resize() {
      const dpr = window.devicePixelRatio ?? 1;
      canvas.width = W() * dpr;
      canvas.height = H() * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(nodes: BallNode[]) {
      const w = W(),
        h = H();
      const geometry = getGeometry(w, h);
      const cx = geometry.cx,
        cy = geometry.cy;
      const sr = geometry.radius;

      ctx.clearRect(0, 0, w, h);

      // ghost yin-yang symbol
      ctx.save();

      ctx.globalAlpha = 0.06;
      ctx.beginPath();
      ctx.arc(cx, cy, sr, Math.PI / 2, -Math.PI / 2, true);
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      ctx.globalAlpha = 0.06;
      ctx.beginPath();
      ctx.arc(cx, cy - sr / 2, sr / 2, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      ctx.globalAlpha = 0.1;
      ctx.beginPath();
      ctx.arc(cx, cy + sr / 2, sr / 2, 0, Math.PI * 2);
      ctx.fillStyle = "#000000";
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, sr, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();

      // balls
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);

        if (n.type === YIN) {
          ctx.fillStyle = "#f0f0f0";
          ctx.shadowColor = "rgba(240,240,240,0.35)";
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = "#1a1a1a";
          ctx.shadowBlur = 0;
          ctx.fill();
          ctx.strokeStyle = "rgba(255,255,255,0.22)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // mouse cursor ring
      if (mouse.x > 0) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 18, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.18)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.fill();
      }
    }

    function buildSim() {
      sim?.stop();

      const w = W(),
        h = H();
      const geometry = getGeometry(w, h);
      const nodes: BallNode[] = [
        ...makeNodes(NODE_COUNT_EACH, YIN, geometry),
        ...makeNodes(NODE_COUNT_EACH, YANG, geometry),
      ];

      // ── custom force ─────────────────────────────────────
      const customForce = (alpha: number) => {
        const geometry = getGeometry(W(), H());
        const forceScale = alpha;

        nodes.forEach((a, i) => {
          // mouse repels everyone equally
          const mdx = a.x - mouse.x;
          const mdy = a.y - mouse.y;
          const md = Math.hypot(mdx, mdy);
          if (md < MOUSE_RADIUS && md > 0.01) {
            const s = (1 - md / MOUSE_RADIUS) ** 2 * MOUSE_STRENGTH;
            a.vx += (mdx / md) * s * 0.016 * forceScale;
            a.vy += (mdy / md) * s * 0.016 * forceScale;
          }

          if (!isInRegion(a.type, a.x, a.y, geometry, a.r)) {
            const projected = projectIntoRegion(
              a.type,
              a.x,
              a.y,
              geometry,
              a.r,
            );
            a.vx += (projected.x - a.x) * REGION_PULL * forceScale;
            a.vy += (projected.y - a.y) * REGION_PULL * forceScale;
            a.x += (projected.x - a.x) * REGION_SNAP * forceScale;
            a.y += (projected.y - a.y) * REGION_SNAP * forceScale;
          }

          // pairwise
          nodes.forEach((b, j) => {
            if (j <= i) return;

            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.hypot(dx, dy) || 0.01;
            if (dist > 240) return;

            const nx = dx / dist;
            const ny = dy / dist;

            let force: number;

            if (dist < (a.r + b.r) * 1.1) {
              // physically overlapping — hard bounce regardless of color
              force = HARD_REPEL;
            } else if (a.type === b.type) {
              // same color — attract more strongly, form tight clusters
              force = SAME_ATTRACT / (dist * 0.4);
            } else {
              // different color — gentle attraction, they're curious not hostile
              // weaker than same-color so clusters still form but interweave softly
              force = DIFF_ATTRACT / (dist * 0.5);
            }

            const fx = nx * force * 0.016 * forceScale;
            const fy = ny * force * 0.016 * forceScale;
            a.vx += fx;
            a.vy += fy;
            b.vx -= fx;
            b.vy -= fy;
          });
        });
      };

      // ── bounds force — bounce off walls ──────────────────
      const boundsForce = () => {
        const w = W(),
          h = H();
        nodes.forEach((n) => {
          const minX = n.r + BOUNDS_PADDING;
          const maxX = w - n.r - BOUNDS_PADDING;
          const minY = n.r + BOUNDS_PADDING;
          const maxY = h - n.r - BOUNDS_PADDING;

          if (n.x < minX) {
            n.x = minX;
            n.vx = Math.abs(n.vx) * BOUNDS_BOUNCE;
          }
          if (n.x > maxX) {
            n.x = maxX;
            n.vx = -Math.abs(n.vx) * BOUNDS_BOUNCE;
          }
          if (n.y < minY) {
            n.y = minY;
            n.vy = Math.abs(n.vy) * BOUNDS_BOUNCE;
          }
          if (n.y > maxY) {
            n.y = maxY;
            n.vy = -Math.abs(n.vy) * BOUNDS_BOUNCE;
          }
        });
      };

      sim = d3
        .forceSimulation(nodes)
        .alphaDecay(ALPHA_DECAY)
        .alphaMin(ALPHA_MIN)
        .alphaTarget(0)
        .velocityDecay(VELOCITY_DECAY)
        .force(
          "collide",
          d3
            .forceCollide<BallNode>()
            .radius((node) => node.r + COLLIDE_PADDING)
            .strength(COLLIDE_STRENGTH)
            .iterations(3),
        )
        .force("custom", customForce)
        .force("bounds", boundsForce)
        .on("tick", () => draw(nodes));
    }

    resize();
    buildSim();

    const onResize = () => {
      resize();
      buildSim();
    };
    window.addEventListener("resize", onResize);

    return () => {
      sim?.stop();
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "700px",
          height: "520px",
          cursor: "none",
          borderRadius: "12px",
          //   background: "#111",
        }}
      />

      {/* <div
        className="flex flex-wrap gap-6 justify-center text-sm"
        style={{ color: "var(--color-text-secondary)" }}
      >
        <span className="flex items-center gap-2">
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#f0f0f0",
              display: "inline-block",
            }}
          />
          Yin — clusters with white, curious about Yang
        </span>
        <span className="flex items-center gap-2">
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#222",
              border: "1px solid #666",
              display: "inline-block",
            }}
          />
          Yang — clusters with black, curious about Yin
        </span>
        <span className="flex items-center gap-2">
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              display: "inline-block",
            }}
          />
          Mouse scatters both
        </span>
      </div> */}
    </div>
  );
}
