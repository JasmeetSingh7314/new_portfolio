/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMantineColorScheme, useMantineTheme } from "@mantine/core";
import {
  forceLink,
  forceSimulation,
  forceX,
  forceY,
  SimulationLinkDatum,
  SimulationNodeDatum,
} from "d3-force";
import { useEffect, useRef } from "react";

const GRID_COLS = 100;
const GRID_ROWS = 59;
const GRID_PADDING_X = 0;
const GRID_PADDING_Y = 0;
const EDGE_BOW_X = 0;
const EDGE_BOW_Y = 0;
const LINK_STRENGTH = 0.2;
const HOME_STRENGTH = 0.2;
const VELOCITY_DECAY = 0.14;
const ALPHA_DECAY = 0.08;
const ALPHA_MIN = 0.002;
const RIPPLE_ALPHA_TARGET = 0.18;
const RIPPLE_SPEED = 420;
const RIPPLE_WIDTH = 64;
const RIPPLE_STRENGTH = 10.2;
const RIPPLE_DECAY = 1.8;
const RIPPLE_MAX_AGE = 1.35;
const NODE_RADIUS = 1.8;
const LINE_WIDTH = 1;
const NODE_COLOR = "rgba(255,255,255,0.18)";
const LINE_COLOR = "transparent";
const BACKGROUND = "transparent";

type GridNode = SimulationNodeDatum & {
  id: string;
  row: number;
  col: number;
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
};

type GridLink = SimulationLinkDatum<GridNode> & {
  source: string | GridNode;
  target: string | GridNode;
  distance: number;
};

type Ripple = {
  x: number;
  y: number;
  startTime: number;
};

type RippleForce = ((alpha: number) => void) & {
  initialize: (nodes: GridNode[]) => void;
};

type IBGProps = {
  className?: string;
};

function distanceBetween(
  source: Pick<GridNode, "homeX" | "homeY">,
  target: Pick<GridNode, "homeX" | "homeY">,
) {
  return Math.hypot(target.homeX - source.homeX, target.homeY - source.homeY);
}

function createGrid(width: number, height: number) {
  const usableWidth = Math.max(width - GRID_PADDING_X * 2, 80);
  const usableHeight = Math.max(height - GRID_PADDING_Y * 2, 80);
  const nodes: GridNode[] = [];
  const links: GridLink[] = [];

  for (let row = 0; row < GRID_ROWS; row += 1) {
    for (let col = 0; col < GRID_COLS; col += 1) {
      const u = GRID_COLS === 1 ? 0.5 : col / (GRID_COLS - 1);
      const v = GRID_ROWS === 1 ? 0.5 : row / (GRID_ROWS - 1);
      const baseX = GRID_PADDING_X + u * usableWidth;
      const baseY = GRID_PADDING_Y + v * usableHeight;
      const bowX = Math.sin(v * Math.PI) * (u - 0.5) * EDGE_BOW_X;
      const bowY = Math.sin(u * Math.PI) * (v - 0.5) * EDGE_BOW_Y;
      const homeX = baseX + bowX;
      const homeY = baseY + bowY;

      nodes.push({
        id: `${row}-${col}`,
        row,
        col,
        homeX,
        homeY,
        x: homeX,
        y: homeY,
        vx: 0,
        vy: 0,
      });
    }
  }

  const nodeAt = (row: number, col: number) => nodes[row * GRID_COLS + col];

  for (let row = 0; row < GRID_ROWS; row += 1) {
    for (let col = 0; col < GRID_COLS; col += 1) {
      const source = nodeAt(row, col);

      if (col < GRID_COLS - 1) {
        const target = nodeAt(row, col + 1);
        links.push({
          source: source.id,
          target: target.id,
          distance: distanceBetween(source, target),
        });
      }

      if (row < GRID_ROWS - 1) {
        const target = nodeAt(row + 1, col);
        links.push({
          source: source.id,
          target: target.id,
          distance: distanceBetween(source, target),
        });
      }
    }
  }

  return { nodes, links };
}

function resolveLinkNode(node: string | GridNode) {
  return typeof node === "string" ? null : node;
}

