import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import { defineConfig } from "vite"
import path from "path"
import react from "@vitejs/plugin-react"
import buildIdPlugin from './vite-plugin-build-id.js'

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
    buildIdPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
    },
  },
  base: '/apps/bookmarksmanager/',
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
    sourcemap: false,
    rollupOptions: {
      input: 'src/main.tsx',
      output: {
        format: 'iife',
        entryFileNames: 'main.js',
        inlineDynamicImports: true,
        assetFileNames: ({ name }) => {
          if (name && name.endsWith('.css')) {
            return 'style.css'
          }
          return 'assets/[name][extname]'
        },
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      },
       // Prevent externalization of these libs so they are bundled into the IIFE
      external: []
    }
  }
})