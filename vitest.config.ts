import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@shared": path.resolve(__dirname, "./src/components/common/shared"),
      "@entities": path.resolve(__dirname, "./src/components/common/entities"),
      "@pages": path.resolve(__dirname, "./src/components/feature/pages"),
      "@widget": path.resolve(__dirname, "./src/components/feature/widget"),
      "@app": path.resolve(__dirname, "./src/app"),
    },
  },
  test: {
    include: ["src/__tests__/**/*.test.ts"],
    environment: "node",
    pool: "forks",
  },
});
