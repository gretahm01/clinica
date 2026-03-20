// ===========================
// src/pages/psicologo/PerfilPsicologo.tsx
// ===========================

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../../components/layout/Navbar"
import { useAuth } from "../../hooks/useAuth"

interface PsicologoPerfil {
  userId: number
  nombre: string
  apellido: string
  apellidoMaterno: string
  email: string
  telefono: string
  fechaNacimiento: string
  profesionalId: number
  numerolicencia: string
  especialidad: string
  rol: string
}

const MOCK_PSICOLOGO: PsicologoPerfil = {
  userId: 1,
  nombre: "Ana",
  apellido: "García",
  apellidoMaterno: "López",
  email: "psicologa@medtrack.com",
  telefono: "5512345678",
  fechaNacimiento: "1985-03-15",
  profesionalId: 1,
  numerolicencia: "PSI-2024-001",
  especialidad: "Psicología clínica",
  rol: "Psicólogo",
}

function calcularEdad(fechaNacimiento: string): number {
  const hoy        = new Date()
  const nacimiento = new Date(fechaNacimiento)
  let edad         = hoy.getFullYear() - nacimiento.getFullYear()
  const mes        = hoy.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--
  return edad
}

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-MX", {
    year: "numeric", month: "long", day: "numeric",
  })
}

function FilaDato({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm text-dark font-medium">{valor}</p>
    </div>
  )
}

