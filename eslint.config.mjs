import js from "@eslint/js";
import n from "eslint-plugin-n";
import json from "eslint-plugin-json";
import eslintPlugin from "eslint-plugin-eslint-plugin";
import globals from "globals";

const eslintPluginRecommended = Object.fromEntries(
  Object.entries(eslintPlugin.rules)
    .filter(([, rule]) => rule?.meta?.docs?.recommended)
    .map(([name]) => [`eslint-plugin/${name}`, "error"])
);

export default [
  { ignores: ["node_modules/**"] },

  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: { ...globals.node, ...globals.mocha },
    },
  },

  js.configs.recommended,
  n.configs["flat/recommended-script"],
  json.configs.recommended,

  {
    files: ["**/*.mjs"],
    languageOptions: { sourceType: "module" },
  },

  {
    files: ["lib/rules/*.js"],
    plugins: { "eslint-plugin": eslintPlugin },
    rules: eslintPluginRecommended,
  },
];
