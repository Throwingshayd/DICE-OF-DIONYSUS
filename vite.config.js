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
    cors: true,
    strictPort: true,
    // Windows: some setups resolve "localhost" to ::1 while the server is IPv4-first; explicit HMR host reduces WS failures
    hmr: {
      host: 'localhost',
      protocol: 'ws',
    },
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
  
  // Define global constants (__DEV__ for classic scripts that cannot use import.meta)
  define: {
    __VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  }
});

