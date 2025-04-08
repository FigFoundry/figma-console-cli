// eslint.config.js
// @ts-check
import eslint from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tseslintParser from "@typescript-eslint/parser";

export default {
  files: ["**/*.{js,jsx,ts,tsx}"],
  languageOptions: {
    parser: tseslintParser,
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  rules: {
    "no-unused-vars": "warn",
    "no-console": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/explicit-function-return-type": "off"
  },
  ignores: [
    "dist/**",
    'node_modules/',
    '.env',
    '.env.local',
    'vite.config.ts'
  ],
  plugins: {
    "@typescript-eslint": tseslint,
  },
};