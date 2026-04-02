"use client";
import React, { useEffect, useRef } from "react";
import * as d3 from "d3-force";

const IBGHandcrafted = () => {
  //Writing  handler functions

  const YIN = "yin" as const;
  const YANG = "yang" as const;
  type NodeType = typeof YIN | typeof YANG;
  const MASK_BLOCKED = 0;
  const MASK_YIN = 1;
  const MASK_YANG = 2;

  type BallNode = {
    id: string;
    type: NodeType;
    kind: "master" | "particle";
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
  };

  type ContainerCircle = {
    cx: number; //center for the big circle
    cy: number; // center for the big circle
    radius: number; //radius for the big circle
    topCx: number;
    topCy: number;
    bottomCx: number;
    bottomCy: number;
    innerRadius: number;
  };
  type RegionMask = {
    width: number;
    height: number;
    data: Uint8Array;
  };
  const NODE_RADIUS_MIN = 6;
  const NODE_RADIUS_MAX = 12;
  const NODE_COUNT_EACH = 150;
  const MOUSE_RADIUS = 200;
  const MOUSE_STRENGTH = 1200;
  const VELOCITY_DECAY = 0.3;
  const ALPHA_DECAY = 0.08;
  const ALPHA_MIN = 0.002;
  const MOUSE_ALPHA_TARGET = 0.12;
  const COLLIDE_PADDING = 0.8;
  const COLLIDE_STRENGTH = 0.2;
  const INITIAL_NODE_GAP = NODE_RADIUS_MAX * 2.25;
  const BOUNDS_PADDING = 0.1;
  const BOUNDS_BOUNCE = 0.05;

  // negative = attraction, positive = repulsion
  const SAME_ATTRACT = 0.055; // same color: soft spacing, not sticky clustering
  const DIFF_ATTRACT = 0.02; // diff color: mild spacing as they interleave
  const HARD_REPEL = 0.2; // everyone: hard bounce when physically overlapping

  const REGION_PULL = 0.75;
  const REGION_SNAP = 0.5;
  const MASK_SAMPLE_PADDING = 1.25;
  const MASTER_RADIUS_SCALE = 1 / 3;
  const MASTER_LOCK_STRENGTH = 1.18;
  const MASTER_LOCK_SNAP = 0.24;

  const getGeometry = (w: number, h: number): ContainerCircle => {
    const cx = w / 2;
    const cy = h / 2;

    const radius = Math.min(w, h) * 0.38;

    const innerRadius = radius / 2;

    return {
      cx: cx,
      cy: cy,
      radius: radius,
      topCx: cx,
      topCy: cy - innerRadius,
      bottomCx: cx,
      bottomCy: cy + innerRadius,
      innerRadius: innerRadius,
    };
  };
  const isInsideCircle = (
    x: number,
    y: number,
    cx: number,
    cy: number,
    radius: number,
  ) => {
    return Math.hypot(x - cx, y - cy) <= radius;
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const regionMaskRef = useRef<RegionMask | null>(null);

  const buildYinYangPaths = (g: ContainerCircle) => {
    const whitePath = new Path2D();
    const outerPath = new Path2D();
    const dotRadius = g.radius / 6;

    outerPath.arc(g.cx, g.cy, g.radius, 0, Math.PI * 2);

    whitePath.moveTo(g.cx, g.cy - g.radius);
    whitePath.arc(g.cx, g.cy, g.radius, -Math.PI / 2, Math.PI / 2, false);
    whitePath.arc(
      g.bottomCx,
      g.bottomCy,
      g.innerRadius,
      Math.PI / 2,
      -Math.PI / 2,
      true,
    );
    whitePath.arc(
      g.topCx,
      g.topCy,
      g.innerRadius,
      Math.PI / 2,
      -Math.PI / 2,
      false,
    );
    whitePath.closePath();

    return {
      outerPath,
      whitePath,
      dotRadius,
    };
  };

  const buildRegionMask = (
    width: number,
    height: number,
    g: ContainerCircle,
  ) => {
    const maskWidth = Math.max(1, Math.round(width));
    const maskHeight = Math.max(1, Math.round(height));
    const data = new Uint8Array(maskWidth * maskHeight);
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = maskWidth;
    maskCanvas.height = maskHeight;
    const maskCtx = maskCanvas.getContext("2d");

    if (!maskCtx) {
      regionMaskRef.current = {
        width: maskWidth,
        height: maskHeight,
        data,
      };
      return;
    }

    const { outerPath, whitePath, dotRadius } = buildYinYangPaths(g);
    maskCtx.clearRect(0, 0, maskWidth, maskHeight);
    maskCtx.fillStyle = "#000000";
    maskCtx.fill(outerPath);
    maskCtx.fillStyle = "#ffffff";
    maskCtx.fill(whitePath);

    maskCtx.fillStyle = "#000000";
    maskCtx.beginPath();
    maskCtx.arc(g.topCx, g.topCy, dotRadius, 0, Math.PI * 2);
    maskCtx.fill();

    maskCtx.fillStyle = "#ffffff";
    maskCtx.beginPath();
    maskCtx.arc(g.bottomCx, g.bottomCy, dotRadius, 0, Math.PI * 2);
    maskCtx.fill();

    const pixels = maskCtx.getImageData(0, 0, maskWidth, maskHeight).data;

    for (let index = 0; index < maskWidth * maskHeight; index += 1) {
      const alpha = pixels[index * 4 + 3];
      const red = pixels[index * 4];
      data[index] =
        alpha === 0 ? MASK_BLOCKED : red > 127 ? MASK_YIN : MASK_YANG;
    }

    regionMaskRef.current = {
      width: maskWidth,
      height: maskHeight,
      data,
    };
  };

  const readMask = (x: number, y: number) => {
    const mask = regionMaskRef.current;

    if (!mask) {
      return MASK_BLOCKED;
    }

    const ix = Math.round(x);
    const iy = Math.round(y);

    if (ix < 0 || iy < 0 || ix >= mask.width || iy >= mask.height) {
      return MASK_BLOCKED;
    }

    return mask.data[iy * mask.width + ix];
  };

  const isInRegion = (
    type: NodeType,
    x: number,
    y: number,
    g: ContainerCircle,
    nodeRadius: number,
  ) => {
    const expectedMask = type === YIN ? MASK_YIN : MASK_YANG;
    const sampleRadius = nodeRadius + MASK_SAMPLE_PADDING;
    const diagonalRadius = sampleRadius * 0.707;
    const samples = [
      [x, y],
      [x - sampleRadius, y],
      [x + sampleRadius, y],
      [x, y - sampleRadius],
      [x, y + sampleRadius],
      [x - diagonalRadius, y - diagonalRadius],
      [x + diagonalRadius, y - diagonalRadius],
      [x - diagonalRadius, y + diagonalRadius],
      [x + diagonalRadius, y + diagonalRadius],
    ] as const;

    return samples.every(([sx, sy]) => readMask(sx, sy) === expectedMask);
  };

  function getRegionAnchor(type: NodeType, g: ContainerCircle) {
    if (type === YIN) {
      return {
        x: g.cx + g.innerRadius * 0.16,
        y: g.cy - g.innerRadius * 0.72,
      };
    }

    return {
      x: g.cx - g.innerRadius * 0.16,
      y: g.cy + g.innerRadius * 0.72,
    };
  }

  function projectIntoRegion(
    type: NodeType,
    x: number,
    y: number,
    g: ContainerCircle,
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

  const makeNodes = (
    count: number,
    type: NodeType,
    geometry: ContainerCircle,
    existingNodes: BallNode[] = [],
  ) => {
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

        const occupiedNodes = [...existingNodes, ...nodes];
        const hasNearbyNode = occupiedNodes.some(
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
        kind: "particle",
        x,
        y,
        vx: 0,
        vy: 0,
        r: radius,
      });
    }
    return nodes;
  };

  useEffect(() => {
    //get the ref for the DOM element
    const canvas = canvasRef.current;

    //return if no dorm element
    if (!canvas) return;

    //lets draw
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    //simulation for mouse
    //entering fake position so mouse is nowhere near
    const mouse = { x: -99999, y: -99999 };
    //we have to FAKE the mouse position so the actual clientX positions dont haunt us for no reason
    const onMove = (e: MouseEvent) => {
      const b = canvas.getBoundingClientRect();
      mouse.x = e.clientX - b.left;
      mouse.y = e.clientY - b.top;
      sim?.alphaTarget(MOUSE_ALPHA_TARGET).restart();
    };

    const onLeave = (e: MouseEvent) => {
      mouse.x = -9999;
      mouse.y = -9999;
      sim?.alphaTarget(0);
    };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    function resize() {
      const dpr = window.devicePixelRatio ?? 1;
      canvas.width = W() * dpr;
      canvas.height = H() * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildRegionMask(W(), H(), getGeometry(W(), H()));
    }

    const W = () => canvas.getBoundingClientRect().width;
    const H = () => canvas.getBoundingClientRect().height;

    const draw = (nodes: BallNode[]) => {
      const w = W();
      const h = H();

      const geometry = getGeometry(w, h);

      const cx = geometry.cx;
      const cy = geometry.cy;

      const cr = geometry.radius;
      const { outerPath, whitePath, dotRadius } = buildYinYangPaths(geometry);
      //clear before each render
      ctx.clearRect(0, 0, w, h);

      //save the new state
      ctx.save();

      ctx.fillStyle = "rgba(18,18,18,0.72)";
      ctx.fill(outerPath);
      ctx.fillStyle = "rgba(255,255,255,0.16)";
      ctx.fill(whitePath);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.stroke(outerPath);
      ctx.strokeStyle = "rgba(255,255,255,0.22)";
      ctx.lineWidth = 0.6;
      ctx.stroke(whitePath);

      ctx.fillStyle = "#090909";
      ctx.beginPath();
      ctx.arc(geometry.topCx, geometry.topCy, dotRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#f3f3f3";
      ctx.beginPath();
      ctx.arc(geometry.bottomCx, geometry.bottomCy, dotRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

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
    };
    // create the sim object
    let sim: ReturnType<typeof d3.forceSimulation<BallNode>> | null = null;
    function buildSim() {
      //stop any existing simulation
      sim?.stop();
      //get canvas width and height
      const w = W();
      const h = H();

      const geometry = getGeometry(w, h);

      const masters: BallNode[] = [
        {
          id: "master-yang",
          type: YANG,
          kind: "master",
          x: geometry.topCx,
          y: geometry.topCy,
          vx: 0,
          vy: 0,
          r: geometry.innerRadius * MASTER_RADIUS_SCALE,
        },
        {
          id: "master-yin",
          type: YIN,
          kind: "master",
          x: geometry.bottomCx,
          y: geometry.bottomCy,
          vx: 0,
          vy: 0,
          r: geometry.innerRadius * MASTER_RADIUS_SCALE,
        },
      ];
      const yinParticles = makeNodes(NODE_COUNT_EACH, YIN, geometry, masters);
      const yangParticles = makeNodes(NODE_COUNT_EACH, YANG, geometry, [
        ...masters,
        ...yinParticles,
      ]);
      const nodes: BallNode[] = [...masters, ...yinParticles, ...yangParticles];

      const customForce = (alpha: number) => {
        //alpha is energy level
        const geometry = getGeometry(W(), H());
        const forceScale = alpha;

        nodes.forEach((a, i) => {
          if (a.kind === "master") {
            const targetX = a.type === YIN ? geometry.bottomCx : geometry.topCx;
            const targetY = a.type === YIN ? geometry.bottomCy : geometry.topCy;
            a.vx += (targetX - a.x) * MASTER_LOCK_STRENGTH * forceScale;
            a.vy += (targetY - a.y) * MASTER_LOCK_STRENGTH * forceScale;
            a.x += (targetX - a.x) * MASTER_LOCK_SNAP * forceScale;
            a.y += (targetY - a.y) * MASTER_LOCK_SNAP * forceScale;
            return;
          }
          //a is for every ball and i is the index
          //mouse repels everything equally doesnt discriminate between white and black balls
          const mdx = a.x - mouse.x; //diff between mouse x coordinate (the fake one) and the ball
          const mdy = a.y - mouse.y; //diff but for the y coordinate

          const md = Math.hypot(mdx, mdy); //distance between them

          if (md < MOUSE_RADIUS && md > 0.01) {
            const s = (1 - md / MOUSE_RADIUS) ** 2 * MOUSE_STRENGTH; //Calculate the force exerted!
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
          nodes.forEach((b, j) => {
            if (j <= i) return;

            const dx = a.x - b.x; //dist between ball A and B
            const dy = a.y - b.y; //dist between Ball A and B
            const dist = Math.hypot(dx, dy) || 0.01; //vector distance between the two

            if (dist > 240) return;

            const nx = dx / dist;
            const ny = dy / dist;

            let force: number;

            if (a.kind === "master" || b.kind === "master") {
              if (dist >= a.r + b.r + COLLIDE_PADDING * 1.5) {
                return;
              }
              force = HARD_REPEL * 1.6;
            } else if (dist < (a.r + b.r) * 1.1) {
              force = HARD_REPEL;
            } else if (a.type === b.type) {
              //if same type then place a force which decreases with distance
              force = SAME_ATTRACT / (dist * 0.4);
            } else {
              //if different deecrease with it a distance but different colors
              force = DIFF_ATTRACT / (dist * 0.5);
            }

            const fx = nx * force * 0.016 * forceScale;
            const fy = ny * force * 0.016 * forceScale;

            //updating distances
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
    //Make some BALLS
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
    <section className="flex flex-col gap-3">
      {" "}
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "720px",
          height: "500px",
          // cursor: "none",
          borderRadius: "12px",
        }}
      />
    </section>
  );
};

export default IBGHandcrafted;
