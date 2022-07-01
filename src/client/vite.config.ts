import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    process.env.MODE !== "production" ?
    react({
    jsxImportSource: '@welldone-software/why-did-you-render',
  }) : react(), tsconfigPaths()],
});
