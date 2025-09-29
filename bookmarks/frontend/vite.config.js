import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
    },
  },
  build: {
    outDir: '..',
    emptyOutDir: false,
    rollupOptions: {
      input: 'src/main.tsx',
      output: {
        entryFileNames: 'js/main.js',
        assetFileNames: 'css/style.css'
      }
    }
  }
})