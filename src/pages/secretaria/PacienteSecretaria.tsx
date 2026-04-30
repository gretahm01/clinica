// ===========================
// src/pages/secretaria/PacientesSecretaria.tsx
// ===========================
// Pantalla donde la secretaria ve la lista de pacientes de cada psicóloga.
// Puede agregar pacientes nuevos y ver su info básica (sin expediente).
// Layout: NavbarSecretaria + SidebarSecretaria + contenido principal
// ===========================

import { useState, useEffect } from "react"
import NavbarSecretaria from "../../components/layout/NavbarSecretaria"
import SidebarSecretaria from "../../components/layout/SidebarSecretaria"

// ===========================
// TIPOS
// ===========================
interface PacienteBasico {
  patient_id: number
  nombre: string
  apellido: string
  email: string
  telefono: string
  fechaNacimiento: string
  fechaRegistro: string
  psicologa: string
}

interface Psicologa {
  professional_id: number
  nombre: string
  apellido: string
}

interface DatosNuevoPaciente {
  first_name: string
  last_name: string
  middle_name: string
  email: string
  phone: string
  birth_date: string
  password: string
}

// ===========================
// MODAL NUEVO PACIENTE
// ===========================
function ModalNuevoPaciente({
  abierto,
  onCerrar,
  onGuardar,
  guardando,
}: {
  abierto: boolean
  onCerrar: () => void
  onGuardar: (datos: DatosNuevoPaciente) => void
  guardando: boolean
}) {
  const [form, setForm] = useState<DatosNuevoPaciente>({
    first_name: "",
    last_name: "",
    middle_name: "",
    email: "",
    phone: "",
    birth_date: "",
    password: "",
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onGuardar(form)
  }

  function handleCerrar() {
    setForm({ first_name: "", last_name: "", middle_name: "", email: "", phone: "", birth_date: "", password: "" })
    onCerrar()
  }

  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-dark/40 backdrop-blur-sm" onClick={handleCerrar} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-dark">Nuevo paciente</h2>
            <p className="text-xs text-slate-400 mt-0.5">Completa la información básica del paciente</p>
          </div>
          <button
            onClick={handleCerrar}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Nombre *</label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                required
                placeholder="Ej. María"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Apellido paterno *</label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                required
                placeholder="Ej. García"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Apellido materno</label>
            <input
              name="middle_name"
              value={form.middle_name}
              onChange={handleChange}
              placeholder="Ej. López"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Correo electrónico *</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="paciente@correo.com"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Teléfono</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="55 1234 5678"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Fecha de nacimiento</label>
              <input
                name="birth_date"
                type="date"
                value={form.birth_date}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Contraseña temporal *</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="El paciente la cambiará al entrar"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleCerrar}
              className="flex-1 border border-slate-200 text-slate-500 font-medium py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-xl transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {guardando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                "Registrar paciente"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ===========================
// MODAL INFO BÁSICA DEL PACIENTE
// Solo nombre, contacto y registro — sin expediente
// ===========================
function ModalInfoPaciente({
  paciente,
  onCerrar,
}: {
  paciente: PacienteBasico | null
  onCerrar: () => void
}) {
  if (!paciente) return null

  const iniciales = `${paciente.nombre[0]}${paciente.apellido[0]}`

  function calcularEdad(fechaNac: string): string {
    if (!fechaNac) return "—"
    const hoy = new Date()
    const nac = new Date(fechaNac)
    let edad = hoy.getFullYear() - nac.getFullYear()
    const m = hoy.getMonth() - nac.getMonth()
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--
    return `${edad} años`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-dark/40 backdrop-blur-sm" onClick={onCerrar} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">

        {/* Header con avatar */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 px-6 pt-8 pb-6 text-center relative">
          <button
            onClick={onCerrar}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/60 text-slate-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
            {iniciales}
          </div>
          <h2 className="text-lg font-bold text-dark">{paciente.nombre} {paciente.apellido}</h2>
          <span className="inline-flex items-center gap-1.5 mt-2 text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Activo
          </span>
        </div>

        {/* Info básica */}
        <div className="px-6 py-5 space-y-3">
          {[
            {
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
              label: "Correo", value: paciente.email,
            },
            {
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />,
              label: "Teléfono", value: paciente.telefono || "—",
            },
            {
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
              label: "Edad", value: calcularEdad(paciente.fechaNacimiento),
            },
            {
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
              label: "Psicóloga asignada", value: paciente.psicologa || "—",
            },
            {
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
              label: "Registrado el",
              value: paciente.fechaRegistro
                ? new Date(paciente.fechaRegistro).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" })
                : "—",
            },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {icon}
                </svg>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">{label}</p>
                <p className="text-sm text-dark font-medium">{value}</p>
              </div>
            </div>
          ))}

          {/* Aviso sin expediente */}
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-xs text-amber-700">El expediente clínico solo está disponible para la psicóloga asignada.</p>
          </div>
        </div>

        <div className="px-6 pb-5">
          <button
            onClick={onCerrar}
            className="w-full border border-slate-200 text-slate-500 font-medium py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

// ===========================
// TARJETA DE PACIENTE
// ===========================
function TarjetaPaciente({ paciente, onClick }: { paciente: PacienteBasico; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-primary hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {paciente.nombre[0]}{paciente.apellido[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-dark truncate">{paciente.nombre} {paciente.apellido}</p>
          <p className="text-xs text-slate-400 truncate">{paciente.email}</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-50 text-emerald-600 border border-emerald-100 flex-shrink-0">
          Activo
        </span>
      </div>
      <div className="flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          {paciente.telefono || "Sin tel."}
        </span>
        <span className="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {paciente.psicologa || "Sin asignar"}
        </span>
      </div>
      <div className="flex justify-end mt-3">
        <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">Ver info →</span>
      </div>
    </div>
  )
}

// ===========================
// COMPONENTE PRINCIPAL
// ===========================
export default function PacientesSecretaria() {
  const [pacientes, setPacientes] = useState<PacienteBasico[]>([])
  const [psicologas, setPsicologas] = useState<Psicologa[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [filtroPsicologa, setFiltroPsicologa] = useState<string>("todas")
  const [modalNuevo, setModalNuevo] = useState(false)
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<PacienteBasico | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState("")
  const [guardando, setGuardando] = useState(false)

  const API = import.meta.env.VITE_API_URL ?? "http://localhost/clinica/backend"

  useEffect(() => { cargarDatos() }, [])

  async function cargarDatos() {
    try {
      setCargando(true)
      setError("")
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }
      const [resPacientes, resPsicologas] = await Promise.all([
        fetch(`${API}/routes/pacientes.php?vista=secretaria`, { headers }),
        fetch(`${API}/routes/pacientes.php?lista=psicologas`, { headers }),
      ])
      const dataPacientes = await resPacientes.json()
      const dataPsicologas = await resPsicologas.json()
      if (dataPacientes.success) setPacientes(dataPacientes.data)
      else setError("No se pudieron cargar los pacientes")
      if (dataPsicologas.success) setPsicologas(dataPsicologas.data)
    } catch {
      setError("Error de conexión con el servidor")
    } finally {
      setCargando(false)
    }
  }

  async function handleGuardar(datos: DatosNuevoPaciente) {
    try {
      setGuardando(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${API}/routes/pacientes.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(datos),
      })
      const data = await res.json()
      if (data.success) { setModalNuevo(false); await cargarDatos() }
      else alert(data.message ?? "Error al registrar el paciente")
    } catch {
      alert("Error de conexión al guardar")
    } finally {
      setGuardando(false)
    }
  }

  const pacientesFiltrados = pacientes.filter((p) => {
    const texto = busqueda.toLowerCase()
    return (
      (p.nombre.toLowerCase().includes(texto) ||
        p.apellido.toLowerCase().includes(texto) ||
        p.email.toLowerCase().includes(texto)) &&
      (filtroPsicologa === "todas" || p.psicologa === filtroPsicologa)
    )
  })

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NavbarSecretaria />
      <div className="flex flex-1 overflow-hidden">
        <SidebarSecretaria onNuevaCita={() => {}} onNuevoPaciente={() => setModalNuevo(true)} />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-dark">Pacientes</h1>
              <p className="text-slate-400 text-sm mt-0.5">
                {pacientes.length} paciente{pacientes.length !== 1 ? "s" : ""} registrado{pacientes.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={filtroPsicologa}
                onChange={(e) => setFiltroPsicologa(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              >
                <option value="todas">Todas las psicólogas</option>
                {psicologas.map((ps) => (
                  <option key={ps.professional_id} value={`${ps.nombre} ${ps.apellido}`}>
                    {ps.nombre} {ps.apellido}
                  </option>
                ))}
              </select>
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar paciente..."
                  className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary w-56 transition-colors"
                />
              </div>
              <button
                onClick={() => setModalNuevo(true)}
                className="bg-primary hover:bg-primary-hover text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo paciente
              </button>
            </div>
          </div>

          {/* Cargando */}
          {cargando && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-400 text-sm">Cargando pacientes...</p>
            </div>
          )}

          {/* Error */}
          {!cargando && error && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-dark font-medium mb-2">{error}</p>
              <button onClick={cargarDatos} className="text-sm text-primary hover:text-primary-hover font-medium">Reintentar</button>
            </div>
          )}

          {/* Sin resultados */}
          {!cargando && !error && pacientesFiltrados.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-dark font-semibold mb-1">{busqueda ? "Sin resultados" : "Sin pacientes registrados"}</p>
              <p className="text-slate-400 text-sm">{busqueda ? "Intenta con otro término" : "Agrega tu primer paciente con el botón de arriba"}</p>
            </div>
          )}

          {/* Grid */}
          {!cargando && !error && pacientesFiltrados.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {pacientesFiltrados.map((paciente) => (
                <TarjetaPaciente
                  key={paciente.patient_id}
                  paciente={paciente}
                  onClick={() => setPacienteSeleccionado(paciente)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <ModalNuevoPaciente abierto={modalNuevo} onCerrar={() => setModalNuevo(false)} onGuardar={handleGuardar} guardando={guardando} />
      <ModalInfoPaciente paciente={pacienteSeleccionado} onCerrar={() => setPacienteSeleccionado(null)} />
    </div>
  )
}