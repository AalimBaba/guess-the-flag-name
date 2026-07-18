import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'

function requireProductionApiUrl(value) {
  if (!value) {
    throw new Error(
      'VITE_API_URL is required for production builds. Set it to the verified HTTPS backend URL ending in /api.'
    )
  }

  let url
  try {
    url = new URL(value)
  } catch {
    throw new Error('VITE_API_URL must be a valid absolute URL.')
  }

  if (url.protocol !== 'https:') {
    throw new Error('VITE_API_URL must use HTTPS for production builds.')
  }
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    throw new Error('VITE_API_URL cannot point to localhost in a production build.')
  }
  if (!url.pathname.replace(/\/+$/, '').endsWith('/api')) {
    throw new Error('VITE_API_URL must include the /api suffix.')
  }
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (command === 'build') requireProductionApiUrl(env.VITE_API_URL?.trim())

  return {
    base: '/guess-the-flag-name/',
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
    ],
    server: {
      hmr: {
        overlay: false,
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.js',
      css: true,
    },
  }
})
