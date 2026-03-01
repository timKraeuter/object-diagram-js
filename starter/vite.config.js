import { defineConfig } from "vite";
import { resolve } from "path";

const SOURCE_VERSION =
  process.env.SOURCE_VERSION || process.env.npm_package_gitHead || "dev";

export default defineConfig(({ mode }) => {
  const isGhPages = mode === "ghpages";

  return {
    root: "src",
    publicDir: false,
    base: isGhPages ? "/object-diagram-js/" : "/",
    define: {
      "process.env.SOURCE_VERSION": JSON.stringify(SOURCE_VERSION || null),
    },
    build: {
      outDir: isGhPages
        ? resolve(__dirname, "../docs")
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
