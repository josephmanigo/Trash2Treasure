import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // Required for camera access in development (HTTPS not needed on localhost)
    https: false,
  },
  optimizeDeps: {
    // Pre-bundle heavy deps for faster cold starts
    include: [
      'react',
      'react-dom',
      'framer-motion',
      '@react-three/fiber',
      '@react-three/drei',
      'three',
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'tf-vendor': ['@tensorflow/tfjs', '@tensorflow-models/coco-ssd'],
        },
      },
    },
  },
})
