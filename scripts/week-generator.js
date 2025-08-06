#!/usr/bin/env node

import { promises as fs } from "fs";
import path from "path";

class FileSystemOperations {
  async createDirectory(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      throw new Error(`디렉토리 생성 실패: ${dirPath} - ${error.message}`);
    }
  }

  async writeFile(filePath, content) {
    try {
      await fs.writeFile(filePath, content, "utf8");
    } catch (error) {
      throw new Error(`파일 생성 실패: ${filePath} - ${error.message}`);
    }
  }

  async exists(targetPath) {
    try {
      await fs.access(targetPath);
      return true;
    } catch {
      return false;
    }
  }

  async readFile(filePath) {
    try {
      return await fs.readFile(filePath, "utf8");
    } catch (error) {
      throw new Error(`파일 읽기 실패: ${filePath} - ${error.message}`);
    }
  }
}

class TemplateManager {
  constructor(fileSystem) {
    this.fileSystem = fileSystem;
  }

  createIndexHtml(weekNumber) {
    return `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${weekNumber}주차</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="./main.ts"></script>
  </body>
</html>
`;
  }

  createViteConfig(weekNumber, port) {
    return `import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: ${port},
    open: true,
    host: true,
  },
  root: ".",
  base: "./",
  build: {
    outDir: "../dist/week-${weekNumber}",
    sourcemap: true,
  },
});
`;
  }

  createMainTs(weekNumber) {
    return `import { SceneManager } from "./SceneManager";

let sceneManager: SceneManager | null = null;

function main(): void {
  try {
    const container = document.getElementById("app");
    if (!container) {
      return;
    }

    sceneManager = new SceneManager(container);
  } catch (error) {}
}

function cleanup(): void {
  if (sceneManager) {
    sceneManager.dispose();
    sceneManager = null;
  }
}

window.addEventListener("beforeunload", cleanup);

main();
`;
  }

  createDocumentationMd(weekNumber) {
    return `# ${weekNumber}주차: ${weekNumber}주차 학습 주제

## 🎯 학습 목표

- 주요 학습 목표 1
- 주요 학습 목표 2
- 주요 학습 목표 3

## 📚 이론 학습

## Q&A

`;
  }

  createSceneManagerTs(weekNumber) {
    return `import * as THREE from 'three';

export class SceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animationId: number | null = null;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.setupCamera();
    this.setupRenderer(container);
    this.setupBasicScene();
    this.startAnimation();
  }

  private setupCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;
  }

  private setupRenderer(container: HTMLElement): void {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    window.addEventListener('resize', () => this.handleResize());
  }

  private setupBasicScene(): void {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);
  }

  private handleResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    
    const cube = this.scene.children[0] as THREE.Mesh;
    if (cube) {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
    }

    this.renderer.render(this.scene, this.camera);
  };

  private startAnimation(): void {
    this.animate();
  }

  dispose(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    this.renderer.dispose();
  }
}
`;
  }

  getTemplates(weekNumber, port) {
    return [
      {
        filename: "index.html",
        content: this.createIndexHtml(weekNumber),
        directory: "",
      },
      {
        filename: "vite.config.ts",
        content: this.createViteConfig(weekNumber, port),
        directory: "",
      },
      {
        filename: "main.ts",
        content: this.createMainTs(weekNumber),
        directory: "",
      },
      {
        filename: "SceneManager.ts",
        content: this.createSceneManagerTs(weekNumber),
        directory: "",
      },
      {
        filename: `week-${weekNumber}.md`,
        content: this.createDocumentationMd(weekNumber),
        directory: "docs",
      },
    ];
  }
}

class WeekGenerator {
  constructor(fileSystem, templateManager) {
    this.fileSystem = fileSystem;
    this.templateManager = templateManager;
  }

  calculatePort(weekNumber) {
    return 3001;
  }