function CampoEditable({
  label, value, onChange, type = "text", placeholder = "", disabled = false,
}: {
  label: string; value: string; onChange?: (val: string) => void
  type?: string; placeholder?: string; disabled?: boolean
}) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full border rounded-lg px-3 py-2 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
          disabled ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed" : "border-slate-200 bg-white"
        }`}
      />
      {disabled && <p className="text-xs text-slate-400 mt-1">Este campo no se puede editar directamente.</p>}
    </div>
  )
}

function SeccionPerfil({ titulo, icono, children }: {
  titulo: string; icono: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 bg-background rounded-lg flex items-center justify-center">{icono}</div>
        <h3 className="font-semibold text-dark">{titulo}</h3>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  )
}

// ===========================
// CAMPO CONTRASEÑA
// Definido FUERA del componente principal para evitar que el
// input pierda el foco al escribir.
// El ojo nativo del navegador se oculta con:
//   [&::-ms-reveal]:hidden      → Edge/IE
//   [&::-webkit-credentials-auto-fill-button]:hidden → Chrome
// ===========================
function CampoContrasena({
  label, value, onChange, mostrar, onToggleMostrar, placeholder = "••••••••",
}: {
  label: string; value: string; onChange: (v: string) => void
  mostrar: boolean; onToggleMostrar: () => void; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-dark mb-1">{label}</label>
      <div className="relative">
        <input
          type={mostrar ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          // [&::-ms-reveal]:hidden oculta el ojo nativo de Edge
          // [&::-ms-clear]:hidden oculta la X nativa de Edge
          // Tailwind permite CSS arbitrario con corchetes
          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 pr-12 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
        />
        <button
          type="button"
          onClick={onToggleMostrar}
          aria-label={mostrar ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          {mostrar ? (
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
  )
}

// ===========================
// COMPONENTE PRINCIPAL
// ===========================
export default function PerfilPsicologo() {
  const navigate    = useNavigate()
  const { usuario } = useAuth()

  const [psicologo, setPsicologo]     = useState<PsicologoPerfil>(MOCK_PSICOLOGO)
  const [edicion, setEdicion]         = useState<PsicologoPerfil>(MOCK_PSICOLOGO)
  const [modoEdicion, setModoEdicion] = useState(false)

  const [modalContrasena, setModalContrasena]         = useState(false)
  const [contrasenaActual, setContrasenaActual]       = useState("")
  const [contrasenaNueva, setContrasenaNueva]         = useState("")
  const [contrasenaConfirmar, setContrasenaConfirmar] = useState("")
  const [mostrarActual, setMostrarActual]             = useState(false)
  const [mostrarNueva, setMostrarNueva]               = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar]       = useState(false)
  const [errorContrasena, setErrorContrasena]         = useState("")
  const [exitoContrasena, setExitoContrasena]         = useState(false)
  const [loadingContrasena, setLoadingContrasena]     = useState(false)

  function handleIniciarEdicion() {
    setEdicion({ ...psicologo })
    setModoEdicion(true)
  }

  function handleCancelarEdicion() {
    setEdicion({ ...psicologo })
    setModoEdicion(false)
  }

  async function handleGuardarEdicion() {
    if (!edicion.nombre.trim())   return alert("El nombre es requerido")
    if (!edicion.apellido.trim()) return alert("El apellido es requerido")
    if (!edicion.email.trim())    return alert("El correo es requerido")
    if (!edicion.telefono.trim()) return alert("El teléfono es requerido")
    // TODO: llamar a actualizarPsicologo(edicion) cuando PHP esté listo
    setPsicologo({ ...edicion })
    setModoEdicion(false)
  }

  function cerrarModalContrasena() {
    setModalContrasena(false)
    setContrasenaActual("")
    setContrasenaNueva("")
    setContrasenaConfirmar("")
    setMostrarActual(false)
    setMostrarNueva(false)
    setMostrarConfirmar(false)
    setErrorContrasena("")
    setExitoContrasena(false)
  }

  async function handleCambiarContrasena() {
    setErrorContrasena("")
    if (!contrasenaActual)                       return setErrorContrasena("Escribe tu contraseña actual")
    if (!contrasenaNueva)                        return setErrorContrasena("Escribe tu nueva contraseña")
    if (contrasenaNueva.length < 8)              return setErrorContrasena("La nueva contraseña debe tener al menos 8 caracteres")
    if (contrasenaNueva !== contrasenaConfirmar) return setErrorContrasena("Las contraseñas no coinciden")
    if (contrasenaActual === contrasenaNueva)    return setErrorContrasena("La nueva contraseña debe ser diferente a la actual")

    setLoadingContrasena(true)
    try {
      // TODO: llamar a cambiarContrasena(datos) cuando PHP esté listo
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Muestra pantalla de éxito — el usuario la cierra manualmente
      setExitoContrasena(true)
    } catch {
      setErrorContrasena("Error al cambiar la contraseña. Intenta de nuevo.")
    } finally {
      setLoadingContrasena(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">

        <button
          onClick={() => navigate("/psicologo/dashboard")}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-dark transition-colors mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al dashboard
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {psicologo.nombre[0]}{psicologo.apellido[0]}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-dark">
                {psicologo.nombre} {psicologo.apellido} {psicologo.apellidoMaterno}
              </h1>
              <p className="text-slate-500 text-sm mt-1">{psicologo.especialidad}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs bg-primary bg-opacity-10 text-primary font-medium px-3 py-1 rounded-full">
                  {psicologo.rol}
                </span>
                <span className="text-xs text-slate-400">Licencia: {psicologo.numerolicencia}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {modoEdicion ? (
                <>
                  <button onClick={handleCancelarEdicion} className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-background transition-colors font-medium">
                    Cancelar
                  </button>
                  <button onClick={handleGuardarEdicion} className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-medium transition-colors">
                    Guardar cambios
                  </button>
                </>
              ) : (
                <button onClick={handleIniciarEdicion} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-background transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </button>
              )}
            </div>
          </div>
          {modoEdicion && (
            <div className="mt-4 bg-primary bg-opacity-10 border border-primary border-opacity-20 rounded-xl px-4 py-3 text-sm text-primary">
              Estás editando tu perfil. Los cambios se guardarán cuando presiones "Guardar cambios".
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <SeccionPerfil titulo="Datos personales" icono={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }>
            {modoEdicion ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <CampoEditable label="Nombre" value={edicion.nombre} onChange={v => setEdicion(p => ({ ...p, nombre: v }))} placeholder="Nombre" />
                  <CampoEditable label="Apellido paterno" value={edicion.apellido} onChange={v => setEdicion(p => ({ ...p, apellido: v }))} placeholder="Apellido" />
                </div>
                <CampoEditable label="Apellido materno" value={edicion.apellidoMaterno} onChange={v => setEdicion(p => ({ ...p, apellidoMaterno: v }))} placeholder="Apellido materno" />
                <CampoEditable label="Correo electrónico" value={edicion.email} onChange={v => setEdicion(p => ({ ...p, email: v }))} type="email" placeholder="correo@ejemplo.com" />
                <CampoEditable label="Teléfono" value={edicion.telefono} onChange={v => setEdicion(p => ({ ...p, telefono: v }))} type="tel" placeholder="55 1234 5678" />
                <CampoEditable label="Fecha de nacimiento" value={edicion.fechaNacimiento} onChange={v => setEdicion(p => ({ ...p, fechaNacimiento: v }))} type="date" />
              </>
            ) : (
              <>
                <FilaDato label="Nombre completo" valor={`${psicologo.nombre} ${psicologo.apellido} ${psicologo.apellidoMaterno}`} />
                <FilaDato label="Correo electrónico" valor={psicologo.email} />
                <FilaDato label="Teléfono" valor={psicologo.telefono} />
                <FilaDato label="Fecha de nacimiento" valor={`${formatearFecha(psicologo.fechaNacimiento)} (${calcularEdad(psicologo.fechaNacimiento)} años)`} />
              </>
            )}
          </SeccionPerfil>

          <SeccionPerfil titulo="Datos profesionales" icono={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }>
            {modoEdicion ? (
              <>
                <CampoEditable label="Número de licencia" value={edicion.numerolicencia} onChange={v => setEdicion(p => ({ ...p, numerolicencia: v }))} placeholder="PSI-2024-001" />
                <CampoEditable label="Especialidad" value={edicion.especialidad} disabled />
                <CampoEditable label="Rol en el sistema" value={edicion.rol} disabled />
              </>
            ) : (
              <>
                <FilaDato label="Especialidad" valor={psicologo.especialidad} />
                <FilaDato label="Número de licencia" valor={psicologo.numerolicencia} />
                <FilaDato label="Rol en el sistema" valor={psicologo.rol} />
                <FilaDato label="ID de profesional" valor={`#${psicologo.profesionalId}`} />
              </>
            )}
          </SeccionPerfil>

          <SeccionPerfil titulo="Cuenta" icono={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }>
            <FilaDato label="Correo de acceso" valor={psicologo.email} />
            <FilaDato label="ID de usuario" valor={`#${psicologo.userId}`} />
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Sesión activa como</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <p className="text-sm text-dark font-medium">{usuario?.nombre} {usuario?.apellido}</p>
              </div>
            </div>
            <button
              onClick={() => setModalContrasena(true)}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary-hover transition-colors font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Cambiar contraseña
            </button>
          </SeccionPerfil>

        </div>
      </div>

      {/* MODAL CAMBIAR CONTRASEÑA */}
      {modalContrasena && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={cerrarModalContrasena}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-dark">Cambiar contraseña</h2>
              <button onClick={cerrarModalContrasena} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
            </div>
            <p className="text-sm text-slate-400 mb-6">Tu nueva contraseña debe tener al menos 8 caracteres.</p>

            {/* Pantalla de éxito — se cierra con el botón, no automáticamente */}
            {exitoContrasena ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-semibold text-dark mb-1">¡Contraseña actualizada!</p>
                <p className="text-sm text-slate-400 mb-6">Tu contraseña ha sido cambiada exitosamente.</p>
                <button
                  onClick={cerrarModalContrasena}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-xl transition-colors"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {errorContrasena && (
                  <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">⚠️ {errorContrasena}</div>
                )}

                <CampoContrasena
                  label="Contraseña actual"
                  value={contrasenaActual}
                  onChange={setContrasenaActual}
                  mostrar={mostrarActual}
                  onToggleMostrar={() => setMostrarActual(!mostrarActual)}
                />

                <div className="border-t border-slate-100 pt-2" />

                <CampoContrasena
                  label="Nueva contraseña"
                  value={contrasenaNueva}
                  onChange={setContrasenaNueva}
                  mostrar={mostrarNueva}
                  onToggleMostrar={() => setMostrarNueva(!mostrarNueva)}
                  placeholder="Mínimo 8 caracteres"
                />

                <CampoContrasena
                  label="Confirmar nueva contraseña"
                  value={contrasenaConfirmar}
                  onChange={setContrasenaConfirmar}
                  mostrar={mostrarConfirmar}
                  onToggleMostrar={() => setMostrarConfirmar(!mostrarConfirmar)}
                />

                {contrasenaNueva && contrasenaConfirmar && (
                  <p className={`text-xs flex items-center gap-1 ${contrasenaNueva === contrasenaConfirmar ? "text-green-500" : "text-red-400"}`}>
                    {contrasenaNueva === contrasenaConfirmar ? "✓ Las contraseñas coinciden" : "✗ Las contraseñas no coinciden"}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={cerrarModalContrasena}
                    className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCambiarContrasena}
                    disabled={loadingContrasena}
                    className="flex-1 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-xl transition-colors font-medium text-sm"
                  >
                    {loadingContrasena ? "Guardando..." : "Cambiar contraseña"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}