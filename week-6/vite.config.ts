import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3006,
    open: true,
    host: true,
  },
  root: ".",
  base: "./",
  build: {
    outDir: "../dist/week-6",
    sourcemap: true,
  },
});
