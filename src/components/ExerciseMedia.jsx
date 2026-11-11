import { useEffect, useState } from 'react'
import { Dumbbell } from 'lucide-react'

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Cards show the first photo. The detail page (large) alternates start and end
// positions, unless the visitor prefers reduced motion. Falls back to a placeholder.
export default function ExerciseMedia({ exercise, className = '', large = false }) {
  const [failed, setFailed] = useState(false)
  const [frame, setFrame] = useState(0)
  const [reduced] = useState(prefersReducedMotion)
  const frames = exercise.images?.length ? exercise.images : exercise.imageUrl ? [exercise.imageUrl] : []
  const shown = large ? frames : frames.slice(0, 1)

  useEffect(() => {
    if (!large || shown.length < 2 || reduced || failed) return
    const t = setInterval(() => setFrame((f) => (f + 1) % shown.length), 1300)
    return () => clearInterval(t)
  }, [large, shown.length, reduced, failed])

  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-lg border border-line bg-ink ${className}`}>
      {shown.length > 0 && !failed ? (
        shown.map((src, i) => (
          <img key={src} src={src} alt={i === 0 ? `${exercise.name} demonstration` : ''} aria-hidden={i !== 0} loading={large ? 'eager' : 'lazy'}
            onError={() => setFailed(true)}
            className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${large ? 'object-contain' : 'object-cover'} ${i === frame || !large ? 'opacity-100' : 'opacity-0'}`} />
        ))
      ) : (
        <div className="flex flex-col items-center gap-2 text-center text-muted">
          <Dumbbell size={large ? 44 : 26} />
          {large && <span className="px-4 text-xs">Demonstration not available yet</span>}
        </div>
      )}
    </div>
  )
}
