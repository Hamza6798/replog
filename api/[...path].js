// Vercel serverless function: serves every /api/* route using the shared handler.
import { handleApi } from '../src/api/handlers.js'

export default function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  const r = handleApi(req.method, url.pathname, url.searchParams)
  Object.entries(r.headers).forEach(([k, v]) => res.setHeader(k, v))
  if (r.body === null) return res.status(r.status).end()
  res.status(r.status).json(r.body)
}
