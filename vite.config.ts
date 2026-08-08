import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const cleanDuplicatePublicOutput = {
  name: "clean-duplicate-upload-output",
  closeBundle() {
    const duplicateUpload = resolve("dist/public");
    if (existsSync(duplicateUpload)) rmSync(duplicateUpload, { recursive: true, force: true });
  }
};

export default defineConfig({
  plugins: [react(), tailwindcss(), cleanDuplicatePublicOutput],
  build: {
    target: "es2020",
    cssMinify: "lightningcss"
  }
});
