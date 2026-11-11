import { Hammer } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ComingSoon({ title, text, phase }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
      <div className="mb-4 rounded-xl border border-line bg-card p-3 text-lime"><Hammer size={22} /></div>
      <h1 className="font-display text-4xl font-bold uppercase">{title}</h1>
      <p className="mt-2 text-sm text-muted">{text}</p>
      {phase && <p className="mt-1 font-mono text-xs text-muted">Planned for Phase {phase}</p>}
      <Link to="/exercises" className="btn btn-lime mt-6">Back to exercises</Link>
    </div>
  )
}
