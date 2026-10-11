import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Vitest runs against the pure logic in `src/lib` — the feed parser, URL
 * allow-list, API mappers and the article merge. Everything tested here is
 * side-effect free at import time (network/filesystem only happen inside the
 * functions), so a plain node environment is enough.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
      include: ["src/lib/**/*.ts"],
      exclude: ["src/lib/**/*.test.ts"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
