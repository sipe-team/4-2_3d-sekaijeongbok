import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { AnimatedSceneManager } from "./AnimatedSceneManager";

class Week2App {
  private sceneManager: AnimatedSceneManager;
  private animatingCube?: THREE.Mesh;
  private clock: THREE.Clock;

  constructor() {
    this.sceneManager = new AnimatedSceneManager();
    this.clock = new THREE.Clock();
    this.init();
  }

  private init(): void {
    this.sceneManager.initialize();

    this.setupOrbitControls();

    this.createAnimatedObjects();

    this.sceneManager.startAnimationLoop(this.animate.bind(this));
  }

  private setupOrbitControls(): void {
    const controls = new OrbitControls(
      this.sceneManager.getCamera(),
      this.sceneManager.getRenderer().domElement
    );

    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // 줌 제한
    controls.minDistance = 3;
    controls.maxDistance = 20;

    this.sceneManager.setControls(controls);
  }

  private createAnimatedObjects(): void {
    this.createRotatingCube();
    this.createReferenceObjects();
  }

  private createRotatingCube(): void {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff6b6b,
      wireframe: false,
    });

    this.animatingCube = new THREE.Mesh(geometry, material);
    this.animatingCube.position.set(0, 0, 0);

    this.sceneManager.addToScene(this.animatingCube);
  }

  private createReferenceObjects(): void {
    const sphereGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x4ecdc4 });

    for (let i = 0; i < 8; i++) {
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      const angle = (i / 8) * Math.PI * 2;
      sphere.position.set(
        Math.cos(angle) * 3,
        Math.sin(angle * 2) * 0.5, // Y축 파동 효과
        Math.sin(angle) * 3
      );

      this.sceneManager.addToScene(sphere);
    }
  }

  private animate(): void {
    const elapsedTime = this.clock.getElapsedTime();

    if (this.animatingCube) {
      this.animatingCube.rotation.y = elapsedTime * 0.8;
      this.animatingCube.rotation.x = elapsedTime * 0.4;
      this.animatingCube.position.y = Math.sin(elapsedTime * 1.5) * 0.5;
    }
  }

  public dispose(): void {
    this.sceneManager.dispose();
  }
}

const app = new Week2App();

window.addEventListener("beforeunload", () => {
  app.dispose();
});
