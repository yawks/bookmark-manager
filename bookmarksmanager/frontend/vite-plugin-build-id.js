import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Vite plugin to generate a unique build ID
export default function buildIdPlugin() {
  let buildId;
  
  return {
    name: 'build-id',
    buildStart() {
      // Generate a unique build ID (timestamp + random)
      buildId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    },
    generateBundle() {
      // Inject the build ID as a constant in the bundle
      this.emitFile({
        type: 'asset',
        fileName: 'build-id.js',
        source: `window.__BUILD_ID__ = "${buildId}";`
      });
    },
    writeBundle() {
      // Also write to a file for the postbuild script
      try {
        const buildIdPath = resolve(__dirname, 'dist', 'build-id.txt');
        writeFileSync(buildIdPath, buildId);
      } catch (e) {
        // Ignore errors if dist doesn't exist yet
      }
    }
  };
}

