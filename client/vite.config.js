// Modern Vite config with Tailwind v3
module.exports = {
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  build: {
    sourcemap: false,
    minify: 'esbuild'
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://sih-crop-recommendation.onrender.com/',
        changeOrigin: true
      }
    }
  }
};