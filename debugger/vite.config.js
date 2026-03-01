import { defineConfig } from "vite";
import { resolve } from "path";

const SOURCE_VERSION =
  process.env.SOURCE_VERSION || process.env.npm_package_gitHead || "dev";

export default defineConfig(({ mode }) => {
  const isDeploy = mode === "deploy";

  return {
    root: "src",
    publicDir: false,
    define: {
      "process.env.SOURCE_VERSION": JSON.stringify(SOURCE_VERSION || null),
    },
    build: {
      outDir: isDeploy
        ? resolve(__dirname, "../VisualDebugger/src/main/resources/ui")
        : resolve(__dirname, "public"),
      emptyOutDir: true,
      sourcemap: true,
    },
    server: {
      port: 3000,
    },
    preview: {
      port: 3000,
    },
  };
});
