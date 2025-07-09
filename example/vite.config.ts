import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  base: process.env.CI ? '/excalibur-uhtml/' : '/',
  resolve: {
    alias: {
      'excalibur-uhtml': path.resolve(__dirname, '../src/index.ts'),
    },
  },
})
