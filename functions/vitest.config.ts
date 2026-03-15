/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Vitest automatically finds test files (e.g., *.test.ts) and handles
    // TypeScript and ES Modules out of the box. No complex transformers or
    // module mappers are needed.
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "clover", "json-summary"],
      reportsDirectory: "coverage/vitest",
      include: ["src/**/*.ts"],
      exclude: [
        "**/*.d.ts",
        "**/*.test.ts",
        "**/node_modules/**",
        // Exclude type definition files from coverage
        "src/cloudstorage/scout_types.ts",
      ],
    },
  },
});
