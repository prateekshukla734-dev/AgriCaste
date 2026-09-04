// Test vite config with minimal React setup
const path = require('path');

module.exports = {
  root: '.',
  css: {
    postcss: false,
  },
  build: {
    outDir: 'dist-test',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.test.html')
      }
    },
    sourcemap: false,
    minify: false, // Don't minify for debugging
  },
  server: {
    port: 3000,
  },
};