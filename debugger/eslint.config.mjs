import prettierConfig from "eslint-config-prettier";

export default [
  prettierConfig,
  {
    ignores: ["**/public", "node_modules", "coverage", "docs", "**/generated"],
  },
];
