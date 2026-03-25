// ===========================
// src/pages/Login.tsx
// ===========================
// Primera pantalla que ve cualquier usuario.
// Mejoras en este sprint:
//   - Botón para mostrar/ocultar contraseña
//   - Bloqueo temporal después de 3 intentos fallidos
//   - Contador regresivo visible al estar bloqueado
//   - Botón para regresar a la landing page
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

  // Controla si la contraseña se ve o está oculta
  // false = oculta (puntos), true = visible (texto normal)
  const [mostrarPassword, setMostrarPassword] = useState(false)

  // Cuántos intentos fallidos lleva el usuario en esta sesión
  const [intentosFallidos, setIntentosFallidos] = useState(0)

  // Segundos restantes del bloqueo. 0 = no está bloqueado.
  const [segundosRestantes, setSegundosRestantes] = useState(0)

  // Indica si la cuenta está bloqueada en este momento
  const estaBloqueado = segundosRestantes > 0

  // Inicia el contador regresivo del bloqueo
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
          setError(`Demasiados intentos fallidos. Espera ${SEGUNDOS_BLOQUEO} segundos.`)
          iniciarBloqueo()
        } else {
          const restantes = MAX_INTENTOS - nuevosIntentos
          setError(
            `Credenciales incorrectas. ${restantes} intento${restantes === 1 ? "" : "s"} restante${restantes === 1 ? "" : "s"}.`
          )
        }
      }
    } catch {
      setError("Usuario o contraseña incorrectos. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        {/* Botón regresar a la landing page
            Aparece discreto arriba del formulario.
            navigate("/") lleva a la ruta raíz = Landing */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-dark transition-colors mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Regresar al inicio
        </button>

        {/* Logo y título */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-dark">MedTrack</h1>
          <p className="text-slate-500 mt-1 text-sm">Sistema de gestión psicológica</p>
        </div>

        {/* Mensaje de error o bloqueo */}
        {error && (
          <div className={`text-sm px-4 py-3 rounded-lg mb-4 ${
            estaBloqueado
              ? "bg-orange-50 text-orange-600"
              : "bg-red-50 text-red-600"
          }`}>
            {estaBloqueado
              ? `⏳ Cuenta bloqueada temporalmente. Intenta de nuevo en ${segundosRestantes}s.`
              : `⚠️ ${error}`
            }
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Campo de correo */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
              disabled={estaBloqueado}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 placeholder-slate-400
                        focus:outline-none focus:ring-2 focus:ring-primary
                        disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
            />
          </div>

          {/* Campo de contraseña con botón mostrar/ocultar */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            {/* "relative" permite posicionar el botón del ojo dentro del input */}
            <div className="relative">
              <input
                id="password"
                type={mostrarPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={estaBloqueado}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 pr-12 text-slate-800 placeholder-slate-400
                          focus:outline-none focus:ring-2 focus:ring-primary
                          disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
              />
              {/* Botón del ojo — type="button" evita que envíe el formulario */}
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                disabled={estaBloqueado}
                aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors disabled:cursor-not-allowed"
              >
                {mostrarPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Botón submit — deshabilitado si carga o está bloqueado */}
          <button
            type="submit"
            disabled={loading || estaBloqueado}
            className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed
                      text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>

        </form>

        {/* SOLO PARA DESARROLLO - borrar cuando PHP esté listo */}
        <button
          onClick={() => {
            login({
              userId: 1,
              nombre: "Admin",
              apellido: "Test",
              email: "test@test.com",
              rol: "psicologo",
              token: "fake-token-dev"
            })
            navigate("/psicologo/dashboard")
          }}
          className="w-full mt-2 border border-slate-200 text-slate-400 text-sm py-2 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Entrar como psicólogo (dev)
        </button>

      </div>
    </div>
  )
}