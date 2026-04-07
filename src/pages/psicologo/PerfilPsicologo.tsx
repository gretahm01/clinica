// ===========================
// src/pages/psicologo/PerfilPsicologo.tsx
// ===========================
// Perfil del psicólogo — rediseñado con layout profesional.
// Mismo patrón que Dashboard: Navbar + Sidebar + contenido.
//
// Muestra:
//   - Header con avatar grande, nombre, especialidad y stats rápidas
//   - Datos personales (editable)
//   - Datos profesionales (licencia, especialidad)
//   - Horario de atención (solo lectura por ahora)
//   - Seguridad (cambiar contraseña)
// ===========================

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../../components/layout/Navbar"
import Sidebar from "../../components/layout/Sidebar"
import { useAuth } from "../../hooks/useAuth"

// ===========================
// INTERFACES
// ===========================
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
  bio: string // descripción breve del psicólogo
}

// ===========================
// DATOS MOCK
// Reemplazar con getPerfilPsicologo() cuando PHP esté listo
// ===========================
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
  bio: "Psicóloga clínica con más de 10 años de experiencia en terapia cognitivo-conductual, manejo de ansiedad y depresión.",
}

// Horario de atención — por ahora estático
// Cuando PHP lo soporte, vendrá de un endpoint de disponibilidad
const HORARIO = [
  { dia: "Lunes",     horas: "9:00 – 17:00" },
  { dia: "Martes",    horas: "9:00 – 17:00" },
  { dia: "Miércoles", horas: "9:00 – 14:00" },
  { dia: "Jueves",    horas: "9:00 – 17:00" },
  { dia: "Viernes",   horas: "9:00 – 14:00" },
  { dia: "Sábado",    horas: "No disponible" },
  { dia: "Domingo",   horas: "No disponible" },
]

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

// Fila de dato — etiqueta + valor en modo lectura
function FilaDato({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm text-dark font-medium">{valor}</p>
    </div>
  )
}

// Input editable con label
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
        className={`w-full border rounded-xl px-3 py-2.5 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
          disabled
            ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed"
            : "border-slate-200 bg-white hover:border-slate-300"
        }`}
      />
      {disabled && (
        <p className="text-xs text-slate-400 mt-1">No editable directamente.</p>
      )}
    </div>
  )
}

