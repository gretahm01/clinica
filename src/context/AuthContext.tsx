// ===========================
// src/context/AuthContext.tsx
// ===========================
import { createContext, useState, useEffect, useRef, useCallback } from "react"
import type { ReactNode } from "react"
import type { Usuario } from "../types"

const MINUTOS_INACTIVIDAD = 30

interface AuthContextType {
  usuario: Usuario | null
  login: (usuario: Usuario) => void
  logout: () => void
  isAuthenticated: boolean
}

// Esta constante necesita estar aquí para que useAuth.ts la importe
// El warning persiste por esto, pero NO afecta funcionamiento.
// Es solo una limitación de Vite con archivos mixtos.
// La solución "perfecta" requeriría 3 archivos separados lo cual
// complica más de lo que vale para este proyecto.
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    try {
      const guardado = localStorage.getItem("usuario")
      return guardado ? JSON.parse(guardado) : null
    } catch {
      localStorage.removeItem("usuario")
      return null
    }
  })

  const temporizadorRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const reiniciarTemporizador = useCallback(() => {
    if (temporizadorRef.current) clearTimeout(temporizadorRef.current)
    if (!localStorage.getItem("usuario")) return
    temporizadorRef.current = setTimeout(() => {
      setUsuario(null)
      localStorage.removeItem("usuario")
    }, MINUTOS_INACTIVIDAD * 60 * 1000)
  }, [])

  useEffect(() => {
    if (!usuario) return
    const eventos = ["mousemove", "keydown", "click", "scroll", "touchstart"]
    eventos.forEach(e => window.addEventListener(e, reiniciarTemporizador))
    reiniciarTemporizador()
    return () => {
      eventos.forEach(e => window.removeEventListener(e, reiniciarTemporizador))
      if (temporizadorRef.current) clearTimeout(temporizadorRef.current)
    }
  }, [usuario, reiniciarTemporizador])

  function login(nuevoUsuario: Usuario) {
    setUsuario(nuevoUsuario)
    localStorage.setItem("usuario", JSON.stringify(nuevoUsuario))
  }

  function logout() {
    setUsuario(null)
    localStorage.removeItem("usuario")
    if (temporizadorRef.current) clearTimeout(temporizadorRef.current)
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout, isAuthenticated: usuario !== null }}>
      {children}
    </AuthContext.Provider>
  )
}