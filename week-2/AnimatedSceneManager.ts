import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export class AnimatedSceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private container: HTMLElement;
  private controls?: OrbitControls;
  private animationId: number | undefined;
  private animateCallback?: () => void;

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
    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 1000;

    return new THREE.PerspectiveCamera(fov, aspect, near, far);
  }

  private createRenderer(): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    return renderer;
  }

  private setupScene(): void {
    this.scene.background = new THREE.Color(0x1a1a1a);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
    this.scene.add(ambientLight);

    // 깊이감을 위해
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);
  }

  private setupCamera(): void {
    this.camera.position.set(5, 3, 5);
    this.camera.lookAt(0, 0, 0);
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

  public setControls(controls: OrbitControls): void {
    this.controls = controls;
  }

  public startAnimationLoop(animateCallback: () => void): void {
    this.animateCallback = animateCallback;
    this.animate();
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());

    if (this.animateCallback) {
      this.animateCallback();
    }

    if (this.controls) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }

  public stopAnimationLoop(): void {
    if (this.animationId !== undefined) {
      cancelAnimationFrame(this.animationId);
      this.animationId = undefined;
    }
  }

  public addToScene(object: THREE.Object3D): void {
    this.scene.add(object);
  }

  public removeFromScene(object: THREE.Object3D): void {
    this.scene.remove(object);
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  public dispose(): void {
    this.stopAnimationLoop();

    if (this.controls) {
      this.controls.dispose();
    }

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
