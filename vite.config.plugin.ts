import { defineConfig, ConfigEnv, UserConfig } from "vite";
import path from "node:path";
import { viteSingleFile } from "vite-plugin-singlefile";
import react from "@vitejs/plugin-react";
import replace from "@rollup/plugin-replace";
import * as sass from "sass-embedded";

export default defineConfig(({ mode }: ConfigEnv): UserConfig => ({
  plugins: [
    react(),
    viteSingleFile({
      removeViteModuleLoader: true,
    }),
    replace({
      "import.meta.url": JSON.stringify(new URL(import.meta.url).href),
      delimiters: ["", ""],
      preventAssignment: true,
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {},
    },
  },
  root: path.resolve(__dirname, "src"),
  build: {
    minify: mode === "production",
    cssMinify: mode === "production",
    sourcemap: false,
    emptyOutDir: false,
    outDir: path.resolve(__dirname, "dist"),
    rollupOptions: {
      input: path.resolve(__dirname, "src/plugin.html"),
      output: {
        entryFileNames: "ui.js",
        format: "esm",
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
}));