import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3001,
    open: true,
    host: true,
  },
  root: ".",
  base: "./",
  build: {
    outDir: "../dist/week-1",
    sourcemap: true,
  },
});
