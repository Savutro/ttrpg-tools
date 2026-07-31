import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      input: {
        overview: resolve(import.meta.dirname, "index.html"),
        standee: resolve(import.meta.dirname, "standee.html")
      }
    }
  }
});
