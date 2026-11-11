import { useState } from 'react'
import { Play } from 'lucide-react'
import { handleApi, SORTS } from '../api/handlers.js'
import { CATEGORIES, DIFFICULTIES, EQUIPMENT, MUSCLES } from '../data/exercises.js'

const origin = typeof window !== 'undefined' ? window.location.origin : ''
// Example responses are produced by the real handler, so they always match the data.
const sample = (path, q = '') => JSON.stringify(handleApi('GET', path, new URLSearchParams(q)).body, null, 2)

const PARAMS = [
  ['q', 'text', 'Search words. Every word must match the name, muscle, category, equipment, type or difficulty.'],
  ['category', 'enum', CATEGORIES.join(', ')],
  ['muscle', 'enum', 'Primary muscle. See /api/meta for the full list.'],
  ['equipment', 'enum', EQUIPMENT.join(', ')],
  ['difficulty', 'enum', DIFFICULTIES.join(', ')],
  ['sort', 'enum', `${SORTS.join(', ')} (default name-asc)`],
  ['limit', 'integer', '1 to 100 (default 20)'],
  ['offset', 'integer', 'Number of results to skip (default 0)'],
]
const PRESETS = ['/api/exercises?q=chest dumbbell&limit=2', '/api/exercises/0001', '/api/exercises?category=Legs&difficulty=Beginner', '/api/meta']

function Code({ children, max = 'max-h-80' }) {
  return <pre className={`${max} overflow-auto rounded-lg border border-line bg-ink p-3 font-mono text-xs leading-relaxed`}>{children}</pre>
}
function H({ children }) { return <h2 className="mb-2 mt-8 font-display text-2xl font-bold uppercase">{children}</h2> }

function Tester() {
  const [path, setPath] = useState(PRESETS[0])
  const [out, setOut] = useState(null)
  const [busy, setBusy] = useState(false)
  async function send() {
    setBusy(true)
    const t = performance.now()
    try {
      const res = await fetch(path.replace(/ /g, '%20'))
      const text = await res.text()
      let body = text
      try { body = JSON.stringify(JSON.parse(text), null, 2) } catch { /* not JSON, show as is */ }
      setOut({ status: res.status, ms: Math.round(performance.now() - t), body })
    } catch (e) {
      setOut({ status: 'Network error', ms: Math.round(performance.now() - t), body: `${e.message}\nThe API is not reachable from this page.` })
    }
    setBusy(false)
  }
  return (
    <div className="rounded-xl border border-line bg-card p-4">
      <div className="flex flex-wrap gap-2">{PRESETS.map((p) => <button key={p} className="chip" onClick={() => setPath(p)}>{p.replace('/api', '')}</button>)}</div>
      <div className="mt-3 flex gap-2">
        <input value={path} onChange={(e) => setPath(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-line bg-ink px-3 py-2 font-mono text-xs outline-none focus:border-muted" aria-label="Request path" />
        <button className="btn btn-lime" onClick={send} disabled={busy}><Play size={14} />{busy ? 'Sending…' : 'Send'}</button>
      </div>
      {out && (
        <div className="mt-3">
          <p className="mb-1 font-mono text-xs text-muted">Status {out.status} · {out.ms} ms (measured in your browser)</p>
          <Code>{out.body}</Code>
        </div>
      )}
    </div>
  )
}

export default function ApiDocs() {
  return (
    <div className="mx-auto max-w-3xl pb-10">
      <h1 className="font-display text-4xl font-bold uppercase">API</h1>
      <p className="mt-1 text-sm text-muted">A small read-only JSON API for REPLOG's exercise library. No key required. It serves the bundled dataset only, not user data.</p>

      <H>Overview</H>
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
        <li>Base URL: <code className="font-mono text-fg">{origin || 'your-site'}/api</code></li>
        <li>Methods: <code className="font-mono text-fg">GET</code> only. Other methods return 405.</li>
        <li>Responses are JSON. Errors look like <code className="font-mono text-fg">{'{ "error": { "code", "message" } }'}</code>.</li>
        <li><code className="font-mono text-fg">imageUrl</code> and <code className="font-mono text-fg">images</code> are paths on this site (for example <code className="font-mono text-fg">/exercises/0001-0.jpg</code>), or empty when no photo exists. Photos: Free Exercise DB, public domain.</li>
        <li><code className="font-mono text-fg">imageUrl</code> and <code className="font-mono text-fg">images</code> are paths on this site (for example <code className="font-mono text-fg">/exercises/0001-0.jpg</code>), or empty when an exercise has no photo.</li>
        <li>CORS is open for reads, so browsers on other sites can call it.</li>
      </ul>

      <H>Endpoints</H>
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full text-left text-sm">
          <tbody className="divide-y divide-line">
            {[['GET /api/exercises', 'Search and filter exercises. Returns summaries and paging info.'], ['GET /api/exercises/:id', 'One exercise with instructions, common mistakes and related exercises.'], ['GET /api/meta', 'Valid filter values and the total exercise count.']].map(([e, d]) => (
              <tr key={e}><td className="whitespace-nowrap p-3 font-mono text-xs text-lime">{e}</td><td className="p-3 text-muted">{d}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <H>Search and filter parameters</H>
      <p className="mb-2 text-sm text-muted">For <code className="font-mono text-fg">GET /api/exercises</code>. Filters can be combined, and enum values are case-insensitive. Invalid values return 400.</p>
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full text-left text-sm">
          <tbody className="divide-y divide-line">
            {PARAMS.map(([n, t, d]) => <tr key={n}><td className="p-3 font-mono text-xs text-lime">{n}</td><td className="p-3 text-xs text-muted">{t}</td><td className="p-3 text-muted">{d}</td></tr>)}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted">Primary muscles: {MUSCLES.join(', ')}.</p>

      <H>Example requests</H>
      <Code>{`curl "${origin}/api/exercises?q=chest%20dumbbell&limit=2"\ncurl "${origin}/api/exercises?category=Legs&difficulty=Beginner&sort=name-desc"\ncurl "${origin}/api/exercises/0001"\ncurl "${origin}/api/meta"`}</Code>

      <H>Example: search</H>
      <p className="mb-2 text-sm text-muted"><code className="font-mono text-fg">/api/exercises?q=chest dumbbell&amp;limit=2</code></p>
      <Code>{sample('/api/exercises', 'q=chest dumbbell&limit=2')}</Code>

      <H>Example: exercise detail</H>
      <p className="mb-2 text-sm text-muted"><code className="font-mono text-fg">/api/exercises/0001</code></p>
      <Code>{sample('/api/exercises/0001')}</Code>

      <H>Example: error</H>
      <p className="mb-2 text-sm text-muted"><code className="font-mono text-fg">/api/exercises?difficulty=expert</code> returns status 400.</p>
      <Code>{sample('/api/exercises', 'difficulty=expert')}</Code>

      <H>Try it</H>
      <Tester />
    </div>
  )
}
