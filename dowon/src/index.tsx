import { Canvas } from "@react-three/fiber";
import ReactDOM from "react-dom/client";
import * as THREE from "three";
import Experience from "./Experience";
import "./style.css";

const root = ReactDOM.createRoot(document.querySelector("#root")!);

root.render(
  <Canvas
    camera={{
      fov: 45,
      near: 0.1,
      far: 200,
      position: [4, -2, 6],
    }}
    gl={{
      outputColorSpace: THREE.SRGBColorSpace,
    }}
  >
    <Experience />
  </Canvas>
);
