import {
  Center,
  OrbitControls,
  shaderMaterial,
  Text3D,
} from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import { useRef } from "react";
import * as THREE from "three";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      donutGradientMaterial: any;
    }
  }
}

const DonutGradientMaterial = shaderMaterial(
  {
    colorA: new THREE.Color("#41FFF4"),
    colorB: new THREE.Color("#4CFE9E"),
  },
  // Vertex Shader
  `
      varying vec3 vPosition;
      void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
  // Fragment Shader
  `
      uniform vec3 colorA;
      uniform vec3 colorB;
      varying vec3 vPosition;
      
      void main() {
        float mixRatio = (vPosition.y + 1.0) / 2.0;
        vec3 color = mix(colorA, colorB, mixRatio);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
);
extend({ DonutGradientMaterial });

const torusGeometry = new THREE.TorusGeometry(1, 0.4, 16, 32);

export default function Experience() {
  const donuts = useRef<THREE.Mesh[]>([]);

  useFrame((_, delta) => {
    for (const donut of donuts.current) {
      if (donut) donut.rotation.y += delta * 0.2;
    }
  });

  const textMaterial = new THREE.MeshBasicMaterial();
  textMaterial.color.set("#3FFFFF");

  return (
    <>
      <Perf position="top-left" />
      <OrbitControls makeDefault />

      {/* Ambient + Point light for glow-like feel */}
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={2} color="#00ffe0" />

      <Center>
        <Text3D
          material={textMaterial}
          font="./fonts/helvetiker_regular.typeface.json"
          size={2}
          height={0.3}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.04}
          bevelSize={0.03}
          bevelOffset={0}
          bevelSegments={5}
        >
          SIPE
        </Text3D>
      </Center>

      {[...Array(100)].map((_, i) => (
        <mesh
          key={i}
          ref={(el) => (donuts.current[i] = el!)}
          geometry={torusGeometry}
          material={new DonutGradientMaterial()}
          position={[
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
          ]}
          scale={0.2 + Math.random() * 0.4}
          rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
        />
      ))}
    </>
  );
}
