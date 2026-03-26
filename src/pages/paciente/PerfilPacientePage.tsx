// ===========================
// src/pages/paciente/PerfilPaciente.tsx
// ===========================
// Página de perfil del paciente.
// Se accede desde el menú desplegable del navbar → "Mi perfil"
// Ruta: /paciente/perfil
//
// Muestra:
//   - Datos personales (nombre, email, teléfono, fecha nacimiento) → tabla user
//   - Contacto de emergencia → tabla emergency_contact
//   - Estadísticas rápidas (total citas, tareas completadas)
//   - Modal para cambiar contraseña → tabla user_access
//
// El paciente NO puede editar sus datos. Solo cambia su contraseña.
//
// Cuando PHP esté listo:
//   - getPerfilPaciente() → reemplaza PERFIL_MOCK
//   - getContactoEmergencia(pacienteId) → reemplaza CONTACTO_MOCK
//   - cambiarContrasena(actual, nueva) → conectar en handleCambiarContrasena()
// ===========================

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import NavbarPaciente from "../../components/layout/NavbarPaciente"

// ===========================
// INTERFACES LOCALES
// ===========================
interface PerfilPacienteData {
  nombre: string           // user.first_name
  apellido: string         // user.last_name
  apellidoMaterno?: string // user.middle_name
  email: string            // user.email
  telefono: string         // user.phone
  fechaNacimiento: string  // user.birth_date
  fechaRegistro: string    // patient.registration_date
  totalCitas: number       // COUNT de appointment
  tareasCompletadas: number // COUNT de task con status="revisada"
}

interface ContactoEmergenciaData {
  nombreCompleto: string   // emergency_contact.full_name
  telefono: string         // emergency_contact.phone
  parentesco: string       // emergency_contact.relationship
}

// ===========================
// DATOS MOCK
// Basados en los datos reales de la BD (user_id=3, patient_id=1)
// ===========================
const PERFIL_MOCK: PerfilPacienteData = {
  nombre: "Carlos",
  apellido: "López",
  apellidoMaterno: "Hernández",
  email: "paciente@medtrack.com",
  telefono: "5599887766",
  fechaNacimiento: "2000-11-05",
  fechaRegistro: "2026-03-10",
  totalCitas: 4,
  tareasCompletadas: 1,
}

const CONTACTO_MOCK: ContactoEmergenciaData = {
  nombreCompleto: "María Hernández",
  telefono: "5511223344",
  parentesco: "Madre",
}

// ===========================
// HELPERS
// ===========================

function calcularEdad(fechaNacimiento: string): number {
  const hoy = new Date()
  const nac = new Date(fechaNacimiento)
  let edad  = hoy.getFullYear() - nac.getFullYear()
  const mes = hoy.getMonth() - nac.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--
  return edad
}

function formatearFecha(fecha: string): string {
  return new Date(fecha + "T12:00:00").toLocaleDateString("es-MX", {
    year: "numeric", month: "long", day: "numeric",
  })
}

// ===========================
// SUBCOMPONENTES
// ===========================

function FilaDato({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm text-dark font-medium">{valor}</p>
    </div>
  )
}

