import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import generateFile from "vite-plugin-generate-file";
import { viteSingleFile } from "vite-plugin-singlefile";
import figmaManifest from "./manifest";
import replace from "@rollup/plugin-replace";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => ({
  plugins: [
    viteSingleFile(),
    generateFile({
      type: "json",
      output: "./manifest.json",
      data: figmaManifest,
    }),
    replace({
      "import.meta.url": JSON.stringify(new URL(import.meta.url).href),
      delimiters: ["", ""],
      preventAssignment: true,
    }),
  ],
  build: {
    minify: mode === "production",
    sourcemap: false,
    target: "esnext",
    outDir: path.resolve(__dirname, "dist"),
    rollupOptions: {
      input: path.resolve(__dirname, "src/canvas.ts"),
      output: {
        entryFileNames: "canvas.js",
        format: "esm",
      },
    },
  },
  resolve: {
    alias: {
      "@services": path.resolve(__dirname, "src/services"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@types": path.resolve(__dirname, "src/types"),
    },
  },
}));