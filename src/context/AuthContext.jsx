import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'

const AuthContext = createContext(null)
const NOT_CONFIGURED = { message: 'Supabase is not configured. Add your keys to the .env file (see README).' }

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false) })
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  const userId = session?.user?.id
  useEffect(() => {
    if (!supabase || !userId) { setProfile(null); return }
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle().then(({ data }) => setProfile(data))
  }, [userId])

  const guard = (fn) => (...args) => (supabase ? fn(...args) : Promise.resolve({ error: NOT_CONFIGURED }))

  const value = {
    user: session?.user ?? null,
    session, profile, loading,
    signUp: guard(async (email, password, displayName) => {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName } } })
      return { error, needsConfirmation: !error && !data.session }
    }),
    signIn: guard(async (email, password) => ({ error: (await supabase.auth.signInWithPassword({ email, password })).error })),
    signOut: guard(async () => ({ error: (await supabase.auth.signOut()).error })),
    sendPasswordReset: guard(async (email) => ({ error: (await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` })).error })),
    updatePassword: guard(async (password) => ({ error: (await supabase.auth.updateUser({ password })).error })),
    updateProfile: guard(async (fields) => {
      const { data, error } = await supabase.from('profiles').update(fields).eq('id', userId).select().maybeSingle()
      if (!error && data) setProfile(data)
      return { error }
    }),
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
