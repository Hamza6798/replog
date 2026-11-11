import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { handleApi } from './src/api/handlers.js'

// Serves the same /api/* routes locally that Vercel serves in production.
function replogApi() {
  const middleware = (req, res, next) => {
    if (!req.url.startsWith('/api/')) return next()
    const url = new URL(req.url, 'http://localhost')
    const r = handleApi(req.method, url.pathname, url.searchParams)
    res.statusCode = r.status
    Object.entries(r.headers).forEach(([k, v]) => res.setHeader(k, v))
    if (r.body === null) return res.end()
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify(r.body))
  }
  return {
    name: 'replog-api',
    configureServer(server) { server.middlewares.use(middleware) }, // no return: a returned function would be run as a post hook
    configurePreviewServer(server) { server.middlewares.use(middleware) },
  }
}

export default defineConfig({ plugins: [react(), replogApi()] })
