import { Box, Plane } from "@react-three/drei";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  Component,
  type ReactNode,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import * as THREE from "three";

interface Artwork {
  id: string;
  title: string;
  description: string;
  link: string;
  position: [number, number, number];
  color: string;
  previewImage: string;
}

const artworks: Artwork[] = [
  {
    id: "sun",
    title: "태양",
    description: "커스텀 셰이더로 만든 태양과 불 효과",
    link: "/sun",
    position: [-4, 0, 0],
    color: "#ff6b35",
    previewImage: "/sun.png",
  },
  {
    id: "monument",
    title: "모뉴먼트 밸리",
    description: "3D 환경과 인터랙션",
    link: "/monument",
    position: [0, 0, 0],
    color: "#4ecdc4",
    previewImage: "/monument.png",
  },
  {
    id: "kirby",
    title: "커비",
    description: "커비다",
    link: "https://kirby-drain.vercel.app/",
    position: [4, 0, 0],
    color: "#4ecdc4",
    previewImage: "/6191.png",
  },
  {
    id: "isometric room",
    title: "시간의 방",
    description: "시간에 따라 태양 위치와 조명이 변화하는 3D 아이소메트릭 룸",
    link: "https://jeanne-room.vercel.app",
    position: [-4, 2, 0],
    color: "#ffffff",
    previewImage: "/isometric-room.png",
  },
];

function ImagePreview({ imagePath }: { imagePath: string }) {
  const texture = useLoader(THREE.TextureLoader, imagePath);

  return (
    <Plane args={[2, 1.5]} position={[0, 0, 0.01]}>
      <meshBasicMaterial map={texture} />
    </Plane>
  );
}

function FallbackPreview({ color }: { color: string }) {
  return (
    <Plane args={[2, 1.5]} position={[0, 0, 0.01]}>
      <meshStandardMaterial color={color} />
    </Plane>
  );
}

class ImageErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function FirstPersonControls() {
  const { camera, gl } = useThree();
  const isPressed = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
  });
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const PI_2 = Math.PI / 2;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case "KeyW":
          isPressed.current.w = true;
          break;
        case "KeyA":
          isPressed.current.a = true;
          break;
        case "KeyS":
          isPressed.current.s = true;
          break;
        case "KeyD":
          isPressed.current.d = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case "KeyW":
          isPressed.current.w = false;
          break;
        case "KeyA":
          isPressed.current.a = false;
          break;
        case "KeyS":
          isPressed.current.s = false;
          break;
        case "KeyD":
          isPressed.current.d = false;
          break;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement === gl.domElement) {
        const movementX = event.movementX || 0;
        const movementY = event.movementY || 0;

        euler.current.setFromQuaternion(camera.quaternion);
        euler.current.y -= movementX * 0.002;
        euler.current.x -= movementY * 0.002;
        euler.current.x = Math.max(-PI_2, Math.min(PI_2, euler.current.x));
        camera.quaternion.setFromEuler(euler.current);
      }
    };

    const handleClick = () => {
      gl.domElement.requestPointerLock();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("mousemove", handleMouseMove);
    gl.domElement.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("mousemove", handleMouseMove);
      gl.domElement.removeEventListener("click", handleClick);
    };
  }, [camera, gl, PI_2]);

  useFrame((_state, delta) => {
    const speed = 8;

    // 감속 적용
    velocity.current.x *= 0.1 ** delta;
    velocity.current.z *= 0.1 ** delta;

    // 방향 계산
    const forward = Number(isPressed.current.w) - Number(isPressed.current.s);
    const right = Number(isPressed.current.d) - Number(isPressed.current.a);

    // 카메라 기준 방향 벡터
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);

    const cameraRight = new THREE.Vector3();
    cameraRight.crossVectors(cameraDirection, camera.up).normalize();

    // 이동 벡터 계산
    const moveVector = new THREE.Vector3();
    moveVector.addScaledVector(cameraDirection, forward * speed * delta);
    moveVector.addScaledVector(cameraRight, right * speed * delta);

    // Y축 이동 제거 (수평 이동만)
    moveVector.y = 0;

    // 카메라 위치 업데이트
    camera.position.add(moveVector);
  });

  return null;
}

