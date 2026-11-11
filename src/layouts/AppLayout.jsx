import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { Search, FolderOpen, Activity, Wrench, Gauge, Hammer, CalendarDays, Bookmark, Moon, Sun, Menu, X, User, Zap, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

const TOP = [['Exercises', '/exercises'], ['Workouts', '/workouts'], ['Programs', '/programs'], ['Collections', '/collections'], ['API', '/api']]
const BROWSE = [
  ['Search Exercises', '/exercises', Search, null],
  ['Categories', '/exercises?facet=category', FolderOpen, 'category'],
  ['Muscles', '/exercises?facet=muscle', Activity, 'muscle'],
  ['Equipment', '/exercises?facet=equipment', Wrench, 'equipment'],
  ['Difficulty', '/exercises?facet=difficulty', Gauge, 'difficulty'],
]
const TOOLS = [['Workout Builder', '/workout-builder', Hammer], ['Program Generator', '/program-generator', CalendarDays], ['Collections', '/collections', Bookmark]]

function SideLink({ to, icon: Icon, children, active }) {
  return (
    <NavLink to={to} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${active ? 'bg-card text-fg' : 'text-muted hover:bg-card hover:text-fg'}`}>
      <Icon size={16} />{children}
    </NavLink>
  )
}

export default function AppLayout() {
  const { theme, toggle } = useTheme()
  const { user, profile } = useAuth()
  const initial = (profile?.display_name || user?.email || '?')[0].toUpperCase()
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const mainRef = useRef(null)
  useEffect(() => { mainRef.current?.scrollTo(0, 0) }, [loc.pathname])
  useEffect(() => setOpen(false), [loc.pathname, loc.search])
  const facet = new URLSearchParams(loc.search).get('facet')
  const onExercises = loc.pathname === '/' || loc.pathname === '/exercises'

  const sidebar = (
    <nav className="flex h-full flex-col gap-6 p-4">
      <div>
        <p className="mb-2 px-3 text-[11px] uppercase tracking-wider text-muted">Browse</p>
        {BROWSE.map(([label, to, Icon, f]) => (
          <SideLink key={label} to={to} icon={Icon} active={onExercises && facet === f}>{label}</SideLink>
        ))}
      </div>
      <div>
        <p className="mb-2 px-3 text-[11px] uppercase tracking-wider text-muted">Tools</p>
        {TOOLS.map(([label, to, Icon]) => (
          <SideLink key={label} to={to} icon={Icon} active={loc.pathname === to || loc.pathname.startsWith(to + '/')}>{label}</SideLink>
        ))}
      </div>
      <div className="mt-auto rounded-xl border border-line bg-card p-3 text-xs text-muted">
        <p className="mb-1 flex items-center gap-2 text-fg"><Zap size={14} className="text-lime" />Local dataset</p>
        Browsing uses the bundled dataset. Log in to save workouts, programs and collections.
      </div>
    </nav>
  )

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-panel px-4">
        <button className="btn !p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={18} /></button>
        <Link to="/exercises" className="flex items-center gap-2 font-display text-2xl font-extrabold uppercase tracking-wide">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-lime text-lime-ink"><Zap size={16} /></span>REPLOG
        </Link>
        <nav className="ml-6 hidden gap-1 md:flex">
          {TOP.map(([label, to]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `rounded-md px-3 py-1.5 text-sm transition ${isActive || (to === '/exercises' && loc.pathname === '/') ? 'text-fg' : 'text-muted hover:text-fg'}`}>{label}</NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button className="btn !p-2" onClick={toggle} aria-label="Toggle theme">{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</button>
          {user ? (
            <Link to="/profile" className="flex h-9 w-9 items-center justify-center rounded-lg bg-lime text-sm font-semibold text-lime-ink" aria-label="Profile">{initial}</Link>
          ) : (
            <Link to="/login" className="btn"><User size={16} />Log in</Link>
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-60 shrink-0 overflow-y-auto border-r border-line bg-panel lg:block">{sidebar}</aside>
        {open && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
            <aside className="relative h-full w-72 max-w-[85%] overflow-y-auto border-r border-line bg-panel">
              <button className="btn absolute right-3 top-3 !p-2" onClick={() => setOpen(false)} aria-label="Close menu"><X size={16} /></button>
              <div className="px-4 pt-4 md:hidden">
                {TOP.map(([label, to]) => <SideLink key={to} to={to} icon={ChevronRight}>{label}</SideLink>)}
              </div>
              {sidebar}
            </aside>
          </div>
        )}
        <main ref={mainRef} className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6"><Outlet /></main>
      </div>
    </div>
  )
}
