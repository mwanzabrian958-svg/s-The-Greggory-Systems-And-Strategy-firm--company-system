import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { connectSocket, disconnectSocket } from '../services/socket'

const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tgf_user')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Only hydrate a real session — a profile without a token is stale
        if (parsed?.token) return parsed
      } catch (e) {
        // Corrupt session blob — fall through to the admin session / anonymous
      }
    }
    const adminSaved = localStorage.getItem('gf_admin_user')
    if (adminSaved) {
      try {
        const adminData = JSON.parse(adminSaved)
        if (adminData?.token) return { ...adminData, role: adminData.role || 'admin' }
      } catch (e) {
        // Corrupt admin blob — fall through to anonymous
      }
    }
    return null
  })

  useEffect(() => {
    const syncAuth = () => {
      const saved = localStorage.getItem('tgf_user')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed?.token) {
            setUser(parsed)
            return
          }
        } catch (e) {
          // Corrupt session blob — fall through to the admin session
        }
      }
      const adminSaved = localStorage.getItem('gf_admin_user')
      if (adminSaved) {
        try {
          const adminData = JSON.parse(adminSaved)
          if (adminData?.token) {
            setUser({ ...adminData, role: adminData.role || 'admin' })
            return
          }
        } catch (e) {
          // Corrupt admin blob — fall through to anonymous
        }
      }
      setUser(null)
    }
    window.addEventListener('storage', syncAuth)
    window.addEventListener('gf-admin-session-changed', syncAuth)
    return () => {
      window.removeEventListener('storage', syncAuth)
      window.removeEventListener('gf-admin-session-changed', syncAuth)
    }
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('tgf_user', JSON.stringify(userData))
  }

  // Realtime: connect the socket whenever a session token exists (login or a
  // hydrated session), disconnect on logout. Best-effort — a realtime outage
  // must never break authentication.
  useEffect(() => {
    const token = user?.token
    if (token) {
      try {
        connectSocket(undefined, token)
      } catch (e) {
        console.warn('Realtime connect failed:', e)
      }
    } else {
      disconnectSocket()
    }
  }, [user?.token])

  const logout = () => {
    setUser(null)
    localStorage.removeItem('tgf_user')
    localStorage.removeItem('gf_admin_user')
    localStorage.removeItem('gf_admin_session_token')
  }

  const value = useMemo(() => ({
    isAuthenticated: !!user,
    user,
    login,
    logout,
  }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
