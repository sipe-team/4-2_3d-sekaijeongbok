import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/monument")({
  component: () => <MonumentValley />,
});

function AxisHelper() {
  return (
    <group position={[0, 0, 0]}>
      {/* X */}
      <mesh position={[1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 2]} />
        <meshLambertMaterial color="#FF0000" />
      </mesh>

      {/* Y */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 2]} />
        <meshLambertMaterial color="#00FF00" />
      </mesh>

      {/* Z */}
      <mesh position={[0, 0, 1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 2]} />
        <meshLambertMaterial color="#0000FF" />
      </mesh>
    </group>
  );
}

function MonumentValley() {
  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [6, 4, 6], fov: 45 }} shadows>
        <color attach="background" args={["#2A3B47"]} />

        <ambientLight intensity={0.2} color="#E0E6ED" />
        <directionalLight
          position={[5, 8, 5]}
          intensity={0.6}
          color="#FFFFFF"
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

        {/* Floor */}
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0, 0.75]}>
            <boxGeometry args={[0.05, 0.05, 0.5]} />
            <meshLambertMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0.5, 0, 1]} rotation={[0, -Math.PI / 2, 0]}>
            <boxGeometry args={[0.05, 0.05, 1]} />
            <meshLambertMaterial color="#8A9BA8" />
          </mesh>
          {/* 기둥 */}
          <mesh position={[1, 0.25, 1]} rotation={[-Math.PI / 2, 0, 0]}>
            <boxGeometry args={[0.05, 0.05, 0.5]} />
            <meshLambertMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[1, 0.5, 1]} rotation={[-Math.PI / 2, 0, 0]}>
            <boxGeometry args={[0.05, 0.05, 0.5]} />
            <meshLambertMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0.5, 0.75, 1]} rotation={[0, -Math.PI / 2, 0]}>
            <boxGeometry args={[0.05, 0.05, 1]} />
            <meshLambertMaterial color="#8A9BA8" />
          </mesh>

          <group position={[0.5, 0.75, 1]}>
            <mesh position={[-0.5, 0.05, -0.05]}>
              <boxGeometry args={[0.1, 0.05, 0.1]} />
              <meshLambertMaterial color="#8A9BA8" />
            </mesh>
            <mesh position={[-0.5, 0.1, -0.1]}>
              <boxGeometry args={[0.1, 0.05, 0.1]} />
              <meshLambertMaterial color="#8A9BA8" />
            </mesh>
            <mesh position={[-0.5, 0.15, -0.15]}>
              <boxGeometry args={[0.1, 0.05, 0.1]} />
              <meshLambertMaterial color="#8A9BA8" />
            </mesh>
            <mesh position={[-0.5, 0.2, -0.2]}>
              <boxGeometry args={[0.1, 0.05, 0.1]} />
              <meshLambertMaterial color="#8A9BA8" />
            </mesh>
            <mesh position={[-0.5, 0.25, -0.25]}>
              <boxGeometry args={[0.1, 0.05, 0.1]} />
              <meshLambertMaterial color="#8A9BA8" />
            </mesh>
            <mesh position={[-0.5, 0.3, -0.3]}>
              <boxGeometry args={[0.1, 0.05, 0.1]} />
              <meshLambertMaterial color="#8A9BA8" />
            </mesh>
            <mesh position={[-0.5, 0.35, -0.35]}>
              <boxGeometry args={[0.1, 0.05, 0.1]} />
              <meshLambertMaterial color="#8A9BA8" />
            </mesh>
            <mesh position={[-0.5, 0.4, -0.4]}>
              <boxGeometry args={[0.1, 0.05, 0.1]} />
              <meshLambertMaterial color="#8A9BA8" />
            </mesh>
            <mesh position={[-0.5, 0.45, -0.45]}>
              <boxGeometry args={[0.1, 0.05, 0.1]} />
              <meshLambertMaterial color="#8A9BA8" />
            </mesh>
          </group>
        </group>

        <AxisHelper />

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
