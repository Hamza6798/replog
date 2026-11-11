import { Link } from 'react-router-dom'
import { CalendarDays, FilePlus2, Info } from 'lucide-react'
import { TEMPLATES } from '../data/programTemplates.js'
import { WEEKDAYS } from '../utils/programValidation.js'

export default function ProgramGenerator() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-4xl font-bold uppercase">Program Generator</h1>
      <p className="mt-1 text-sm text-muted">Pick a template. It is built from real exercises in the library, and you can change everything before saving.</p>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {TEMPLATES.map((t) => (
          <Link key={t.key} to={`/programs/new?template=${t.key}`} className="group rounded-xl border border-line bg-card p-4 transition hover:border-muted">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg font-semibold">{t.title}</h2>
              <span className="tag">{t.level}</span>
            </div>
            <p className="mt-1 text-sm text-muted">{t.description}</p>
            <div className="mt-3 flex gap-1" aria-label="Weekly schedule">
              {WEEKDAYS.map((w, i) => (
                <span key={w} className={`flex-1 rounded-md py-1 text-center text-[10px] ${t.days.some((d) => d[1] === i) ? 'bg-lime text-lime-ink font-semibold' : 'bg-ink text-muted'}`}>{w}</span>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">{t.days.map((d) => d[0]).join(' • ')}</p>
          </Link>
        ))}
        <Link to="/programs/new" className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line p-4 text-center transition hover:border-muted">
          <FilePlus2 size={24} className="mb-2 text-muted" />
          <h2 className="font-semibold">Start from scratch</h2>
          <p className="text-sm text-muted">Build your own week day by day.</p>
        </Link>
      </div>
      <p className="mt-6 flex gap-2 text-xs text-muted"><Info size={14} className="shrink-0" />Templates are general starting points, not medical advice or personalised coaching. Adjust the load to what is comfortable for you.</p>
      <Link to="/programs" className="mt-4 inline-flex items-center gap-2 text-sm text-lime hover:underline"><CalendarDays size={14} />View my saved programs</Link>
    </div>
  )
}
