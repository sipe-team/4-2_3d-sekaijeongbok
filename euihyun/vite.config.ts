import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";

export default defineConfig(() => ({
  plugins: [
    tanstackRouter({
      autoCodeSplitting: true,
      target: "react",
    }),
    tailwindcss(),
    glsl(),
  ],
}));
