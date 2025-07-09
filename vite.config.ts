import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      name: 'excalibur-uhtml',
      entry: 'src/index.ts',
      formats: ['umd', 'es'],
    },
    rollupOptions: {
      external: ['excalibur', 'uhtml'],
      output: {
        globals: {
          excalibur: 'ex',
          uhtml: 'uhtml',
        },
      },
    },
  },
})
