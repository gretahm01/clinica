// ===========================
// src/pages/Login.tsx
// ===========================

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { loginRequest } from "../services/api"

// Máximo de intentos antes de bloquear temporalmente
const MAX_INTENTOS = 3
// Segundos que dura el bloqueo
const SEGUNDOS_BLOQUEO = 30

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)

  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [intentosFallidos, setIntentosFallidos] = useState(0)
  const [segundosRestantes, setSegundosRestantes] = useState(0)

  const estaBloqueado = segundosRestantes > 0

  function iniciarBloqueo() {
    setSegundosRestantes(SEGUNDOS_BLOQUEO)
    const intervalo = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          clearInterval(intervalo)
          setIntentosFallidos(0)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (estaBloqueado) return
    setError("")
    setLoading(true)

    try {
      const respuesta = await loginRequest(email, password)
      if (respuesta.success) {
        login(respuesta.data)
        navigate(`/${respuesta.data.rol}/dashboard`)
      } else {
        const nuevosIntentos = intentosFallidos + 1
        setIntentosFallidos(nuevosIntentos)
        if (nuevosIntentos >= MAX_INTENTOS) {
          setError(`Demasiados intentos fallidos.`)
          iniciarBloqueo()
        } else {
          const restantes = MAX_INTENTOS - nuevosIntentos
          setError(
            `Credenciales incorrectas. ${restantes} intento${restantes === 1 ? "" : "s"} restante${restantes === 1 ? "" : "s"}.`
          )
        }
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-emerald-100/80 flex items-center justify-center px-6 font-medium tracking-tight">
      <div className="bg-white rounded-[2.5rem] border border-white shadow-xl p-10 w-full max-w-md transition-all">

        {/* Botón regresar con estilo minimalista */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-600 transition-colors mb-8 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al inicio
        </button>

        {/* Logo y título con estilo de la Landing */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mx-auto mb-4">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tighter">Bienvenido</h1>
          <p className="text-slate-500 mt-2 text-base font-light">Ingresa tus credenciales para continuar</p>
        </div>

        {/* Mensajes de error/bloqueo */}
        {error && (
          <div className={`text-sm px-5 py-4 rounded-2xl mb-6 flex items-center gap-3 border ${
            estaBloqueado
              ? "bg-amber-50 text-amber-700 border-amber-100"
              : "bg-rose-50 text-rose-700 border-rose-100"
          }`}>
            <span className="text-lg">{estaBloqueado ? "⏳" : "⚠️"}</span>
            <p className="leading-tight">
              {estaBloqueado
                ? `Cuenta bloqueada. Intenta de nuevo en ${segundosRestantes}s.`
                : error
              }
            </p>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Campo Correo */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@correo.com"
              required
              disabled={estaBloqueado}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-slate-800 placeholder-slate-400
                        focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all
                        disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Campo Contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={mostrarPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={estaBloqueado}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 pr-14 text-slate-800 placeholder-slate-400
                          focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all
                          disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                disabled={estaBloqueado}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
              >
                {mostrarPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Botón Acceder */}
          <button
            type="submit"
            disabled={loading || estaBloqueado}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed
                      text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 hover:-translate-y-0.5"
          >
            {loading ? "Verificando..." : "Iniciar Sesión"}
          </button>

        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-400 text-xs uppercase tracking-[0.2em]">MedTrack System</p>
        </div>
        
      </div>
    </div>
  )
}