import { RunningSceneManager } from "./running/RunningSceneManager";

let sceneManager: RunningSceneManager | null = null;

function main(): void {
  try {
    sceneManager = new RunningSceneManager();
    sceneManager.initialize();
    sceneManager.start();
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
