import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      lib: resolve(__dirname, "lib"),
      test: resolve(__dirname, "test"),
    },
  },
  test: {
    include: ["test/spec/**/*Spec.js"],
    browser: {
      enabled: true,
      provider: "playwright",
      instances: [{ browser: "chromium" }],
    },
    setupFiles: ["test/setup.js"],
  },
});
