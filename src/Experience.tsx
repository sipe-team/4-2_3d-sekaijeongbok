import {
  Center,
  OrbitControls,
  shaderMaterial,
  useGLTF,
} from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { useRef, useEffect, useState, useMemo } from "react";
import * as THREE from "three";

// 🔹 글로벌 JSX 타입 확장 (커스텀 머티리얼용)
declare global {
  namespace JSX {
    interface IntrinsicElements {
      gradientMaterial: any;
    }
  }
}

// 🔹 커스텀 셰이더 머티리얼 정의
const GradientMaterial = shaderMaterial(
  {
    colorA: new THREE.Color("#41FFF4"),
    colorB: new THREE.Color("#4CFE9E"),
  },
  // vertex shader
  `
    varying vec3 vPosition;
    void main() {
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // fragment shader
  `
    uniform vec3 colorA;
    uniform vec3 colorB;
    varying vec3 vPosition;
    
    void main() {
      float mixRatio = (vPosition.y + 1.0) / 2.0;
      vec3 color = mix(colorA, colorB, mixRatio);
      gl_FragColor = vec4(color, 1.0);
    }
  `
);

extend({ GradientMaterial });

// 🔹 SVG를 Canvas 텍스처로 변환하는 함수
function createSVGTexture(
  svgString: string,
  width: number = 512,
  height: number = 512
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const img = new Image();
  const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(svgBlob);

  return new Promise<THREE.CanvasTexture>((resolve) => {
    img.onload = () => {
      // 배경을 투명하게 설정
      ctx.clearRect(0, 0, width, height);

      // SVG를 중앙에 배치하고 적절한 크기로 조정
      const scale = Math.min(width / img.width, height / img.height) * 0.8;
      const x = (width - img.width * scale) / 2;
      const y = (height - img.height * scale) / 2;

      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      URL.revokeObjectURL(url);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      resolve(texture);
    };
    img.src = url;
  });
}

export default function Experience() {
  const arrows = useRef<THREE.Group[]>([]);
  const { scene: arrowScene } = useGLTF("./3D/sipe_arrow.glb");
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  // 🔹 텍스트 로고 위치 상태
  const [logoPosition, setLogoPosition] = useState<[number, number, number]>([
    0, 0, 0,
  ]);
  // 🔹 카메라 거리 상태
  const [cameraDistance, setCameraDistance] = useState<number>(8);
  // 🔹 SVG 텍스처 상태
  const [svgTexture, setSvgTexture] = useState<THREE.CanvasTexture | null>(
    null
  );

  // 🔹 GLTF 내부 Mesh마다 그라디언트 머티리얼 적용
  const applyGradientMaterial = (object: THREE.Object3D) => {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new GradientMaterial();
      }
    });
  };

  // 🔹 화살표 위치 고정 (한 번만 생성)
  const arrowPositions = useMemo(() => {
    return [...Array(50)].map(
      () =>
        [
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
        ] as [number, number, number]
    );
  }, []);

  const arrowScales = useMemo(() => {
    return [...Array(50)].map(() => 0.2 + Math.random() * 0.2);
  }, []);

  const arrowRotations = useMemo(() => {
    return [...Array(50)].map(
      () =>
        [Math.random() * Math.PI, Math.random() * Math.PI, 0] as [
          number,
          number,
          number
        ]
    );
  }, []);

  // 🔹 화살표 회전 애니메이션 & 카메라 이동
  useFrame((_, delta) => {
    // 화살표 회전
    for (const arrow of arrows.current) {
      if (arrow) arrow.rotation.y += delta * 0.2;
    }

    // 카메라가 로고를 따라 부드럽게 이동
    if (controlsRef.current) {
      const targetPosition = new THREE.Vector3(...logoPosition);
      controlsRef.current.target.lerp(targetPosition, 0.05);

      // 카메라 위치도 로고 위치를 기준으로 오프셋 적용 (줌 거리 반영)
      const cameraOffset = new THREE.Vector3(0, 2, cameraDistance);
      const desiredCameraPosition = targetPosition.clone().add(cameraOffset);
      camera.position.lerp(desiredCameraPosition, 0.05);

      controlsRef.current.update();
    }
  });

  // 🔹 SVG 텍스처 로드
  useEffect(() => {
    fetch("/svg/sipe.svg")
      .then((response) => response.text())
      .then((svgString) => {
        // SVG 색상을 사이안으로 강제 변경
        const cyanSvg = svgString
          .replace(/fill="#0ff"/g, 'fill="#00ffff"')
          .replace(/fill="#[0-9a-fA-F]{3,6}"/g, 'fill="#00ffff"');
        return createSVGTexture(cyanSvg, 512, 512);
      })
      .then((texture) => {
        setSvgTexture(texture);
      })
      .catch((error) => {
        console.error("SVG loading error:", error);
      });
  }, []);

  // 🔹 방향키 이동 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setLogoPosition(([x, y, z]) => {
        const step = 0.3;
        switch (e.key) {
          case "ArrowUp":
            return [x, y + step, z];
          case "ArrowDown":
            return [x, y - step, z];
          case "ArrowLeft":
            return [x - step, y, z];
          case "ArrowRight":
            return [x + step, y, z];
          default:
            return [x, y, z];
        }
      });
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 🔹 마우스 휠로 줌인/줌아웃 처리
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setCameraDistance((prevDistance) => {
        const zoomSpeed = 0.5;
        const newDistance =
          prevDistance + (e.deltaY > 0 ? zoomSpeed : -zoomSpeed);
        // 최소 2, 최대 20으로 제한
        return Math.max(2, Math.min(40, newDistance));
      });
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.05}
        enableZoom={false}
      />

      {/* 🔹 SVG 로고 그룹 */}
      {svgTexture && (
        <group position={logoPosition}>
          <Center>
            <mesh>
              <planeGeometry args={[6, 4]} />
              <meshBasicMaterial
                map={svgTexture}
                transparent
                alphaTest={0.1}
                side={THREE.DoubleSide}
                toneMapped={false}
              />
            </mesh>
          </Center>
        </group>
      )}

      {/* 🔹 화살표 배치 */}
      {[...Array(50)].map((_, i) => (
        <group
          key={i}
          ref={(el) => (arrows.current[i] = el!)}
          position={arrowPositions[i]}
          scale={arrowScales[i]}
          rotation={arrowRotations[i]}
        >
          <primitive
            object={(() => {
              const clonedArrow = arrowScene.clone();
              applyGradientMaterial(clonedArrow);
              return clonedArrow;
            })()}
          />
        </group>
      ))}
    </>
  );
}
