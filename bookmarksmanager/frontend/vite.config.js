import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import { defineConfig } from "vite"
import path from "path"
import react from "@vitejs/plugin-react"

export default defineConfig({
  server: {
    proxy: {
      '/apps/bookmarksmanager/api': {
        target: 'https://nextcloud.yawks.net',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    TanStackRouterVite(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
    },
  },
  base: '/apps/bookmarksmanager/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
    sourcemap: false,
    rollupOptions: {
      input: 'src/main.tsx',
      output: {
        entryFileNames: 'main.js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: ({ name }) => {
          if (name && name.endsWith('.css')) {
            return 'style.css'
          }
          return 'assets/[name][extname]'
        }
      },
      external: []
    }
  }
})