function createRippleForce(ripples: Ripple[]) {
  let nodes: GridNode[] = [];

  const force: RippleForce = (alpha: number) => {
    const now = performance.now() / 1000;

    for (
      let rippleIndex = ripples.length - 1;
      rippleIndex >= 0;
      rippleIndex -= 1
    ) {
      const ripple = ripples[rippleIndex];
      const age = now - ripple.startTime;

      if (age > RIPPLE_MAX_AGE) {
        ripples.splice(rippleIndex, 1);
        continue;
      }

      const waveRadius = age * RIPPLE_SPEED;
      const fade = Math.exp(-age * RIPPLE_DECAY);

      nodes.forEach((node) => {
        const dx = node.homeX - ripple.x;
        const dy = node.homeY - ripple.y;
        const distance = Math.hypot(dx, dy);
        const bandDistance = Math.abs(distance - waveRadius);

        if (distance <= 0.001 || bandDistance >= RIPPLE_WIDTH) {
          return;
        }

        const band = 1 - bandDistance / RIPPLE_WIDTH;
        const strength = band * fade * RIPPLE_STRENGTH * alpha;

        node.vx += (dx / distance) * strength;
        node.vy += (dy / distance) * strength;
      });
    }
  };

  force.initialize = (nextNodes: GridNode[]) => {
    nodes = nextNodes;
  };

  return force;
}

export default function IBG({ className }: IBGProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { colorScheme } = useMantineColorScheme();

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;

    if (!container || !canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const ripples: Ripple[] = [];
    let simulation: ReturnType<typeof forceSimulation<GridNode>> | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const draw = (nodes: GridNode[], links: GridLink[]) => {
      const bounds = container.getBoundingClientRect();
      const width = bounds.width;
      const height = bounds.height;

      context.clearRect(0, 0, width, height);
      context.fillStyle = BACKGROUND;
      context.fillRect(0, 0, width, height);

      context.beginPath();
      context.lineWidth = LINE_WIDTH;
      context.strokeStyle = LINE_COLOR;

      links.forEach((link) => {
        const source = resolveLinkNode(link.source);
        const target = resolveLinkNode(link.target);

        if (!source || !target) {
          return;
        }

        context.moveTo(source.x, source.y);
        context.lineTo(target.x, target.y);
      });

      context.stroke();

      context.fillStyle =
        colorScheme === "dark" ? NODE_COLOR : "rgb(242,90,90,1)";
      nodes.forEach((node) => {
        context.beginPath();
        context.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
        context.fill();
      });
    };

    const resizeCanvas = () => {
      const bounds = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio ?? 1;

      canvas.width = bounds.width * dpr;
      canvas.height = bounds.height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const rebuildSimulation = () => {
      const bounds = container.getBoundingClientRect();

      if (bounds.width === 0 || bounds.height === 0) {
        return;
      }

      simulation?.stop();
      resizeCanvas();

      const { nodes, links } = createGrid(bounds.width, bounds.height);

      simulation = forceSimulation(nodes)
        .alphaDecay(ALPHA_DECAY)
        .alphaMin(ALPHA_MIN)
        .alphaTarget(0)
        .velocityDecay(VELOCITY_DECAY)
        .force(
          "link",
          forceLink<GridNode, GridLink>(links)
            .id((node) => node.id)
            .distance((link) => link.distance)
            .strength(LINK_STRENGTH),
        )
        .force(
          "homeX",
          forceX<GridNode>((node) => node.homeX).strength(HOME_STRENGTH),
        )
        .force(
          "homeY",
          forceY<GridNode>((node) => node.homeY).strength(HOME_STRENGTH),
        )
        .force("ripple", createRippleForce(ripples))
        .on("tick", () => {
          if (ripples.length === 0) {
            simulation?.alphaTarget(0);
          }
          draw(nodes, links);
        });

      draw(nodes, links);
    };

    const handlePointerDown = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect();
      ripples.push({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
        startTime: performance.now() / 1000,
      });
      simulation?.alphaTarget(RIPPLE_ALPHA_TARGET).restart();
    };

    rebuildSimulation();

    resizeObserver = new ResizeObserver(() => {
      rebuildSimulation();
    });
    resizeObserver.observe(container);

    container.addEventListener("pointerdown", handlePointerDown);

    return () => {
      simulation?.stop();
      resizeObserver?.disconnect();
      container.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  return (
    <div ref={containerRef} className=" absolute w-full h-full">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
