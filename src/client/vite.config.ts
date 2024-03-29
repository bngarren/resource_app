/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  // ! https://github.com/vitejs/vite/issues/8644
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
  },
  server: {
    host: true,
  },
  build: {
    sourcemap: "inline",
  },
  test: {
    environment: "jsdom",
    root: "./src",
    reporters: "verbose",
    setupFiles: "./src/util/setupTest.ts",
    globals: true,
  },
});
