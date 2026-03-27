// ===========================
// src/pages/psicologo/Paciente.tsx
// ===========================
// Pantalla donde el psicólogo ve y gestiona su lista de pacientes.
// Rediseñada con el mismo layout del Dashboard:
//   Navbar arriba + Sidebar izquierdo + contenido principal
//
// Conectada a PHP — usa getPacientes() y crearPaciente() reales.
// ===========================

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../../components/layout/Navbar"
import Sidebar from "../../components/layout/Sidebar"
import type { Paciente } from "../../types"
import { getPacientes, crearPaciente } from "../../services/api"
import ModalNuevoPaciente from "../../components/ui/ModalNuevoPaciente"
import type { DatosPaciente } from "../../components/ui/ModalNuevoPaciente"

// ===========================
// TARJETA DE PACIENTE
// Card clickeable que muestra info resumida del paciente.
// Al picarla navega al perfil completo.
// ===========================
function TarjetaPaciente({
  paciente,
  onClick,
}: {
  paciente: Paciente
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-primary hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-3 mb-4">
        {/* Avatar con iniciales */}
        <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {paciente.nombre[0]}{paciente.apellido[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-dark truncate">
            {paciente.nombre} {paciente.apellido}
            {paciente.apellidoMaterno && ` ${paciente.apellidoMaterno}`}
          </p>
          <p className="text-xs text-slate-400 truncate">{paciente.email}</p>
        </div>
        {/* Badge activo */}
        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-50 text-emerald-600 border border-emerald-100 flex-shrink-0">
          Activo
        </span>
      </div>

      {/* Info rápida */}
      <div className="flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          {paciente.telefono}
        </span>
        <span className="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {paciente.totalCitas ?? 0} citas
        </span>
      </div>

      {/* Flecha hover */}
      <div className="flex justify-end mt-3">
        <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Ver perfil →
        </span>
      </div>
    </div>
  )
}

// ===========================
// COMPONENTE PRINCIPAL
// ===========================
export default function Pacientes() {
  const navigate = useNavigate()

  const [pacientes, setPacientes]   = useState<Paciente[]>([])
  const [busqueda, setBusqueda]     = useState("")
  const [modalAbierto, setModalAbierto] = useState(false)
  const [cargando, setCargando]     = useState(true)
  const [error, setError]           = useState("")
  const [guardando, setGuardando]   = useState(false)

  // Carga la lista de pacientes al entrar
  useEffect(() => {
    cargarPacientes()
  }, [])

  async function cargarPacientes() {
    try {
      setCargando(true)
      setError("")
      const respuesta = await getPacientes()
      if (respuesta.success) {
        setPacientes(respuesta.data)
      } else {
        setError("No se pudieron cargar los pacientes")
      }
    } catch {
      setError("Error de conexión con el servidor")
    } finally {
      setCargando(false)
    }
  }

  async function handleGuardar(datos: DatosPaciente) {
    try {
      setGuardando(true)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const respuesta = await crearPaciente(datos as any)
      if (respuesta.success) {
        setModalAbierto(false)
        await cargarPacientes()
      } else {
        alert(respuesta.message ?? "Error al registrar el paciente")
      }
    } catch {
      alert("Error de conexión al guardar el paciente")
    } finally {
      setGuardando(false)
    }
  }

  // Filtra por nombre, apellido o correo
  const pacientesFiltrados = pacientes.filter((p) => {
    const texto = busqueda.toLowerCase()
    return (
      p.nombre.toLowerCase().includes(texto) ||
      p.apellido.toLowerCase().includes(texto) ||
      p.email.toLowerCase().includes(texto)
    )
  })

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Navbar sticky */}
      <Navbar />

      {/* Layout: sidebar + contenido */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar de navegación */}
        <Sidebar
          citasHoy={0}
          citasSemana={0}
          citasPendientes={0}
          proximasCitas={[]}
          onNuevaCita={() => {}}
        />

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* Header con título + buscador + botón */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-dark">Pacientes</h1>
              <p className="text-slate-400 text-sm mt-0.5">
                {pacientes.length} paciente{pacientes.length !== 1 ? "s" : ""} registrado{pacientes.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Buscador + botón nuevo paciente */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar paciente..."
                  className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary w-64 transition-colors"
                />
              </div>
              <button
                onClick={() => setModalAbierto(true)}
                className="bg-primary hover:bg-primary-hover text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo paciente
              </button>
            </div>
          </div>

          {/* ===========================
              ESTADOS: cargando / error / vacío / lista
              =========================== */}

          {/* Cargando */}
          {cargando && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-400 text-sm">Cargando pacientes...</p>
            </div>
          )}

          {/* Error de conexión */}
          {!cargando && error && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-dark font-medium mb-2">{error}</p>
              <button
                onClick={cargarPacientes}
                className="text-sm text-primary hover:text-primary-hover font-medium"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Sin pacientes */}
          {!cargando && !error && pacientesFiltrados.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-dark font-semibold mb-1">
                {busqueda ? "Sin resultados" : "Sin pacientes registrados"}
              </p>
              <p className="text-slate-400 text-sm">
                {busqueda
                  ? "Intenta con otro término de búsqueda"
                  : "Agrega tu primer paciente con el botón de arriba"
                }
              </p>
            </div>
          )}

          {/* Grid de pacientes */}
          {!cargando && !error && pacientesFiltrados.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {pacientesFiltrados.map((paciente) => (
                <TarjetaPaciente
                  key={paciente.id}
                  paciente={paciente}
                  onClick={() => navigate(`/psicologo/pacientes/${paciente.id}`)}
                />
              ))}
            </div>
          )}

        </main>
      </div>

      {/* Modal nuevo paciente */}
      <ModalNuevoPaciente
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onGuardar={handleGuardar}
        guardando={guardando}
      />

    </div>
  )
}