import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function serveDataDir(): Plugin {
  const dataDir = path.resolve(__dirname, 'data');
  return {
    name: 'serve-data-dir',
    configureServer(server) {
      server.middlewares.use('/data', (req, res, next) => {
        const url = (req.url || '').split('?')[0];
        const filePath = path.join(dataDir, decodeURIComponent(url));
        if (!filePath.startsWith(dataDir)) {
          next();
          return;
        }
        fs.readFile(filePath, (err, data) => {
          if (err) {
            next();
            return;
          }
          res.setHeader(
            'Content-Type',
            filePath.endsWith('.json') ? 'application/json' : 'text/csv'
          );
          res.end(data);
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), serveDataDir()],
  base: '/data_classification_API_blizzard/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
