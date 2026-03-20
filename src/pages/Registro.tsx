// ===========================
// src/pages/Registro.tsx
// ===========================
// Página de solicitud de acceso / prueba gratis.
// Cualquier clínica interesada llena este formulario.
//
// Por ahora guarda los datos en consola (mock).
// Cuando PHP esté listo, se conecta a un endpoint
// que crea la cuenta de admin de la clínica y envía
// un correo de bienvenida con sus credenciales.
// ===========================

import { useState } from "react"
import { useNavigate } from "react-router-dom"

const PLANES = ["Básico", "Profesional", "Clínica"]

interface DatosSolicitud {
  nombreClinica: string
  nombreContacto: string
  email: string
  telefono: string
  plan: string
  mensaje: string
}

export default function Registro() {
  const navigate = useNavigate()

  const [form, setForm] = useState<DatosSolicitud>({
    nombreClinica: "",
    nombreContacto: "",
    email: "",
    telefono: "",
    plan: "Profesional",
    mensaje: "",
  })

  const [error, setError]     = useState("")
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  // Actualiza un campo del formulario sin perder los demás
  function actualizarCampo(campo: keyof DatosSolicitud, valor: string) {
    setForm(prev => ({ ...prev, [campo]: valor }))
    setError("")
  }

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombreClinica.trim()) return setError("El nombre de la clínica es requerido")
    if (!form.nombreContacto.trim()) return setError("El nombre de contacto es requerido")
    if (!form.email.trim()) return setError("El correo electrónico es requerido")
    if (!form.telefono.trim()) return setError("El teléfono es requerido")

    setLoading(true)
    try {
      // TODO: reemplazar con llamada real a PHP cuando esté listo
      await new Promise(resolve => setTimeout(resolve, 1200))
      console.log("Solicitud enviada:", form)
      setEnviado(true)
    } catch {
      setError("Error al enviar la solicitud. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  // Pantalla de confirmación tras enviar
  if (enviado) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-dark mb-3">¡Solicitud recibida!</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-2">
            Hemos recibido tu solicitud para{" "}
            <span className="font-medium text-dark">{form.nombreClinica}</span>.
          </p>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            En menos de 24 horas te contactaremos en{" "}
            <span className="font-medium text-dark">{form.email}</span>{" "}
            con tus credenciales de acceso.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-xl transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  // Formulario de solicitud
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg">

        {/* Botón regresar */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-dark transition-colors mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Regresar al inicio
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="font-bold text-dark">MedTrack</span>
          </div>
          <h1 className="text-2xl font-bold text-dark mb-1">Solicita tu prueba gratis</h1>
          <p className="text-slate-500 text-sm">
            Completa el formulario y nos pondremos en contacto en menos de 24 horas con tus credenciales de acceso.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleEnviar} className="space-y-4">

          {/* Nombre de la clínica */}
          <div>
            <label htmlFor="nombreClinica" className="block text-sm font-medium text-slate-700 mb-1">
              Nombre de la clínica
            </label>
            <input
              id="nombreClinica"
              type="text"
              value={form.nombreClinica}
              onChange={e => actualizarCampo("nombreClinica", e.target.value)}
              placeholder="Clínica Psicológica Bienestar"
              required
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Nombre del responsable */}
          <div>
            <label htmlFor="nombreContacto" className="block text-sm font-medium text-slate-700 mb-1">
              Nombre del responsable
            </label>
            <input
              id="nombreContacto"
              type="text"
              value={form.nombreContacto}
              onChange={e => actualizarCampo("nombreContacto", e.target.value)}
              placeholder="Dra. Ana García"
              required
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Email y teléfono */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={e => actualizarCampo("email", e.target.value)}
                placeholder="correo@clinica.com"
                required
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-slate-700 mb-1">
                Teléfono
              </label>
              <input
                id="telefono"
                type="tel"
                value={form.telefono}
                onChange={e => actualizarCampo("telefono", e.target.value)}
                placeholder="833 123 4567"
                required
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Plan de interés */}
          <div>
            <label htmlFor="plan" className="block text-sm font-medium text-slate-700 mb-1">
              Plan de interés
            </label>
            <select
              id="plan"
              value={form.plan}
              onChange={e => actualizarCampo("plan", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {PLANES.map(plan => (
                <option key={plan} value={plan}>{plan}</option>
              ))}
            </select>
          </div>

          {/* Mensaje opcional */}
          <div>
            <label htmlFor="mensaje" className="block text-sm font-medium text-slate-700 mb-1">
              Mensaje <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <textarea
              id="mensaje"
              value={form.mensaje}
              onChange={e => actualizarCampo("mensaje", e.target.value)}
              placeholder="Cuéntanos sobre tu clínica, cuántos psicólogos trabajan ahí, preguntas que tengas..."
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Botón enviar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl transition-colors"
          >
            {loading ? "Enviando solicitud..." : "Solicitar prueba gratis"}
          </button>

          <p className="text-xs text-slate-400 text-center">
            Tus datos están seguros. No compartimos tu información con terceros.
          </p>

        </form>
      </div>
    </div>
  )
}