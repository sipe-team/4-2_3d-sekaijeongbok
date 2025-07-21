import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import fragmentShader from "../shaders/fire.frag?raw";
import vertexShader from "../shaders/fire.vert?raw";

export const Route = createFileRoute("/sun")({
  component: () => <Sun />,
});

function SunCore() {
  // Create gradient texture immediately
  const createGradientTexture = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    canvas.width = 256;
    canvas.height = 256;

    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, "#ffffff"); // White hot center
    gradient.addColorStop(0.4, "#ffdd00"); // Yellow
    gradient.addColorStop(0.8, "#ff8800"); // Orange
    gradient.addColorStop(1, "#ff4400"); // Red edge

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  const texture = useMemo(() => createGradientTexture(), []);

  return (
    <mesh position={[0, 0, 0.1]}>
      <circleGeometry args={[0.6, 64]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

function FireEffects() {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const { size } = useThree();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.resolution.value.set(
        size.width,
        size.height,
      );
      materialRef.current.uniforms.aspectRatio.value = size.width / size.height;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[8, 8]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          time: { value: 0 },
          resolution: { value: new THREE.Vector2(800, 600) },
          aspectRatio: { value: 1.0 },
        }}
        transparent
        blending={THREE.NormalBlending}
      />
    </mesh>
  );
}

function Sun() {
  return (
    <div className="w-full h-screen">
      <Canvas>
        <color attach="background" args={["#000000"]} />
        <SunCore />
        <FireEffects />
      </Canvas>
    </div>
  );
}
