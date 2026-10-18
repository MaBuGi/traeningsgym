import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Uden VITE_MOCK=1 erstattes src/mock.ts af en tom stub, så hverken PGlite eller seed.sql (med svarene) kommer med i bygget.
function noMock(): Plugin {
  return {
    name: 'no-mock',
    enforce: 'pre',
    resolveId(id) {
      return process.env.VITE_MOCK !== '1' && /(^|\/)mock$/.test(id) ? '\0no-mock' : null;
    },
    load(id) {
      return id === '\0no-mock' ? 'export function mockApi() { throw new Error("mock er ikke med i dette bygge"); }' : null;
    },
  };
}

// base './' så siden virker fra en undermappe på GitHub Pages (fx mabugi.github.io/traeningsgym/).
export default defineConfig({
  base: './',
  plugins: [noMock(), react(), tailwindcss()],
  optimizeDeps: { exclude: ['@electric-sql/pglite'] },
  build: { chunkSizeWarningLimit: 1200 },
});
