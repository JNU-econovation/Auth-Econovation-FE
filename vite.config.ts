import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
});
