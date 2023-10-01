/// <reference types="vitest" />
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/slashdown.ts'),
      name: 'Slashdown',
      fileName: 'slashdown',
    },
    rollupOptions: {
      output: {
        globals: {
        },
      },
    },
  },
})