  createWeekConfig(weekNumber) {
    return {
      weekNumber,
      port: this.calculatePort(weekNumber),
      title: `${weekNumber}주차`,
      outDir: `../dist/week-${weekNumber}`,
    };
  }

  async checkWeekExists(weekNumber) {
    const weekPath = `week-${weekNumber}`;
    return await this.fileSystem.exists(weekPath);
  }

  async generateWeek(weekNumber, force = false) {
    try {
      const exists = await this.checkWeekExists(weekNumber);
      if (exists && !force) {
        return {
          kind: "error",
          message: "Week가 이미 존재합니다.",
        };
      }

      const config = this.createWeekConfig(weekNumber);
      const weekPath = `week-${weekNumber}`;

      await this.fileSystem.createDirectory(weekPath);

      const docsPath = "docs";
      const docsExists = await this.fileSystem.exists(docsPath);
      if (!docsExists) {
        await this.fileSystem.createDirectory(docsPath);
      }

      const templates = this.templateManager.getTemplates(
        weekNumber,
        config.port
      );
      const createdFiles = [];

      for (const template of templates) {
        let filePath;
        if (template.directory && template.directory !== "") {
          filePath = path.join(template.directory, template.filename);
        } else {
          filePath = path.join(weekPath, template.filename);
        }

        await this.fileSystem.writeFile(filePath, template.content);
        createdFiles.push(filePath);
      }

      return {
        kind: "success",
        weekPath,
        createdFiles,
      };
    } catch (error) {
      return {
        kind: "error",
        message: error.message,
        cause: error,
      };
    }
  }

  async addPackageScript(weekNumber) {
    try {
      const packageJsonPath = "package.json";
      const packageContent = await this.fileSystem.readFile(packageJsonPath);
      const packageData = JSON.parse(packageContent);

      if (!packageData.scripts) {
        packageData.scripts = {};
      }

      const scriptName = `week-${weekNumber}`;
      packageData.scripts[scriptName] = `cd week-${weekNumber} && vite`;

      const sortedScripts = Object.keys(packageData.scripts)
        .sort()
        .reduce((acc, key) => {
          acc[key] = packageData.scripts[key];
          return acc;
        }, {});

      packageData.scripts = sortedScripts;

      await this.fileSystem.writeFile(
        packageJsonPath,
        JSON.stringify(packageData, null, 2) + "\n"
      );
    } catch (error) {
      throw error;
    }
  }
}

class WeekGeneratorCLI {
  constructor() {
    this.fileSystem = new FileSystemOperations();
    this.templateManager = new TemplateManager(this.fileSystem);
    this.generator = new WeekGenerator(this.fileSystem, this.templateManager);
  }

  showUsage() {
    console.log(`
사용법: node scripts/week-generator.js <week-number> [--force]

옵션:
  week-number    생성할 주차 번호 (1-6)
  --force        기존 디렉토리가 있어도 덮어쓰기

예시: 
  node scripts/week-generator.js 4
  node scripts/week-generator.js 5 --force
`);
  }

  parseArguments(args) {
    const weekNumber = parseInt(args[2]);
    const force = args.includes("--force");

    if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 6) {
      throw new Error("주차 번호는 1-6 사이의 숫자여야 합니다.");
    }

    return { weekNumber, force };
  }

  async run(args) {
    try {
      if (args.length < 3) {
        this.showUsage();
        process.exit(1);
      }

      const { weekNumber, force } = this.parseArguments(args);

      const result = await this.generator.generateWeek(weekNumber, force);

      if (result.kind === "success") {
        await this.generator.addPackageScript(weekNumber);
        process.exit(0);
      } else {
        process.exit(1);
      }
    } catch (error) {
      console.error("CLI 실행 오류", error);
      this.showUsage();
      process.exit(1);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new WeekGeneratorCLI();
  cli.run(process.argv);
}

export { WeekGenerator, TemplateManager, FileSystemOperations };
