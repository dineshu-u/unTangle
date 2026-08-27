import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { handleMindyGroqRequest } from './src/server/groqHandler.ts';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'groq-mindy-api',
      configureServer(server) {
        server.middlewares.use('/api/mindy/respond', (req, res) => {
          handleMindyGroqRequest(req, res);
        });
      },
    },
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
});
