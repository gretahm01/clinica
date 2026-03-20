// ===========================
// src/hooks/useAuth.ts   ← ruta actualizada
// ===========================
// Hook para acceder al contexto de autenticación.
// Se ubica en hooks/ porque es un custom hook reutilizable,
// siguiendo la convención de React de separar hooks en su propia carpeta.
// ===========================

import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider")
  }
  return context
}