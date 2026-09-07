"use client";

import { useMantineColorScheme } from "@mantine/core";

import {
  forceLink,
  forceSimulation,
  forceX,
  forceY,
  SimulationLinkDatum,
  SimulationNodeDatum,
} from "d3-force";

import { useEffect, useRef } from "react";

import * as THREE from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// const sharkModelUrl = new URL(
//   "../../assets/shark.glb",
//   import.meta.url,
// ).toString();

const GRID_TARGET_GAP_X = 20; // preferred horizontal spacing between dots
const GRID_TARGET_GAP_Y = 20; // preferred vertical spacing between dots
const GRID_MIN_COLS = 18; // never build a grid smaller than this horizontally
const GRID_MIN_ROWS = 12; // never build a grid smaller than this vertically
const GRID_PADDING_X = 0; // empty space on left/right edges (px)
const GRID_PADDING_Y = 0; // empty space on top/bottom edges (px)
const EDGE_BOW_X = 0; // barrel-distort grid left/right (0 = flat)
const EDGE_BOW_Y = 0; // barrel-distort grid top/bottom (0 = flat)

const LINK_STRENGTH = 0.2; // spring stiffness between connected nodes
const HOME_STRENGTH = 0.2; // how hard nodes pull back to their rest position
const VELOCITY_DECAY = 0.14; // friction — 14% velocity lost per tick
const ALPHA_DECAY = 0.08; // how fast the simulation cools between disturbances
const ALPHA_MIN = 0.002; // simulation freezes when alpha drops below this

const RIPPLE_ALPHA_TARGET = 0.18; // energy injected when user clicks
const RIPPLE_SPEED = 420; // px/sec the wave front travels outward
const RIPPLE_WIDTH = 64; // thickness of the wave band in px
const RIPPLE_STRENGTH = 10.2; // how hard the wave pushes grid nodes
const RIPPLE_DECAY = 1.8; // exponential fade rate (higher = faster fade)
const RIPPLE_MAX_AGE = 1.35; // seconds before ripple is removed

const NODE_RADIUS = 1.8; // dot radius in px
const LINE_WIDTH = 1; // connector line width in px
const NODE_COLOR = "rgba(255,255,255,0.18)"; // dot color in dark mode
const LINE_COLOR = "transparent"; // lines hidden (set a color to show grid)
const BACKGROUND = "transparent"; // canvas background

// GridNode — one dot on the canvas grid
// Extends D3's SimulationNodeDatum so D3 can own x/y/vx/vy
type GridNode = SimulationNodeDatum & {
  id: string; // unique key like "12-34" (row-col)
  row: number;
  col: number;
  homeX: number; // rest position — node springs back here
  homeY: number;
  x: number; // current position (D3 writes this)
  y: number;
  vx: number; // current velocity (D3 writes this)
  vy: number;
};

type GridLink = SimulationLinkDatum<GridNode> & {
  source: string | GridNode;
  target: string | GridNode;
  distance: number; // natural (rest) length of this spring
};

// Ripple — a circular wave event
type Ripple = {
  x: number; // origin in canvas px
  y: number;
  startTime: number; // performance.now() / 1000 at creation
};

type RippleForce = ((alpha: number) => void) & {
  initialize: (nodes: GridNode[]) => void;
};

// Point — simple 2D coordinate
type Point = { x: number; y: number };

// SharkPose — the shark's state at a given moment in time
type SharkPose = {
  x: number; // canvas px position
  y: number;
  angle: number; // heading in radians (atan2 of travel direction)
  wobble: number; // sine value used for body sway
};

type IBGProps = {
  className?: string;
};

// ─────────────────────────────────────────────────────────────
// PURE UTILITY FUNCTIONS
// These live outside the component so they're not re-created
// on every render
// ─────────────────────────────────────────────────────────────

// Euclidean distance between two nodes (using home positions)
// Used to set the natural rest length of each spring link
function distanceBetween(
  source: Pick<GridNode, "homeX" | "homeY">,
  target: Pick<GridNode, "homeX" | "homeY">,
) {
  return Math.hypot(target.homeX - source.homeX, target.homeY - source.homeY);
}

