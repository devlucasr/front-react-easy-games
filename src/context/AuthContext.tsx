import { createContext, useState, useEffect, ReactNode, useContext } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { User } from '../types/types'

interface AuthContextType {
  user: User | null
  token: string | null
  signIn: (credentials: { email: string; senha: string }) => Promise<{ user: User; token: string }>
  signOut: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    }
  }, [])

  const signIn = async (credentials: { email: string; senha: string }): Promise<{ user: User; token: string }> => {
    try {
      const response = await axios.post('http://192.168.1.19:8080/user/login', { ...credentials })
      const { user, token } = response.data
  
      if (user && token) {
        setUser(user)
        setToken(token)
  
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('token', token)
  
        router.push('/')
        return { user, token }
      } else {
        throw new Error('Dados de login inválidos.')
      }
    } catch (error) {
      throw error
    }
  }
  
  

  const signOut = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