function Seccion({ titulo, icono, children }: { titulo: string; icono: React.ReactNode; children: React.ReactNode }) {
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

// Campo de contraseña con botón de mostrar/ocultar
// Definido FUERA del componente principal para evitar que el input pierda el foco
function CampoContrasena({ label, value, onChange, mostrar, onToggleMostrar, placeholder = "••••••••" }: {
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
          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 pr-12 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
        />
        <button type="button" onClick={onToggleMostrar}
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
export default function PerfilPaciente() {
  const navigate    = useNavigate()
  const { usuario } = useAuth()

  const perfil   = PERFIL_MOCK
  const contacto = CONTACTO_MOCK

  // Estados del modal de cambio de contraseña
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

  function cerrarModalContrasena() {
    setModalContrasena(false)
    setContrasenaActual(""); setContrasenaNueva(""); setContrasenaConfirmar("")
    setMostrarActual(false); setMostrarNueva(false); setMostrarConfirmar(false)
    setErrorContrasena(""); setExitoContrasena(false)
  }

  // TODO: llamar a cambiarContrasena(contrasenaActual, contrasenaNueva) de api.ts
  async function handleCambiarContrasena() {
    setErrorContrasena("")
    if (!contrasenaActual)                       return setErrorContrasena("Escribe tu contraseña actual")
    if (!contrasenaNueva)                        return setErrorContrasena("Escribe tu nueva contraseña")
    if (contrasenaNueva.length < 8)              return setErrorContrasena("La nueva contraseña debe tener al menos 8 caracteres")
    if (contrasenaNueva !== contrasenaConfirmar) return setErrorContrasena("Las contraseñas no coinciden")
    if (contrasenaActual === contrasenaNueva)    return setErrorContrasena("La nueva contraseña debe ser diferente a la actual")

    setLoadingContrasena(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setExitoContrasena(true)
    } catch {
      setErrorContrasena("Error al cambiar la contraseña. Intenta de nuevo.")
    } finally {
      setLoadingContrasena(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">

      {/* NavbarPaciente reutilizable — mismo en todas las páginas del paciente */}
      <NavbarPaciente />

      <div className="max-w-4xl mx-auto p-6">

        {/* Botón volver */}
        <button
          onClick={() => navigate("/paciente/dashboard")}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-dark transition-colors mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al inicio
        </button>

        {/* ===========================
            HEADER — Avatar, nombre, estadísticas
            =========================== */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {perfil.nombre[0]}{perfil.apellido[0]}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-dark">
                {perfil.nombre} {perfil.apellido}{perfil.apellidoMaterno && ` ${perfil.apellidoMaterno}`}
              </h1>
              <p className="text-slate-500 text-sm mt-1">{calcularEdad(perfil.fechaNacimiento)} años · Paciente</p>
              <p className="text-xs text-slate-400 mt-0.5">Registrado el {formatearFecha(perfil.fechaRegistro)}</p>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-slate-100">
            <div className="text-center">
              <p className="text-3xl font-bold text-dark">{perfil.totalCitas}</p>
              <p className="text-xs text-slate-400 mt-1">Citas en total</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{perfil.tareasCompletadas}</p>
              <p className="text-xs text-slate-400 mt-1">Tareas completadas</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* DATOS PERSONALES — solo lectura */}
          <Seccion titulo="Datos personales" icono={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }>
            <FilaDato label="Nombre completo" valor={`${perfil.nombre} ${perfil.apellido}${perfil.apellidoMaterno ? ` ${perfil.apellidoMaterno}` : ""}`} />
            <FilaDato label="Correo electrónico" valor={perfil.email} />
            <FilaDato label="Teléfono" valor={perfil.telefono} />
            <FilaDato label="Fecha de nacimiento" valor={`${formatearFecha(perfil.fechaNacimiento)} (${calcularEdad(perfil.fechaNacimiento)} años)`} />
            <div className="bg-background rounded-lg px-4 py-3 text-xs text-slate-400">
              ℹ️ Para actualizar tus datos, contacta a tu psicólogo o a la secretaria del consultorio.
            </div>
          </Seccion>

          {/* CONTACTO DE EMERGENCIA — solo lectura */}
          <Seccion titulo="Contacto de emergencia" icono={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          }>
            <FilaDato label="Nombre"     valor={contacto.nombreCompleto} />
            <FilaDato label="Teléfono"   valor={contacto.telefono} />
            <FilaDato label="Parentesco" valor={contacto.parentesco} />
          </Seccion>

          {/* SEGURIDAD — cambio de contraseña */}
          <Seccion titulo="Seguridad" icono={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }>
            <FilaDato label="Correo de acceso" valor={perfil.email} />
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
          </Seccion>

        </div>
      </div>

      {/* MODAL CAMBIAR CONTRASEÑA */}
      {modalContrasena && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={cerrarModalContrasena}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-dark">Cambiar contraseña</h2>
              <button onClick={cerrarModalContrasena} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
            </div>
            <p className="text-sm text-slate-400 mb-6">Tu nueva contraseña debe tener al menos 8 caracteres.</p>

            {exitoContrasena ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-semibold text-dark mb-1">¡Contraseña actualizada!</p>
                <p className="text-sm text-slate-400 mb-6">Tu contraseña ha sido cambiada exitosamente.</p>
                <button onClick={cerrarModalContrasena} className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-xl transition-colors">
                  Cerrar
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {errorContrasena && (
                  <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">⚠️ {errorContrasena}</div>
                )}
                <CampoContrasena label="Contraseña actual" value={contrasenaActual} onChange={setContrasenaActual} mostrar={mostrarActual} onToggleMostrar={() => setMostrarActual(!mostrarActual)} />
                <div className="border-t border-slate-100 pt-2" />
                <CampoContrasena label="Nueva contraseña" value={contrasenaNueva} onChange={setContrasenaNueva} mostrar={mostrarNueva} onToggleMostrar={() => setMostrarNueva(!mostrarNueva)} placeholder="Mínimo 8 caracteres" />
                <CampoContrasena label="Confirmar nueva contraseña" value={contrasenaConfirmar} onChange={setContrasenaConfirmar} mostrar={mostrarConfirmar} onToggleMostrar={() => setMostrarConfirmar(!mostrarConfirmar)} />
                {contrasenaNueva && contrasenaConfirmar && (
                  <p className={`text-xs flex items-center gap-1 ${contrasenaNueva === contrasenaConfirmar ? "text-green-500" : "text-red-400"}`}>
                    {contrasenaNueva === contrasenaConfirmar ? "✓ Las contraseñas coinciden" : "✗ Las contraseñas no coinciden"}
                  </p>
                )}
                <div className="flex gap-3 pt-2">
                  <button onClick={cerrarModalContrasena} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm">Cancelar</button>
                  <button onClick={handleCambiarContrasena} disabled={loadingContrasena} className="flex-1 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-xl transition-colors font-medium text-sm">
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