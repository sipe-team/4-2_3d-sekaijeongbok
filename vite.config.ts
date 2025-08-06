import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  server: {
    port: 3000,
    open: true,
    host: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      input: {
        "week-1": resolve(__dirname, "week-1/index.html"),
        "week-2": resolve(__dirname, "week-2/index.html"),
        "week-3": resolve(__dirname, "week-3/index.html"),
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@assets": resolve(__dirname, "./assets"),
    },
  },
  optimizeDeps: {
    include: ["three", "lil-gui"],
  },
});
