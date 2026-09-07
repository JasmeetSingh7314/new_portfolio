/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMantineColorScheme } from "@mantine/core";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const sakuraModelUrl = new URL(
  "../assets/cc0___sakura_cherry_blossom.glb",
  import.meta.url,
).toString();

const dragonModelUrl = new URL(
  "../assets/dragon_with_pearl.glb",
  import.meta.url,
).toString();

const MODEL_CONFIG = {
  light: {
    url: sakuraModelUrl,
    targetSize: 12,
    zoom: 0.2,
    position: new THREE.Vector3(2.3, -3.2, 0),
    rotationY: Math.PI * 12,
    autoRotateSpeed: 0,
  },
  dark: {
    url: dragonModelUrl,
    targetSize: 200,
    zoom: 0.4,
    position: new THREE.Vector3(0, -45.45, -23.5),
    rotationY: -Math.PI * 0.2,
    autoRotateSpeed: 0,
  },
} as const;

type ThemeMode = keyof typeof MODEL_CONFIG;
type Vector3Tuple = [number, number, number];

const SCENE_CONFIG = {
  light: {
    exposure: 1.05,
    fog: null,
    floatAmplitude: 0.12,
    floatSpeed: 0.8,
    ambient: {
      color: "#ffffff",
      intensity: 1.8,
    },
    hemisphere: {
      skyColor: "#f0f0f0",
      groundColor: "#9a9a9a",
      intensity: 1.1,
    },
    key: {
      color: "#f8f8f8",
      intensity: 2.2,
      position: [4, 6, 7] satisfies Vector3Tuple,
    },
    fill: {
      color: "#aaaaaa",
      intensity: 1.2,
      position: [-5, 2, 5] satisfies Vector3Tuple,
    },
    rim: {
      color: "#d0d0d0",
      intensity: 1.5,
      position: [0, 3, -4] satisfies Vector3Tuple,
      distance: 24,
    },
  },
  dark: {
    exposure: 1.1,
    fog: {
      color: "#050505",
      near: 10,
      far: 22,
    },
    floatAmplitude: 0.12,
    floatSpeed: 0.8,
    ambient: {
      color: "#ffffff",
      intensity: 1.15,
    },
    hemisphere: {
      skyColor: "#eff5fb",
      groundColor: "#495360",
      intensity: 0.95,
    },
    key: {
      color: "#edf2f8",
      intensity: 2.2,
      position: [4, 6, 7] satisfies Vector3Tuple,
    },
    fill: {
      color: "#7f91a9",
      intensity: 1.1,
      position: [-5, 2, 5] satisfies Vector3Tuple,
    },
    rim: {
      color: "#dce7f8",
      intensity: 2,
      position: [0, 3, -4] satisfies Vector3Tuple,
      distance: 24,
    },
  },
} as const;

function disposeObject(object: THREE.Object3D) {
  object.traverse((child: { geometry: { dispose: () => void; }; material: { forEach: (arg0: (material: { dispose: () => any; }) => any) => void; dispose: () => void; }; }) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();

      if (Array.isArray(child.material)) {
        child.material.forEach((material: { dispose: () => any; }) => material.dispose());
      } else {
        child.material.dispose();
      }
    }
  });
}

function disposeMaterial(material: THREE.Material | THREE.Material[]) {
  if (Array.isArray(material)) {
    material.forEach((entry) => entry.dispose());
    return;
  }

  material.dispose();
}

