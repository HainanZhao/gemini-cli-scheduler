import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
    // Exclude node_modules from transformation
    exclude: /node_modules/,
  })],
  
  // Development server configuration
  server: {
    host: true, // Allow external connections
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Preview server configuration (for production preview)
  preview: {
    host: true,
    port: 4173,
    strictPort: false,
  },

  // Build configuration for production
  build: {
    target: 'es2020', // Modern browsers support
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable source maps in production
    minify: 'esbuild', // Fast minification
    
    // Rollup options for advanced optimization
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['axios'],
        },
        // Clean asset naming
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
    
    // Performance optimization
    chunkSizeWarningLimit: 1000, // Warn for chunks larger than 1MB
    
    // Asset handling
    assetsInlineLimit: 4096, // Inline assets smaller than 4KB as base64
  },

  // CSS optimization
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      // Add any CSS preprocessor options here if needed
    },
  },

  // Define environment variables for production
  define: {
    __APP_VERSION__: JSON.stringify('1.0.0'),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },

  // Dependency optimization
  optimizeDeps: {
    include: ['react', 'react-dom', 'axios'],
    exclude: [], // Add any deps that should not be pre-bundled
  },

  // Base path configuration (useful for deployment)
  base: './', // Relative paths for flexible deployment
})