// Sección con ícono, título y contenido
function Seccion({
  titulo, icono, color = "bg-slate-100", iconColor = "text-slate-500", children, accion,
}: {
  titulo: string
  icono: React.ReactNode
  color?: string
  iconColor?: string
  children: React.ReactNode
  accion?: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center ${iconColor}`}>
            {icono}
          </div>
          <h3 className="font-semibold text-dark">{titulo}</h3>
        </div>
        {accion}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  )
}

// Campo de contraseña con botón mostrar/ocultar
// Definido FUERA del componente principal para evitar pérdida de foco
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
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 pr-12 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
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

  const [psicologo, setPsicologo] = useState<PsicologoPerfil>(MOCK_PSICOLOGO)
  const [edicion, setEdicion]     = useState<PsicologoPerfil>(MOCK_PSICOLOGO)
  const [modoEdicion, setModoEdicion] = useState(false)

  // Estados del modal de contraseña
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
    setContrasenaActual(""); setContrasenaNueva(""); setContrasenaConfirmar("")
    setMostrarActual(false); setMostrarNueva(false); setMostrarConfirmar(false)
    setErrorContrasena(""); setExitoContrasena(false)
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
      await new Promise(resolve => setTimeout(resolve, 1000))
      setExitoContrasena(true)
    } catch {
      setErrorContrasena("Error al cambiar la contraseña. Intenta de nuevo.")
    } finally {
      setLoadingContrasena(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      <Navbar />

      <div className="flex flex-1 overflow-hidden">

        <Sidebar
          citasHoy={0} citasSemana={0} citasPendientes={0}
          proximasCitas={[]} onNuevaCita={() => {}}
        />

        <main className="flex-1 overflow-y-auto p-6">

          {/* Botón volver */}
          <button
            onClick={() => navigate("/psicologo/dashboard")}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-dark transition-colors mb-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al dashboard
          </button>

          {/* ===========================
              HEADER DEL PERFIL
              Avatar grande con gradiente + nombre + bio + stats + botón editar
              =========================== */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
            <div className="flex items-start gap-6">

              {/* Avatar grande con iniciales */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                  {psicologo.nombre[0]}{psicologo.apellido[0]}
                </div>
                {/* Punto de sesión activa */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white"></div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-dark">
                      {psicologo.nombre} {psicologo.apellido} {psicologo.apellidoMaterno}
                    </h1>
                    {/* Especialidad + badges */}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs bg-primary bg-opacity-10 text-primary font-semibold px-3 py-1 rounded-full border border-primary border-opacity-20">
                        {psicologo.especialidad}
                      </span>
                      <span className="text-xs bg-blue-50 text-blue-600 font-medium px-3 py-1 rounded-full border border-blue-100">
                        {psicologo.rol}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        #{psicologo.numerolicencia}
                      </span>
                    </div>
                    {/* Bio */}
                    <p className="text-sm text-slate-500 mt-3 leading-relaxed max-w-lg">
                      {psicologo.bio}
                    </p>
                  </div>

                  {/* Botón editar / guardar */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {modoEdicion ? (
                      <>
                        <button
                          onClick={handleCancelarEdicion}
                          className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors font-medium"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleGuardarEdicion}
                          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                        >
                          Guardar cambios
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleIniciarEdicion}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors font-medium"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar perfil
                      </button>
                    )}
                  </div>
                </div>

                {/* Banner de edición activa */}
                {modoEdicion && (
                  <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-600 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Modo edición activo — los cambios se aplicarán al presionar "Guardar cambios"
                  </div>
                )}
              </div>
            </div>

            {/* ===========================
                STATS RÁPIDAS
                Fila de 3 métricas debajo del header
                =========================== */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-dark">0</p>
                <p className="text-xs text-slate-400 mt-0.5">Pacientes activos</p>
              </div>
              <div className="text-center border-x border-slate-100">
                <p className="text-2xl font-bold text-blue-500">0</p>
                <p className="text-xs text-slate-400 mt-0.5">Citas este mes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-rose-500">0</p>
                <p className="text-xs text-slate-400 mt-0.5">Tareas por revisar</p>
              </div>
            </div>
          </div>

          {/* ===========================
              GRID DE SECCIONES
              =========================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* DATOS PERSONALES */}
            <Seccion
              titulo="Datos personales"
              color="bg-emerald-100"
              iconColor="text-emerald-600"
              icono={
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            >
              {modoEdicion ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <CampoEditable label="Nombre" value={edicion.nombre} onChange={v => setEdicion(p => ({ ...p, nombre: v }))} placeholder="Nombre" />
                    <CampoEditable label="Apellido paterno" value={edicion.apellido} onChange={v => setEdicion(p => ({ ...p, apellido: v }))} placeholder="Apellido" />
                  </div>
                  <CampoEditable label="Apellido materno" value={edicion.apellidoMaterno} onChange={v => setEdicion(p => ({ ...p, apellidoMaterno: v }))} placeholder="Apellido materno" />
                  <CampoEditable label="Correo electrónico" value={edicion.email} onChange={v => setEdicion(p => ({ ...p, email: v }))} type="email" />
                  <CampoEditable label="Teléfono" value={edicion.telefono} onChange={v => setEdicion(p => ({ ...p, telefono: v }))} type="tel" />
                  <CampoEditable label="Fecha de nacimiento" value={edicion.fechaNacimiento} onChange={v => setEdicion(p => ({ ...p, fechaNacimiento: v }))} type="date" />
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Descripción / Bio</label>
                    <textarea
                      value={edicion.bio}
                      onChange={e => setEdicion(p => ({ ...p, bio: e.target.value }))}
                      placeholder="Breve descripción profesional..."
                      rows={3}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <FilaDato label="Nombre completo" valor={`${psicologo.nombre} ${psicologo.apellido} ${psicologo.apellidoMaterno}`} />
                  <FilaDato label="Correo electrónico" valor={psicologo.email} />
                  <FilaDato label="Teléfono" valor={psicologo.telefono} />
                  <FilaDato label="Fecha de nacimiento" valor={`${formatearFecha(psicologo.fechaNacimiento)} (${calcularEdad(psicologo.fechaNacimiento)} años)`} />
                </>
              )}
            </Seccion>

            {/* DATOS PROFESIONALES */}
            <Seccion
              titulo="Datos profesionales"
              color="bg-blue-100"
              iconColor="text-blue-500"
              icono={
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            >
              {modoEdicion ? (
                <>
                  <CampoEditable label="Número de licencia" value={edicion.numerolicencia} onChange={v => setEdicion(p => ({ ...p, numerolicencia: v }))} />
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
            </Seccion>

            {/* HORARIO DE ATENCIÓN
                Solo lectura por ahora — cuando PHP tenga el endpoint
                de disponibilidad se podrá editar desde aquí
                =========================== */}
            <Seccion
              titulo="Horario de atención"
              color="bg-violet-100"
              iconColor="text-violet-500"
              icono={
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              accion={
                <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                  Solo lectura por ahora
                </span>
              }
            >
              <div className="flex flex-col gap-2">
                {HORARIO.map((item) => (
                  <div key={item.dia} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-dark font-medium w-24">{item.dia}</span>
                    <span className={`text-sm font-medium ${
                      item.horas === "No disponible"
                        ? "text-slate-300"
                        : "text-emerald-600"
                    }`}>
                      {item.horas}
                    </span>
                    {/* Indicador visual */}
                    <div className={`w-2 h-2 rounded-full ${
                      item.horas === "No disponible" ? "bg-slate-200" : "bg-emerald-400"
                    }`} />
                  </div>
                ))}
              </div>
            </Seccion>

            {/* SEGURIDAD */}
            <Seccion
              titulo="Seguridad de la cuenta"
              color="bg-rose-100"
              iconColor="text-rose-500"
              icono={
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            >
              <FilaDato label="Correo de acceso" valor={psicologo.email} />
              <FilaDato label="ID de usuario" valor={`#${psicologo.userId}`} />

              {/* Sesión activa */}
              <div>
                <p className="text-xs text-slate-400 mb-1">Sesión activa como</p>
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <p className="text-sm text-dark font-medium">
                    {usuario?.nombre} {usuario?.apellido}
                  </p>
                  <span className="ml-auto text-xs text-emerald-500 font-medium">Activa</span>
                </div>
              </div>

              {/* Botón cambiar contraseña */}
              <button
                onClick={() => setModalContrasena(true)}
                className="w-full flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="w-9 h-9 bg-rose-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-rose-100 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-dark">Cambiar contraseña</p>
                  <p className="text-xs text-slate-400">Actualiza tu contraseña de acceso</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-300 ml-auto group-hover:text-slate-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </Seccion>

          </div>
        </main>
      </div>

      {/* ===========================
          MODAL CAMBIAR CONTRASEÑA
          =========================== */}
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

            {exitoContrasena ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {errorContrasena}
                  </div>
                )}
                <CampoContrasena label="Contraseña actual" value={contrasenaActual} onChange={setContrasenaActual} mostrar={mostrarActual} onToggleMostrar={() => setMostrarActual(!mostrarActual)} />
                <div className="border-t border-slate-100 pt-2" />
                <CampoContrasena label="Nueva contraseña" value={contrasenaNueva} onChange={setContrasenaNueva} mostrar={mostrarNueva} onToggleMostrar={() => setMostrarNueva(!mostrarNueva)} placeholder="Mínimo 8 caracteres" />
                <CampoContrasena label="Confirmar nueva contraseña" value={contrasenaConfirmar} onChange={setContrasenaConfirmar} mostrar={mostrarConfirmar} onToggleMostrar={() => setMostrarConfirmar(!mostrarConfirmar)} />
                {contrasenaNueva && contrasenaConfirmar && (
                  <p className={`text-xs flex items-center gap-1 ${contrasenaNueva === contrasenaConfirmar ? "text-emerald-500" : "text-red-400"}`}>
                    {contrasenaNueva === contrasenaConfirmar ? "✓ Las contraseñas coinciden" : "✗ Las contraseñas no coinciden"}
                  </p>
                )}
                <div className="flex gap-3 pt-2">
                  <button onClick={cerrarModalContrasena} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm">
                    Cancelar
                  </button>
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