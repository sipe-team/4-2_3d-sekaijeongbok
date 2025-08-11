import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type RunnerPartName =
  | "head"
  | "torso"
  | "leftUpperArm"
  | "leftLowerArm"
  | "rightUpperArm"
  | "rightLowerArm"
  | "leftUpperLeg"
  | "leftLowerLeg"
  | "rightUpperLeg"
  | "rightLowerLeg";

type RunnerRig = Record<RunnerPartName, THREE.Object3D>;

export class RunningSceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls?: OrbitControls;
  private container: HTMLElement;
  private animationId: number | undefined;

  private runnerGroup: THREE.Group | null = null;
  private rig: RunnerRig | null = null;

  private elapsed = 0;

  constructor() {
    const el = document.getElementById("app");
    if (!el) throw new Error("#app 컨테이너가 없습니다");
    this.container = el;

    this.scene = new THREE.Scene();
    this.camera = this.createCamera();
    this.renderer = this.createRenderer();
  }

  public initialize(): void {
    this.setupRenderer();
    this.setupScene();
    this.setupCamera();
    this.setupControls();
    this.createRunner();
  }

  public start(): void {
    this.animate();
  }

  private createCamera(): THREE.PerspectiveCamera {
    return new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
  }

  private createRenderer(): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.shadowMap.enabled = false;
    return renderer;
  }

  private setupRenderer(): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);
  }

  private setupScene(): void {
    const hemi = new THREE.HemisphereLight(0xffffff, 0x333366, 0.6);
    this.scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(10, 15, 10);
    this.scene.add(dir);
  }

  private setupCamera(): void {
    this.camera.position.set(8, 5, 10);
    this.camera.lookAt(0, 1.2, 0);
  }

  private setupControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.target.set(0, 1.2, 0);
  }

  private createRunner(): void {
    const group = new THREE.Group();

    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.8, 0.25),
      new THREE.MeshStandardMaterial({ color: 0x90caf9 })
    );

    const headPivot = new THREE.Object3D();
    headPivot.position.y = 0.5;
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0xffe082 })
    );
    head.position.y = 0.2;
    headPivot.add(head);
    torso.add(headPivot);

    const makeArm = (isLeft: boolean) => {
      const upper = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.45, 0.15),
        new THREE.MeshStandardMaterial({ color: 0x64b5f6 })
      );
      upper.position.x = isLeft ? -0.3 : 0.3;
      upper.position.y = 0.2;

      const elbow = new THREE.Object3D();
      elbow.position.y = -0.22;
      const lower = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.45, 0.12),
        new THREE.MeshStandardMaterial({ color: 0x42a5f5 })
      );
      lower.position.y = -0.22;
      elbow.add(lower);
      upper.add(elbow);
      return { upper, lower, elbow };
    };

    const leftArm = makeArm(true);
    const rightArm = makeArm(false);
    torso.add(leftArm.upper, rightArm.upper);

    const pelvis = new THREE.Object3D();
    pelvis.position.y = -0.4;

    const makeLeg = (isLeft: boolean) => {
      const upper = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.55, 0.18),
        new THREE.MeshStandardMaterial({ color: 0x90a4ae })
      );
      upper.position.x = isLeft ? -0.15 : 0.15;
      upper.position.y = -0.25;

      const knee = new THREE.Object3D();
      knee.position.y = -0.27;
      const lower = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.55, 0.16),
        new THREE.MeshStandardMaterial({ color: 0xb0bec5 })
      );
      lower.position.y = -0.27;
      knee.add(lower);
      upper.add(knee);
      return { upper, lower, knee };
    };

    const leftLeg = makeLeg(true);
    const rightLeg = makeLeg(false);
    pelvis.add(leftLeg.upper, rightLeg.upper);
    torso.add(pelvis);

    group.add(torso);
    this.scene.add(group);

    this.runnerGroup = group;
    this.rig = {
      head: head,
      torso: torso,
      leftUpperArm: leftArm.upper,
      leftLowerArm: leftArm.lower,
      rightUpperArm: rightArm.upper,
      rightLowerArm: rightArm.lower,
      leftUpperLeg: leftLeg.upper,
      leftLowerLeg: leftLeg.lower,
      rightUpperLeg: rightLeg.upper,
      rightLowerLeg: rightLeg.lower,
    };
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    const dt = 1 / 60; // 고정 타임스텝
    this.elapsed += dt;

    // 달리기 모션 파라미터
    const runHz = 2.6; // 스텝 빈도
    const t = this.elapsed * Math.PI * 2 * runHz;

    if (this.rig) {
      // 팔: 반대 위상 스윙
      const armSwing = 0.8;
      this.rig.leftUpperArm.rotation.x = Math.sin(t + Math.PI) * armSwing - 0.2;
      this.rig.rightUpperArm.rotation.x = Math.sin(t) * armSwing - 0.2;

      this.rig.leftLowerArm.parent!.rotation.x =
        Math.max(0, -Math.sin(t + Math.PI)) * 0.6;
      this.rig.rightLowerArm.parent!.rotation.x =
        Math.max(0, -Math.sin(t)) * 0.6;

      // 다리: 반대 위상 스윙 + 무릎 굽힘
      const legSwing = 0.9;
      this.rig.leftUpperLeg.rotation.x = Math.sin(t) * legSwing;
      this.rig.rightUpperLeg.rotation.x = Math.sin(t + Math.PI) * legSwing;

      this.rig.leftLowerLeg.parent!.rotation.x =
        Math.max(0, -Math.sin(t + 0.4)) * 0.9;
      this.rig.rightLowerLeg.parent!.rotation.x =
        Math.max(0, -Math.sin(t + Math.PI + 0.4)) * 0.9;

      // 상체 상하 바운스 + 약간의 롤
      if (this.runnerGroup) {
        const baseBounce = Math.abs(Math.sin(t * 0.5)) * 0.08;
        this.runnerGroup.position.y = 1.0 + baseBounce;
        this.runnerGroup.rotation.y = Math.sin(t * 0.25) * 0.05;
      }
    }

    if (this.controls) this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  public dispose(): void {
    if (this.animationId !== undefined) {
      cancelAnimationFrame(this.animationId);
      this.animationId = undefined;
    }

    if (this.controls) this.controls.dispose();

    this.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material?.dispose?.();
        }
      }
    });

    this.renderer.dispose();
  }
}
