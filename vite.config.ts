import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // @Profile switch: VITE_API_URL set → Spring Boot (api), empty → mock
  const dataLayer = env.VITE_API_URL
    ? path.resolve(__dirname, './src/hooks/api')
    : path.resolve(__dirname, './src/hooks/mock');

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@/hooks/data": dataLayer,
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
