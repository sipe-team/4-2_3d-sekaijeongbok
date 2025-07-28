import * as THREE from "three";

export class SceneManager {
  // 3요소
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  private container: HTMLElement;

  constructor() {
    this.container = document.getElementById("app")!;
    this.scene = new THREE.Scene();
    this.camera = this.createCamera();
    this.renderer = this.createRenderer();
  }

  public initialize(): void {
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.handleResize();
  }

  private createCamera(): THREE.PerspectiveCamera {
    const fov = 75; // 시야각 (Field of View)
    const aspect = window.innerWidth / window.innerHeight; // 종횡비
    const near = 0.1; // Near Clipping Plane
    const far = 1000; // Far Clipping Plane

    return new THREE.PerspectiveCamera(fov, aspect, near, far);
  }

  private createRenderer(): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true, // 투병 매경
    });

    return renderer;
  }

  private setupScene(): void {
    this.scene.background = new THREE.Color("black");

    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);
  }

  private setupCamera(): void {
    this.camera.position.set(0, 0, 3);
    this.camera.lookAt(0, 0, 0); // 원점 보게
  }

  private setupRenderer(): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);
  }

  private handleResize(): void {
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  public addToScene(object: THREE.Object3D): void {
    this.scene.add(object);
  }

  public removeFromScene(object: THREE.Object3D): void {
    this.scene.remove(object);
  }

  public startRendering(): void {
    this.render();
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  public dispose(): void {
    this.renderer.dispose();

    while (this.scene.children.length > 0) {
      const child = this.scene.children[0];
      if (child) {
        this.scene.remove(child);

        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (child.material instanceof THREE.Material) {
            child.material.dispose();
          }
        }
      } else {
        break;
      }
    }
  }
}