export default function BannerModel() {
  const { colorScheme } = useMantineColorScheme();
  const themeMode: ThemeMode = colorScheme === "dark" ? "dark" : "light";
  const activeSceneConfig = SCENE_CONFIG[themeMode];
  const [mounted, setMounted] = useState(false);

  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const currentModelRef = useRef<THREE.Object3D | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const frameRef = useRef<number | null>(null);
  const timerRef = useRef<THREE.Timer | null>(null);
  const loader = useMemo(() => new GLTFLoader(), []);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !mountRef.current) {
      return;
    }

    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0.35, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = activeSceneConfig.exposure;

    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    mount.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(
      activeSceneConfig.ambient.color,
      activeSceneConfig.ambient.intensity,
    );
    const hemiLight = new THREE.HemisphereLight(
      activeSceneConfig.hemisphere.skyColor,
      activeSceneConfig.hemisphere.groundColor,
      activeSceneConfig.hemisphere.intensity,
    );
    const keyLight = new THREE.DirectionalLight(
      activeSceneConfig.key.color,
      activeSceneConfig.key.intensity,
    );
    keyLight.position.set(...activeSceneConfig.key.position);

    const fillLight = new THREE.DirectionalLight(
      activeSceneConfig.fill.color,
      activeSceneConfig.fill.intensity,
    );
    fillLight.position.set(...activeSceneConfig.fill.position);

    const rimLight = new THREE.PointLight(
      activeSceneConfig.rim.color,
      activeSceneConfig.rim.intensity,
      activeSceneConfig.rim.distance,
    );
    rimLight.position.set(...activeSceneConfig.rim.position);

    const modelGroup = new THREE.Group();
    scene.add(
      ambientLight,
      hemiLight,
      keyLight,
      fillLight,
      rimLight,
      modelGroup,
    );

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    modelGroupRef.current = modelGroup;
    timerRef.current = new THREE.Timer();
    timerRef.current.connect(document);
    timerRef.current.reset();

    const resize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) {
        return;
      }

      const { clientWidth, clientHeight } = mountRef.current;
      rendererRef.current.setSize(clientWidth, clientHeight, false);
      cameraRef.current.aspect = clientWidth / Math.max(clientHeight, 1);
      cameraRef.current.updateProjectionMatrix();
    };

    const tick = (timestamp?: number) => {
      timerRef.current?.update(timestamp);
      const delta = timerRef.current?.getDelta() ?? 0;
      const elapsed = timerRef.current?.getElapsed() ?? 0;

      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      if (modelGroupRef.current) {
        modelGroupRef.current.rotation.y +=
          MODEL_CONFIG[themeMode].autoRotateSpeed;
        modelGroupRef.current.position.y =
          Math.sin(elapsed * activeSceneConfig.floatSpeed) *
          activeSceneConfig.floatAmplitude;
      }

      renderer.render(scene, camera);
      frameRef.current = window.requestAnimationFrame(tick);
    };

    resize();
    tick();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    return () => {
      resizeObserver.disconnect();

      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }

      mixerRef.current?.stopAllAction();

      if (currentModelRef.current) {
        disposeObject(currentModelRef.current);
      }

      timerRef.current?.dispose();
      timerRef.current = null;

      scene.clear();
      renderer.dispose();

      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [activeSceneConfig, loader, mounted, themeMode]);

  useEffect(() => {
    if (!mounted || !sceneRef.current || !modelGroupRef.current) {
      return;
    }

    const scene = sceneRef.current;
    const modelGroup = modelGroupRef.current;
    const camera = cameraRef.current;
    const activeConfig = MODEL_CONFIG[themeMode];
    const sceneConfig = SCENE_CONFIG[themeMode];
    setStatus("loading");

    if (currentModelRef.current) {
      modelGroup.remove(currentModelRef.current);
      disposeObject(currentModelRef.current);
      currentModelRef.current = null;
    }

    mixerRef.current?.stopAllAction();
    mixerRef.current = null;

    scene.background = null;
    scene.fog = sceneConfig.fog
      ? new THREE.Fog(
          sceneConfig.fog.color,
          sceneConfig.fog.near,
          sceneConfig.fog.far,
        )
      : null;

    if (rendererRef.current) {
      rendererRef.current.toneMappingExposure = sceneConfig.exposure;
    }

    const ambient = scene.children.find(
      (child: any): child is THREE.AmbientLight =>
        child instanceof THREE.AmbientLight,
    );
    const hemi = scene.children.find(
      (child: any): child is THREE.HemisphereLight =>
        child instanceof THREE.HemisphereLight,
    );
    const key = scene.children.find(
      (child: any): child is THREE.DirectionalLight =>
        child instanceof THREE.DirectionalLight,
    );
    const fill = scene.children.find(
      (child: { position: { x: number; }; }): child is THREE.DirectionalLight =>
        child instanceof THREE.DirectionalLight && child.position.x < 0,
    );
    const rim = scene.children.find(
      (child: any): child is THREE.PointLight => child instanceof THREE.PointLight,
    );

    if (ambient) {
      ambient.intensity = sceneConfig.ambient.intensity;
      ambient.color = new THREE.Color(sceneConfig.ambient.color);
    }
    if (hemi) {
      hemi.intensity = sceneConfig.hemisphere.intensity;
      hemi.color = new THREE.Color(sceneConfig.hemisphere.skyColor);
      hemi.groundColor = new THREE.Color(sceneConfig.hemisphere.groundColor);
    }
    if (key) {
      key.intensity = sceneConfig.key.intensity;
      key.color = new THREE.Color(sceneConfig.key.color);
      key.position.set(...sceneConfig.key.position);
    }
    if (fill) {
      fill.intensity = sceneConfig.fill.intensity;
      fill.color = new THREE.Color(sceneConfig.fill.color);
      fill.position.set(...sceneConfig.fill.position);
    }
    if (rim) {
      rim.intensity = sceneConfig.rim.intensity;
      rim.color = new THREE.Color(sceneConfig.rim.color);
      rim.position.set(...sceneConfig.rim.position);
      rim.distance = sceneConfig.rim.distance;
    }

    let cancelled = false;

    loader.load(
      activeConfig.url,
      (gltf: { scene: any; animations: any[]; }) => {
        if (cancelled) {
          disposeObject(gltf.scene);
          return;
        }

        const object = gltf.scene;
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxAxis = Math.max(size.x, size.y, size.z) || 1;
        const scaleFactor = activeConfig.targetSize / maxAxis;
        const sphere = box.getBoundingSphere(new THREE.Sphere());

        object.position.sub(center);
        object.scale.setScalar(scaleFactor);
        object.position.add(activeConfig.position);
        object.rotation.y = activeConfig.rotationY;

        object.traverse(
          (child: {
            castShadow: boolean;
            receiveShadow: boolean;
            material: {
              forEach: (
                arg0: (material: { needsUpdate: boolean }) => void,
              ) => void;
              needsUpdate: boolean;
            };
          }) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = false;
              child.receiveShadow = false;

              if (Array.isArray(child.material)) {
                child.material.forEach((material: { needsUpdate: boolean }) => {
                  material.needsUpdate = true;
                });
              } else {
                child.material.needsUpdate = true;
              }
            }
          },
        );

        modelGroup.rotation.set(0, 0, 0);
        modelGroup.position.set(0, 0, 0);
        modelGroup.add(object);
        currentModelRef.current = object;

        if (camera) {
          const scaledRadius = sphere.radius * scaleFactor;
          const fitHeightDistance =
            scaledRadius / Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
          const fitWidthDistance = fitHeightDistance / camera.aspect;
          const distance =
            Math.max(fitHeightDistance, fitWidthDistance) *
            MODEL_CONFIG[themeMode].zoom; //handle the zoom into the figure

          camera.near = 0.1;
          camera.far = Math.max(100, distance * 6);
          camera.position.set(0, scaledRadius * 0.35, distance);
          camera.lookAt(0, activeConfig.position.y * 0.35, 0);
          camera.updateProjectionMatrix();
        }

        if (gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(object);
          gltf.animations.forEach((clip: any) => mixer.clipAction(clip).play());
          mixerRef.current = mixer;
        }

        setStatus("ready");
      },
      undefined,
      (error: any) => {
        console.error("Failed to load banner model", error);
        setStatus("error");
      },
    );

    return () => {
      cancelled = true;
    };
  }, [loader, mounted, themeMode]);

  return (
    <div className="relative h-192 w-full overflow-hidden rounded-4xl border border-white/10 bg-transparent sm:h-120 lg:h-full">
      <div ref={mountRef} className="h-full w-full" />
      {mounted && status !== "ready" ? (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center text-center text-xs font-semibold uppercase tracking-[0.28em]"
          style={{ color: "var(--hero-panel-caption)" }}
        >
          {status === "error" ? "Model failed to load" : "Loading model"}
        </div>
      ) : null}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/12 to-transparent" />
    </div>
  );
}
