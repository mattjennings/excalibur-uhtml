import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      'excalibur-uhtml': path.resolve(__dirname, '../src/index.ts'),
    },
  },
})
