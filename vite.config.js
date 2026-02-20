import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  root: 'game',
  base: './',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    sourcemap: true,
  },
  
  // Development server configuration
  server: {
    port: 3000,
    open: true,
    cors: true
  },
  
  // Preview server configuration
  preview: {
    port: 4173,
    open: true
  },
  
  // Plugins
  plugins: [
    // Legacy browser support
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  
  // CSS configuration
  css: {
    devSourcemap: true
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['workbox-window']
  },
  
  // Define global constants
  define: {
    __VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
});

