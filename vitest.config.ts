import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    fileParallelism: false,
    include: ["tests/{contract,integration,smoke,unit}/**/*.test.ts"],
    passWithNoTests: false,
    restoreMocks: true,
  },
});