// Catmull-Rom spline interpolation between 4 control points
// p0..p3 are the surrounding waypoints, t is 0..1 between p1 and p2
// This gives smooth curved paths instead of straight line segments
function catmullRomPoint(
  point0: Point,
  point1: Point,
  point2: Point,
  point3: Point,
  t: number,
) {
  const t2 = t * t;
  const t3 = t2 * t;

  return {
    x:
      0.5 *
      (2 * point1.x +
        (-point0.x + point2.x) * t +
        (2 * point0.x - 5 * point1.x + 4 * point2.x - point3.x) * t2 +
        (-point0.x + 3 * point1.x - 3 * point2.x + point3.x) * t3),
    y:
      0.5 *
      (2 * point1.y +
        (-point0.y + point2.y) * t +
        (2 * point0.y - 5 * point1.y + 4 * point2.y - point3.y) * t2 +
        (-point0.y + 3 * point1.y - 3 * point2.y + point3.y) * t3),
  };
}

// Given a closed array of points and a 0..1 progress value,
// returns the interpolated position on the loop using Catmull-Rom
// Handles wrapping so the path loops seamlessly
function getLoopPoint(points: readonly Point[], progress: number) {
  const count = points.length;
  const wrapped = ((progress % 1) + 1) % 1; // ensure 0..1, handle negative
  const scaled = wrapped * count;
  const baseIndex = Math.floor(scaled);
  const t = scaled - baseIndex;

  // Grab the 4 surrounding points, wrapping around the array
  const point0 = points[(baseIndex - 1 + count) % count];
  const point1 = points[baseIndex % count];
  const point2 = points[(baseIndex + 1) % count];
  const point3 = points[(baseIndex + 2) % count];

  return catmullRomPoint(point0, point1, point2, point3, t);
}

