import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { createFileRoute } from "@tanstack/react-router";
import type { ComponentProps } from "react";

export const Route = createFileRoute("/monument")({
  component: () => <MonumentValley />,
});

function MonumentValley() {
  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [6, 4, 6], fov: 25 }} shadows>
        <color attach="background" args={["#2A3B47"]} />

        <ambientLight intensity={0.2} color="#E0E6ED" />
        <directionalLight
          position={[5, 8, 5]}
          intensity={0.6}
          color="#EEE"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <pointLight
          position={[2, 3, 0]}
          intensity={0.3}
          color="#4FC3F7"
          distance={8}
        />

        <group position={[0, 0, 0]}>
          {/* 하단 */}
          <BoxItem
            color="#EEE"
            position={{ x: 0, y: 0, z: 0.25 }}
            size={{ x: 0.05, y: 0.05, z: 0.5 }}
          />
          <BoxItem
            color="#777"
            position={{ x: 0.5, y: 0, z: 0.5 }}
            size={{ x: 0.05, y: 0.05, z: 1 }}
            rotation={{ x: 0, y: -Math.PI / 2, z: 0 }}
          />
          {/* 기둥 */}
          <BoxItem
            color="#EEE"
            position={{ x: 1, y: 0.25, z: 0.5 }}
            size={{ x: 0.05, y: 0.05, z: 0.5 }}
            rotation={{ x: -Math.PI / 2, y: 0, z: 0 }}
          />
          <BoxItem
            color="#777"
            position={{ x: 1, y: 0.75, z: 0.5 }}
            size={{ x: 0.05, y: 0.05, z: 0.5 }}
            rotation={{ x: -Math.PI / 2, y: 0, z: 0 }}
          />
          {/* 상단 */}
          <BoxItem
            color="#EEE"
            position={{ x: 0.75, y: 1, z: 0.5 }}
            size={{ x: 0.05, y: 0.05, z: 0.5 }}
            rotation={{ x: 0, y: -Math.PI / 2, z: 0 }}
          />
          <BoxItem
            color="#777"
            position={{ x: 0.25, y: 1, z: 0.5 }}
            size={{ x: 0.05, y: 0.05, z: 0.5 }}
            rotation={{ x: 0, y: -Math.PI / 2, z: 0 }}
          />

          {/* 계단 */}
          <group position={[0.25, 1, 0.5]}>
            <mesh position={[-0.25, 0.05, -0.05]}>
              <boxGeometry args={[0.1, 0.05, 0.1]} />
              <meshLambertMaterial color="#777" />
            </mesh>
            <mesh position={[-0.25, 0.1, -0.1]}>
              <boxGeometry args={[0.1, 0.05, 0.1]} />
              <meshLambertMaterial color="#777" />
            </mesh>
            <mesh position={[-0.25, 0.15, -0.15]}>
              <boxGeometry args={[0.1, 0.05, 0.1]} />
              <meshLambertMaterial color="#777" />
            </mesh>
            <mesh position={[-0.25, 0.2, -0.2]}>
              <boxGeometry args={[0.1, 0.05, 0.1]} />
              <meshLambertMaterial color="#777" />
            </mesh>
            <mesh position={[-0.25, 0.25, -0.25]}>
              <boxGeometry args={[0.1, 0.05, 0.1]} />
              <meshLambertMaterial color="#777" />
            </mesh>
            <mesh position={[-0.25, 0.3, -0.3]}>
              <boxGeometry args={[0.1, 0.05, 0.1]} />
              <meshLambertMaterial color="#777" />
            </mesh>
            <mesh position={[-0.25, 0.35, -0.35]}>
              <boxGeometry args={[0.1, 0.05, 0.1]} />
              <meshLambertMaterial color="#777" />
            </mesh>
            <mesh position={[-0.25, 0.4, -0.4]}>
              <boxGeometry args={[0.1, 0.05, 0.1]} />
              <meshLambertMaterial color="#777" />
            </mesh>
            <mesh position={[-0.25, 0.45, -0.45]}>
              <boxGeometry args={[0.1, 0.05, 0.1]} />
              <meshLambertMaterial color="#777" />
            </mesh>
            <mesh position={[-0.25, 0.45, -0.6]}>
              <boxGeometry args={[0.2, 0.05, 0.2]} />
              <meshLambertMaterial color="#777" />
            </mesh>
          </group>
        </group>

        {/* <axesHelper /> */}

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={4}
          maxDistance={15}
          target={[0, 0.5, 0]}
        />
      </Canvas>
    </div>
  );
}

interface Vector {
  x: number;
  y: number;
  z: number;
}

function BoxItem({
  color,
  position,
  rotation,
  size,
  ...props
}: Omit<ComponentProps<"mesh">, "position" | "rotation"> & {
  color: string;
  position: Vector;
  rotation?: Vector;
  size: Vector;
}) {
  return (
    <mesh
      position={[position.x, position.y, position.z]}
      rotation={
        rotation != null ? [rotation.x, rotation.y, rotation.z] : undefined
      }
      {...props}
    >
      <boxGeometry args={[size.x, size.y, size.z]} />
      <meshLambertMaterial color={color} />
    </mesh>
  );
}