function ArtworkFrame({
  artwork,
  onHover,
}: {
  artwork: Artwork;
  onHover: (artwork: Artwork | null) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const frameRef = useRef<THREE.Group>(null);

  function handleClick() {
    window.location.href = artwork.link;
  }

  function handlePointerEnter() {
    setHovered(true);
    onHover(artwork);
  }

  function handlePointerLeave() {
    setHovered(false);
    onHover(null);
  }

  return (
    <group
      ref={frameRef}
      position={artwork.position}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
    >
      {/* Frame - 밝은 실버/화이트 프레임 */}
      <Box args={[2.2, 1.6, 0.1]} position={[0, 0, -0.05]}>
        <meshStandardMaterial
          color={hovered ? "#e0e0e0" : "#f5f5f5"}
          metalness={0.4}
          roughness={0.3}
        />
      </Box>

      {/* Bright white background */}
      <Plane args={[2, 1.5]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#ffffff" />
      </Plane>

      {/* Artwork preview */}
      <ImageErrorBoundary fallback={<FallbackPreview color={artwork.color} />}>
        <Suspense fallback={<FallbackPreview color={artwork.color} />}>
          <ImagePreview
            imagePath={artwork.previewImage}
            fallbackColor={artwork.color}
          />
        </Suspense>
      </ImageErrorBoundary>
    </group>
  );
}

export function Room() {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  return (
    <div className="w-full h-screen bg-white relative">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        tabIndex={0}
        style={{ outline: "none" }}
      >
        <color attach="background" args={["#ffffff"]} />

        {/* Lighting - 매우 밝은 전시회 스타일 */}
        <ambientLight intensity={1.5} color="#ffffff" />
        <directionalLight
          position={[5, 10, 5]}
          intensity={2.0}
          color="#ffffff"
        />
        <directionalLight
          position={[-5, 10, 5]}
          intensity={1.5}
          color="#ffffff"
        />
        <directionalLight
          position={[0, 10, -5]}
          intensity={1.2}
          color="#ffffff"
        />

        {/* 강력한 천장 조명 효과 */}
        <pointLight position={[0, 8, 0]} intensity={1.2} color="#ffffff" />
        <pointLight position={[-4, 8, 0]} intensity={1.0} color="#ffffff" />
        <pointLight position={[4, 8, 0]} intensity={1.0} color="#ffffff" />
        <pointLight position={[0, 8, 4]} intensity={0.8} color="#ffffff" />
        <pointLight position={[0, 8, -4]} intensity={0.8} color="#ffffff" />

        {/* Gallery floor - 매우 밝은 흰색 대리석 느낌 */}
        <Plane
          args={[20, 20]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -3, 0]}
        >
          <meshStandardMaterial
            color="#f8f9fa"
            metalness={0.1}
            roughness={0.2}
          />
        </Plane>

        {/* Gallery walls - 깔끔한 흰색 */}
        <Plane args={[20, 10]} position={[0, 2, -10]}>
          <meshStandardMaterial color="#ffffff" />
        </Plane>

        {/* 측면 벽 */}
        <Plane
          args={[20, 10]}
          position={[-10, 2, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <meshStandardMaterial color="#ffffff" />
        </Plane>

        <Plane
          args={[20, 10]}
          position={[10, 2, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        >
          <meshStandardMaterial color="#ffffff" />
        </Plane>

        {/* Artworks */}
        {artworks.map((artwork) => (
          <ArtworkFrame
            key={artwork.id}
            artwork={artwork}
            onHover={setSelectedArtwork}
          />
        ))}

        <FirstPersonControls />
      </Canvas>

      {/* Title overlay */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-gray-800 text-3xl font-bold">
        3차원 세계 정복하기의 굿즈방
      </div>

      {/* Artwork info overlay */}
      {selectedArtwork != null ? (
        <div className="absolute top-1/2 right-8 transform -translate-y-1/2 bg-white bg-opacity-95 p-6 rounded-lg shadow-lg text-gray-800 max-w-xs border border-gray-200">
          <h3 className="text-xl font-bold mb-3 text-gray-900">
            {selectedArtwork.title}
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {selectedArtwork.description}
          </p>
          <div className="mt-4 text-xs text-gray-500 font-medium">
            클릭해서 보기
          </div>
        </div>
      ) : null}
    </div>
  );
}
