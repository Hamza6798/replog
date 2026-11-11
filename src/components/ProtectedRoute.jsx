import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const loc = useLocation()
  if (loading) return <p className="py-24 text-center text-sm text-muted">Loading…</p>
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  return children
}
