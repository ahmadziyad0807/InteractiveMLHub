import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { securityConfig } from './security.config'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  server: {
    port: 3000,
    open: true,
    headers: securityConfig.headers,
    https: false, // Set to true in production with proper certificates
    host: 'localhost',
    strictPort: true,
  },
  preview: {
    headers: securityConfig.headers,
    https: false, // Set to true in production
    host: 'localhost',
    port: 4173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disabled for security
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true, // Remove debugger statements
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-tabs', '@radix-ui/react-slider', '@radix-ui/react-collapsible'],
          icons: ['lucide-react']
        }
      }
    }
  },
  base: './',
  define: {
    // Remove global process in production
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
})