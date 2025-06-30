import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/router'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Verificar si hay un token guardado al cargar la aplicación
    const token = localStorage.getItem('token')
    if (token) {
      verifyToken(token)
    } else {
      setIsLoading(false)
    }
    // Exponer la función globalmente para acceso desde otras páginas
    if (typeof window !== 'undefined') {
      (window as any).redirectToLoginWithOriginalPath = redirectToLoginWithOriginalPath;
    }
  }, [])

  // Guardar la ruta original antes de redirigir al login
  const redirectToLoginWithOriginalPath = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('originalPath', window.location.pathname)
    }
    router.push('/login')
  }

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        localStorage.removeItem('token')
      }
    } catch (error) {
      console.error('Error verifying token:', error)
      localStorage.removeItem('token')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const { token, user: userData } = await response.json()
        localStorage.setItem('token', token)
        setUser(userData)
        // Redirigir a la ruta original si existe, si no, al dashboard
        const originalPath = localStorage.getItem('originalPath')
        if (originalPath && originalPath !== '/login') {
          localStorage.removeItem('originalPath')
          router.push(originalPath)
        } else {
          router.push('/dashboard')
        }
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('Error during login:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    router.push('/login')
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 