// Build the grid of nodes and the spring links between them
// Called on mount and on resize
function createGrid(width: number, height: number) {
  const usableWidth = Math.max(width - GRID_PADDING_X * 2, 80);
  const usableHeight = Math.max(height - GRID_PADDING_Y * 2, 80);
  const gridCols = Math.max(
    GRID_MIN_COLS,
    Math.round(usableWidth / GRID_TARGET_GAP_X) + 1,
  );
  const gridRows = Math.max(
    GRID_MIN_ROWS,
    Math.round(usableHeight / GRID_TARGET_GAP_Y) + 1,
  );
  const nodes: GridNode[] = [];
  const links: GridLink[] = [];

  for (let row = 0; row < gridRows; row += 1) {
    for (let col = 0; col < gridCols; col += 1) {
      // u/v are normalized 0..1 positions across the grid
      const u = gridCols === 1 ? 0.5 : col / (gridCols - 1);
      const v = gridRows === 1 ? 0.5 : row / (gridRows - 1);

      // Base pixel position
      const baseX = GRID_PADDING_X + u * usableWidth;
      const baseY = GRID_PADDING_Y + v * usableHeight;

      // Optional barrel distortion — bows edges inward/outward
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

  // Helper to get a node by grid coordinates
  const nodeAt = (row: number, col: number) => nodes[row * gridCols + col];

  for (let row = 0; row < gridRows; row += 1) {
    for (let col = 0; col < gridCols; col += 1) {
      const source = nodeAt(row, col);

      // Horizontal link → right neighbour
      if (col < gridCols - 1) {
        const target = nodeAt(row, col + 1);
        links.push({
          source: source.id,
          target: target.id,
          distance: distanceBetween(source, target),
        });
      }

      // Vertical link → lower neighbour
      if (row < gridRows - 1) {
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
  // D3 passes the node array via initialize() before the first tick
  let nodes: GridNode[] = [];

  const force: RippleForce = (alpha: number) => {
    const now = performance.now() / 1000;

    // Iterate backwards so we can splice expired ripples safely
    for (
      let rippleIndex = ripples.length - 1;
      rippleIndex >= 0;
      rippleIndex -= 1
    ) {
      const ripple = ripples[rippleIndex];
      const age = now - ripple.startTime;

      // Remove old ripples
      if (age > RIPPLE_MAX_AGE) {
        ripples.splice(rippleIndex, 1);
        continue;
      }

      // Wave front position = age × speed
      const waveRadius = age * RIPPLE_SPEED;

      // Exponential amplitude fade
      const fade = Math.exp(-age * RIPPLE_DECAY);

      nodes.forEach((node) => {
        const dx = node.homeX - ripple.x;
        const dy = node.homeY - ripple.y;
        const distance = Math.hypot(dx, dy);

        // How far this node is from the wave front
        const bandDistance = Math.abs(distance - waveRadius);

        // Skip if too far from wave front or at the origin
        if (distance <= 0.001 || bandDistance >= RIPPLE_WIDTH) return;

        // Smooth falloff within the band (1 at wave front, 0 at edges)
        const band = 1 - bandDistance / RIPPLE_WIDTH;
        const strength = band * fade * RIPPLE_STRENGTH * alpha;

        // Push radially outward from ripple origin
        node.vx += (dx / distance) * strength;
        node.vy += (dy / distance) * strength;
      });
    }
  };

  // D3 calls this when the force is first registered
  force.initialize = (nextNodes: GridNode[]) => {
    nodes = nextNodes;
  };

  return force;
}

// ─────────────────────────────────────────────────────────────
// DISPOSE HELPER
// Walks a Three.js object tree and frees GPU memory.
// Must be called on cleanup to prevent memory leaks.
// ─────────────────────────────────────────────────────────────
function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    child.geometry.dispose();

    if (Array.isArray(child.material)) {
      child.material.forEach((material) => material.dispose());
    } else {
      child.material.dispose();
    }
  });
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────
export default function IBG({ className }: IBGProps) {
  // Three DOM refs:
  // containerRef  — the outer div, used for size measurements and event listeners
  // canvasRef     — the 2D canvas for the dot grid
  // threeMountRef — where Three.js appends its WebGL canvas
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const threeMountRef = useRef<HTMLDivElement | null>(null);

  const { colorScheme } = useMantineColorScheme();

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const threeMount = threeMountRef.current;

    if (!container || !canvas || !threeMount) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // ── State ──────────────────────────────────────────────
    // These are declared at the top of the effect so all
    // inner functions can close over them
    const ripples: Ripple[] = [];
    let simulation: ReturnType<typeof forceSimulation<GridNode>> | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let animationFrameId: number | null = null;
    let resizeFrameId: number | null = null;
    let liveNodes: GridNode[] = [];
    let liveLinks: GridLink[] = [];
    // let lastSharkRippleAt = -SHARK_RIPPLE_INTERVAL;
    let disposed = false; // flag to stop the rAF loop on cleanup

    // ── Three.js Setup ────────────────────────────────────
    const loader = new GLTFLoader();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true, // transparent background
      powerPreference: "high-performance",
    });

    // Enable clipping planes — required for waterPlane to work
    renderer.localClippingEnabled = true;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Size the renderer canvas to fill its mount div
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.pointerEvents = "auto";
    threeMount.appendChild(renderer.domElement);

    // ── Clipping Plane ────────────────────────────────────
    // This plane clips anything ABOVE Y=0 (the waterline).
    // Normal (0,-1,0) points downward — objects below the plane are visible,
    // objects above are clipped.
    // Constant 0 means the plane sits at Y=0 (world origin).
    // const waterPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.1);

    const waterGeometry = new THREE.PlaneGeometry();

    // ── Camera ────────────────────────────────────────────
    // Top-down view. camera.up = (0,0,-1) because we're looking
    // straight down — "up" on screen is -Z in world space
    camera.position.set(0, 15, 0.01);
    camera.up.set(0, 0, -1);
    camera.lookAt(0, 0, 0);

    // ── Orbit Controls ────────────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.minDistance = 7;
    controls.maxDistance = 28;
    controls.minPolarAngle = 0.02;
    controls.maxPolarAngle = 0.78; // can't go below horizon
    controls.target.set(0, 0, 0);
    controls.update();

    const ambientLight = new THREE.AmbientLight(
      colorScheme === "dark" ? "#ffffff" : "#ffffff",
      colorScheme === "dark" ? 1.6 : 1.3,
    );
    const hemiLight = new THREE.HemisphereLight(
      colorScheme === "dark" ? "#d7e6ff" : "#f0f0f0", // sky color
      colorScheme === "dark" ? "#162036" : "#8a8a8a", // ground color
      colorScheme === "dark" ? 1.05 : 0.8,
    );
    const keyLight = new THREE.DirectionalLight(
      colorScheme === "dark" ? "#f0f7ff" : "#ffffff",
      colorScheme === "dark" ? 1.8 : 1.4,
    );
    keyLight.position.set(4, 10, 6);

    const fillLight = new THREE.DirectionalLight(
      colorScheme === "dark" ? "#8ba7d6" : "#8c8c8c",
      colorScheme === "dark" ? 0.95 : 0.7,
    );
    fillLight.position.set(-6, 5, -4);

    // ─────────────────────────────────────────────────────
    // DRAW — renders the 2D canvas dot grid
    // Called every frame after D3 updates node positions
    // ─────────────────────────────────────────────────────
    const draw = (nodes: GridNode[], links: GridLink[]) => {
      const bounds = container.getBoundingClientRect();
      const width = bounds.width;
      const height = bounds.height;

      context.clearRect(0, 0, width, height);
      context.fillStyle = BACKGROUND;
      context.fillRect(0, 0, width, height);

      // Draw spring links (currently transparent)
      context.beginPath();
      context.lineWidth = LINE_WIDTH;
      context.strokeStyle = LINE_COLOR;

      links.forEach((link) => {
        const source = resolveLinkNode(link.source);
        const target = resolveLinkNode(link.target);
        if (!source || !target) return;
        context.moveTo(source.x, source.y);
        context.lineTo(target.x, target.y);
      });
      context.stroke();

      // Draw dots
      context.fillStyle =
        colorScheme === "dark" ? NODE_COLOR : "rgba(48,48,48,0.28)";

      nodes.forEach((node) => {
        context.beginPath();
        context.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
        context.fill();
      });
    };

    // ─────────────────────────────────────────────────────
    // RESIZE — syncs canvas and renderer size to container
    // Called on mount and whenever the container resizes
    // ─────────────────────────────────────────────────────
    const resizeVisuals = () => {
      const bounds = container.getBoundingClientRect();
      const width = Math.max(1, Math.round(bounds.width));
      const height = Math.max(1, Math.round(bounds.height));
      const dpr = window.devicePixelRatio ?? 1;

      // Scale canvas resolution for sharp rendering on HiDPI screens
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Resize WebGL renderer and update camera aspect ratio
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };

    // ─────────────────────────────────────────────────────
    // SPAWN RIPPLE
    // Creates a new ripple event and wakes the D3 simulation
    // alphaTarget controls how energetically the sim responds
    // ─────────────────────────────────────────────────────
    const spawnRipple = (x: number, y: number, alphaTarget: number) => {
      ripples.push({ x, y, startTime: performance.now() / 1000 });
      simulation?.alphaTarget(alphaTarget).restart();
    };

    // ─────────────────────────────────────────────────────
    // RENDER FRAME — the main animation loop
    // Runs every requestAnimationFrame (~60fps)
    // Order: D3 tick → shark animation → canvas draw → WebGL render
    // ─────────────────────────────────────────────────────
    const renderFrame = () => {
      if (disposed) return;

      const bounds = container.getBoundingClientRect();
      const elapsedSeconds = performance.now() / 1000;

      // ── Animate water surface vertices ──────────────────
      // Moves each vertex in Y by overlapping sine waves
      // creating the rippling water illusion
      if (bounds.width > 0 && bounds.height > 0) {
        const positions = waterGeometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          const z = positions.getZ(i);
          const wave =
            Math.sin(x * 0.8 + elapsedSeconds * 1.2) * 0.08 +
            Math.sin(z * 0.6 + elapsedSeconds * 0.9) * 0.06;
          positions.setY(i, wave);
        }
        // Tell Three.js the buffer changed so it reuploads to GPU
        positions.needsUpdate = true;
        // Recalculate normals so lighting looks correct after deformation
        waterGeometry.computeVertexNormals();
      }

      // ── Update orbit controls (applies damping) ──────────
      controls.update();

      // ── Draw canvas grid ──────────────────────────────────
      draw(liveNodes, liveLinks);

      // ── Render Three.js scene ─────────────────────────────
      renderer.render(scene, camera);

      // ── Schedule next frame ───────────────────────────────
      animationFrameId = window.requestAnimationFrame(renderFrame);
    };

    // ─────────────────────────────────────────────────────
    // REBUILD SIMULATION
    // Creates a fresh D3 simulation with a new grid.
    // Called on mount and on resize (ResizeObserver).
    // ─────────────────────────────────────────────────────
    const rebuildSimulation = () => {
      const bounds = container.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0) return;

      simulation?.stop();
      resizeVisuals();

      const { nodes, links } = createGrid(bounds.width, bounds.height);
      liveNodes = nodes;
      liveLinks = links;

      simulation = forceSimulation(nodes)
        .alphaDecay(ALPHA_DECAY)
        .alphaMin(ALPHA_MIN)
        .alphaTarget(0) // starts settled, wakes on disturbance
        .velocityDecay(VELOCITY_DECAY)
        .force(
          "link",
          forceLink<GridNode, GridLink>(links)
            .id((node) => node.id) // resolve string IDs to node objects
            .distance((link) => link.distance) // natural spring length
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
          // Once all ripples expire, stop injecting energy
          // so the simulation cools down and saves CPU
          if (ripples.length === 0) {
            simulation?.alphaTarget(0);
          }
        });

      draw(nodes, links);
    };

    // ─────────────────────────────────────────────────────
    // POINTER DOWN — spawn a ripple at click/touch position
    // ─────────────────────────────────────────────────────
    const handlePointerDown = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect();
      spawnRipple(
        event.clientX - bounds.left,
        event.clientY - bounds.top,
        RIPPLE_ALPHA_TARGET,
      );
    };

    // loader.load(
    //   sharkModelUrl,
    //   (gltf) => {
    //     // Check disposed in case component unmounted while loading
    //     if (disposed) {
    //       disposeObject(gltf.scene);
    //       return;
    //     }

    //     // Apply waterline clipping plane to every mesh in the model
    //     // This makes the shark appear submerged — only the dorsal fin
    //     // and back poke above Y=0
    //     gltf.scene.traverse((child) => {
    //       if (child instanceof THREE.Mesh) {
    //         if (Array.isArray(child.material)) {
    //           child.material.forEach((m) => {
    //             m.clippingPlanes = [waterPlane];
    //             m.clipShadows = true;
    //           });
    //         } else {
    //           child.material.clippingPlanes = [waterPlane];
    //           child.material.clipShadows = true;
    //         }
    //       }
    //     });

    //     const object = gltf.scene;
    //     const box = new THREE.Box3().setFromObject(object);
    //     const size = box.getSize(new THREE.Vector3());
    //     const center = box.getCenter(new THREE.Vector3());
    //     const maxAxis = Math.max(size.x, size.y, size.z) || 1;

    //     // Scale model so its longest axis = SHARK_TARGET_SIZE units
    //     const scaleFactor = SHARK_TARGET_SIZE / maxAxis;

    //     // Center the model at the rig's local origin
    //     object.position.sub(center);
    //     object.scale.setScalar(scaleFactor);
    //     sharkBodyPivot.add(object);
    //     currentModel = object;
    //   },
    //   undefined,
    //   (error) => {
    //     console.error("Failed to load shark model", error);
    //   },
    // );

    // ── Start everything ───────────────────────────────────
    rebuildSimulation();
    renderFrame();

    resizeObserver = new ResizeObserver(() => {
      if (resizeFrameId !== null) {
        window.cancelAnimationFrame(resizeFrameId);
      }

      resizeFrameId = window.requestAnimationFrame(() => {
        resizeFrameId = null;
        rebuildSimulation();
      });
    });
    resizeObserver.observe(container);
    container.addEventListener("pointerdown", handlePointerDown);

    // ─────────────────────────────────────────────────────
    // CLEANUP
    // Runs when component unmounts or colorScheme changes.
    // Must free all GPU resources and cancel all loops
    // to prevent memory leaks.
    // ─────────────────────────────────────────────────────
    return () => {
      disposed = true;

      simulation?.stop();
      resizeObserver?.disconnect();
      container.removeEventListener("pointerdown", handlePointerDown);

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
      if (resizeFrameId !== null) {
        window.cancelAnimationFrame(resizeFrameId);
      }

      controls.dispose();

      // Dispose renderer and remove its canvas from the DOM
      renderer.dispose();
      scene.clear();

      if (threeMount.contains(renderer.domElement)) {
        threeMount.removeChild(renderer.domElement);
      }
    };
  }, [colorScheme]);

  return (
    <div ref={containerRef} className={className ?? "absolute h-full w-full"}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div ref={threeMountRef} className="absolute inset-0" />
    </div>
  );
}
