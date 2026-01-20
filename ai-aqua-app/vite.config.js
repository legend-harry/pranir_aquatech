import React from 'react';

export default function viteConfig({ command, mode }) {
  return {
    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['react', 'react-dom'],
          },
        },
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
  };
}
