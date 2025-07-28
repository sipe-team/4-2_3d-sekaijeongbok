import * as THREE from "three";
import { SceneManager } from "./SceneManager";

class Week1App {
  private sceneManager: SceneManager;

  constructor() {
    this.sceneManager = new SceneManager();
    this.init();
  }

  private init(): void {
    this.sceneManager.initialize();
    this.createFirstCube();
    this.sceneManager.startRendering();
  }

  private createFirstCube(): void {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff6b6b,
      wireframe: false,
    });

    const cube = new THREE.Mesh(geometry, material);

    this.sceneManager.addToScene(cube);
  }

  public dispose(): void {
    this.sceneManager.dispose();
  }
}

const app = new Week1App();

window.addEventListener("beforeunload", () => {
  app.dispose();
});
