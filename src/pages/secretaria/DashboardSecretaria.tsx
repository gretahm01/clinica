// ===========================
// src/pages/secretaria/Dashboard.tsx
// ===========================
// Tablero de control de la secretaria.
//
// Secciones:
//   - Stats rápidas: citas hoy, confirmadas, pendientes, en espera
//   - Sala de espera con check-in y cronómetro
//   - Lista de espera (sugerencias si hay cancelación)
//   - Agenda del día con código de colores por estado
//
// Colores de estado:
//   Verde (#A3BFA8 / emerald)  → confirmada
//   Amarillo (amber)            → pendiente
//   Rojo (red)                  → cancelada
//   Azul (blue)                 → en sala de espera
//   Naranja (orange)            → espera > 15 min
//
// Cuando PHP esté listo:
//   - getCitasHoy() → reemplaza CITAS_HOY_MOCK
//   - getSalaEspera() → reemplaza SALA_ESPERA_MOCK
//   - getListaEspera() → reemplaza LISTA_ESPERA_MOCK
//   - checkInPaciente(citaId) → marcar paciente como "en sala"
//   - cancelarCita(citaId) → cambiar estado a cancelada
// ===========================

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import NavbarSecretaria from "../../components/layout/NavbarSecretaria"
import SidebarSecretaria from "../../components/layout/SidebarSecretaria"
import ModalNuevaCita, { type DatosCita } from "../../components/ui/ModalNuevaCita"
import ModalNuevoPaciente from "../../components/ui/ModalNuevoPaciente"
import type { DatosPaciente } from "../../components/ui/ModalNuevoPaciente"
import type { Paciente } from "../../types"

// ===========================
// TIPOS LOCALES
// ===========================
type EstadoCitaSecretaria = "confirmada" | "pendiente" | "cancelada" | "en_espera" | "completada"

interface CitaHoy {
  id: number
  pacienteNombre: string
  pacienteTelefono: string
  hora: string
  duracion: number        // minutos
  estado: EstadoCitaSecretaria
  psicologo: string
  minutosEspera?: number  // solo si estado === "en_espera"
}

interface PacienteEspera {
  id: number
  nombre: string
  citaId: number
  horaLlegada: string
  minutosEspera: number
  psicologo: string
}

interface PacienteListaEspera {
  id: number
  nombre: string
  telefono: string
  prioridad: "urgente" | "normal"
  diasSinCita: number
}

// ===========================
// DATOS MOCK
// ===========================
const CITAS_HOY_MOCK: CitaHoy[] = [
  { id: 1, pacienteNombre: "Carlos López", pacienteTelefono: "5599887766", hora: "09:00", duracion: 60, estado: "completada", psicologo: "Dra. Ana García" },
  { id: 2, pacienteNombre: "María Ramos", pacienteTelefono: "5512345678", hora: "10:00", duracion: 60, estado: "en_espera", psicologo: "Dra. Ana García", minutosEspera: 18 },
  { id: 3, pacienteNombre: "Luis Hernández", pacienteTelefono: "5587654321", hora: "11:00", duracion: 60, estado: "confirmada", psicologo: "Dra. Ana García" },
  { id: 4, pacienteNombre: "Sofia Martínez", pacienteTelefono: "5544332211", hora: "12:00", duracion: 60, estado: "pendiente", psicologo: "Dra. Ana García" },
  { id: 5, pacienteNombre: "Pedro González", pacienteTelefono: "5566778899", hora: "13:00", duracion: 60, estado: "cancelada", psicologo: "Dra. Ana García" },
  { id: 6, pacienteNombre: "Ana Flores", pacienteTelefono: "5511223344", hora: "15:00", duracion: 60, estado: "confirmada", psicologo: "Dra. Ana García" },
  { id: 7, pacienteNombre: "Roberto Díaz", pacienteTelefono: "5522334455", hora: "16:00", duracion: 60, estado: "pendiente", psicologo: "Dra. Ana García" },
]

const SALA_ESPERA_MOCK: PacienteEspera[] = [
  { id: 1, nombre: "María Ramos", citaId: 2, horaLlegada: "09:52", minutosEspera: 18, psicologo: "Dra. Ana García" },
]

const LISTA_ESPERA_MOCK: PacienteListaEspera[] = [
  { id: 1, nombre: "Jorge Vargas", telefono: "5533445566", prioridad: "urgente", diasSinCita: 21 },
  { id: 2, nombre: "Carmen Ruiz", telefono: "5544556677", prioridad: "normal", diasSinCita: 14 },
]

const PACIENTES_MOCK: Paciente[] = [
  { id: 1, userId: 3, nombre: "Carlos", apellido: "López", email: "paciente@medtrack.com", telefono: "5599887766", fechaNacimiento: "2000-11-05", fechaRegistro: "2026-03-10" },
]

// ===========================
// HELPERS
// ===========================

// Color del badge según estado
function colorEstado(estado: EstadoCitaSecretaria) {
  switch (estado) {
    case "confirmada":  return "bg-emerald-50 text-emerald-700 border-emerald-100"
    case "pendiente":   return "bg-amber-50 text-amber-700 border-amber-100"
    case "cancelada":   return "bg-red-50 text-red-600 border-red-100"
    case "en_espera":   return "bg-blue-50 text-blue-700 border-blue-100"
    case "completada":  return "bg-slate-100 text-slate-500 border-slate-200"
  }
}

// Punto de color para la línea de tiempo
function puntoEstado(estado: EstadoCitaSecretaria) {
  switch (estado) {
    case "confirmada":  return "bg-emerald-400"
    case "pendiente":   return "bg-amber-400"
    case "cancelada":   return "bg-red-400"
    case "en_espera":   return "bg-blue-500"
    case "completada":  return "bg-slate-300"
  }
}

// Etiqueta legible
function etiquetaEstado(estado: EstadoCitaSecretaria) {
  switch (estado) {
    case "confirmada":  return "Confirmada"
    case "pendiente":   return "Pendiente"
    case "cancelada":   return "Cancelada"
    case "en_espera":   return "En sala"
    case "completada":  return "Completada"
  }
}

// ===========================
// COMPONENTE PRINCIPAL
// ===========================
export default function DashboardSecretaria() {
  const navigate = useNavigate()

  const [modalCitaAbierto, setModalCitaAbierto]         = useState(false)
  const [modalPacienteAbierto, setModalPacienteAbierto] = useState(false)
  const [citas, setCitas]                               = useState<CitaHoy[]>(CITAS_HOY_MOCK)
  const [salaEspera, setSalaEspera]                     = useState<PacienteEspera[]>(SALA_ESPERA_MOCK)

  // Cronómetro — actualiza minutosEspera cada minuto
  useEffect(() => {
    const intervalo = setInterval(() => {
      setSalaEspera(prev => prev.map(p => ({
        ...p,
        minutosEspera: p.minutosEspera + 1,
      })))
    }, 60000) // cada 60 segundos
    return () => clearInterval(intervalo)
  }, [])

  // Stats calculadas de las citas del día
  const citasHoy        = citas.length
  const confirmadas     = citas.filter(c => c.estado === "confirmada").length
  const pendientes      = citas.filter(c => c.estado === "pendiente").length
  const enEspera        = citas.filter(c => c.estado === "en_espera").length

  // Marca una cita como cancelada
  // TODO: llamar a cancelarCita(id) de api.ts cuando PHP esté listo
  function handleCancelar(citaId: number) {
    setCitas(prev => prev.map(c =>
      c.id === citaId ? { ...c, estado: "cancelada" as EstadoCitaSecretaria } : c
    ))
  }

  // Marca el arribo del paciente — check-in en sala de espera
  // TODO: llamar a checkInPaciente(citaId) cuando PHP esté listo
  // PHP cambia estado a "en_espera" y notifica al psicólogo
  function handleCheckIn(cita: CitaHoy) {
    setCitas(prev => prev.map(c =>
      c.id === cita.id ? { ...c, estado: "en_espera" as EstadoCitaSecretaria, minutosEspera: 0 } : c
    ))
    setSalaEspera(prev => [...prev, {
      id: cita.id,
      nombre: cita.pacienteNombre,
      citaId: cita.id,
      horaLlegada: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
      minutosEspera: 0,
      psicologo: cita.psicologo,
    }])
  }

  // Guarda nueva cita
  // TODO: llamar a crearCita(datos) de api.ts cuando PHP esté listo
  function handleGuardarCita(datos: DatosCita) {
    console.log("Guardar cita:", datos)
    setModalCitaAbierto(false)
  }

  // Guarda nuevo paciente
  // TODO: llamar a crearPaciente(datos) de api.ts cuando PHP esté listo
  function handleGuardarPaciente(datos: DatosPaciente) {
    console.log("Guardar paciente:", datos)
    setModalPacienteAbierto(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      <NavbarSecretaria />

      <div className="flex flex-1 overflow-hidden">

        <SidebarSecretaria
          onNuevaCita={() => setModalCitaAbierto(true)}
          onNuevoPaciente={() => setModalPacienteAbierto(true)}
        />

        <main className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

          {/* ===========================
              STATS RÁPIDAS
              4 métricas del día con colores pastel
              =========================== */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">

            {/* Total citas hoy */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs bg-slate-50 text-slate-500 font-medium px-2 py-0.5 rounded-full">hoy</span>
              </div>
              <p className="text-3xl font-bold text-dark">{citasHoy}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Citas agendadas</p>
            </div>

            {/* Confirmadas — verde */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-600 font-medium px-2 py-0.5 rounded-full">confirmadas</span>
              </div>
              <p className="text-3xl font-bold text-dark">{confirmadas}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Confirmadas</p>
            </div>

            {/* En sala de espera — azul */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-xs bg-blue-50 text-blue-500 font-medium px-2 py-0.5 rounded-full">en sala</span>
              </div>
              <p className="text-3xl font-bold text-dark">{enEspera}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">En sala de espera</p>
            </div>

            {/* Pendientes — rosa */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs bg-amber-50 text-amber-600 font-medium px-2 py-0.5 rounded-full">pendientes</span>
              </div>
              <p className="text-3xl font-bold text-dark">{pendientes}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Por confirmar</p>
            </div>

          </div>

          {/* ===========================
              LAYOUT: agenda + panel derecho
              =========================== */}
          <div className="flex gap-5 flex-1">

            {/* ===========================
                AGENDA DEL DÍA
                Lista de citas con línea de tiempo visual,
                check-in y cancelar por cita
                =========================== */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-dark">Agenda del día</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                </div>
                {/* Leyenda */}
                <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span>Confirmada</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span>Pendiente</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span>En sala</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400"></span>Cancelada</span>
                </div>
              </div>

              {/* Lista de citas del día */}
              <div className="flex flex-col gap-2">
                {citas.map((cita) => (
                  <div
                    key={cita.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      cita.estado === "cancelada"
                        ? "opacity-50 bg-slate-50 border-slate-100"
                        : cita.estado === "completada"
                        ? "opacity-60 bg-slate-50 border-slate-100"
                        : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"
                    }`}
                  >
                    {/* Punto de color + hora */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${puntoEstado(cita.estado)}`}></div>
                      <span className="text-sm font-bold text-dark w-12">{cita.hora}</span>
                    </div>

                    {/* Info del paciente */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-dark">{cita.pacienteNombre}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-xs text-slate-400">{cita.psicologo}</p>
                        <span className="text-xs text-slate-300">·</span>
                        <p className="text-xs text-slate-400">{cita.duracion} min</p>
                        {/* Teléfono de contacto rápido */}
                        <span className="text-xs text-slate-300">·</span>
                        <a
                          href={`tel:${cita.pacienteTelefono}`}
                          className="text-xs text-primary hover:text-primary-hover font-medium flex items-center gap-1"
                          onClick={e => e.stopPropagation()}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {cita.pacienteTelefono}
                        </a>
                      </div>
                    </div>

                    {/* Badge de estado */}
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border flex-shrink-0 ${colorEstado(cita.estado)}`}>
                      {etiquetaEstado(cita.estado)}
                    </span>

                    {/* Acciones rápidas */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Check-in — solo si está confirmada */}
                      {cita.estado === "confirmada" && (
                        <button
                          onClick={() => handleCheckIn(cita)}
                          title="Marcar paciente como llegado"
                          className="flex items-center gap-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Llegó
                        </button>
                      )}

                      {/* Cancelar — si no está cancelada ni completada */}
                      {cita.estado !== "cancelada" && cita.estado !== "completada" && (
                        <button
                          onClick={() => handleCancelar(cita.id)}
                          title="Cancelar cita"
                          className="flex items-center gap-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-500 font-medium px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ===========================
                PANEL DERECHO
                Sala de espera + Lista de espera
                =========================== */}
            <div className="w-72 flex flex-col gap-4 flex-shrink-0">

              {/* SALA DE ESPERA
                  Muestra quién ya llegó con cronómetro.
                  Naranja si lleva más de 15 minutos.
                  Cuando PHP esté listo:
                    - checkInPaciente() notifica al psicólogo automáticamente
                  =========================== */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <h3 className="text-sm font-bold text-dark">Sala de espera</h3>
                  {salaEspera.length > 0 && (
                    <span className="ml-auto text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full">
                      {salaEspera.length}
                    </span>
                  )}
                </div>

                {salaEspera.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-xs text-slate-400">Sin pacientes en espera</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {salaEspera.map((paciente) => (
                      <div
                        key={paciente.id}
                        className={`p-3 rounded-xl border ${
                          paciente.minutosEspera >= 15
                            ? "bg-orange-50 border-orange-100"  // alerta naranja > 15 min
                            : "bg-blue-50 border-blue-100"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-dark">{paciente.nombre}</p>
                          {/* Cronómetro de espera */}
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            paciente.minutosEspera >= 15
                              ? "bg-orange-100 text-orange-600"
                              : "bg-blue-100 text-blue-600"
                          }`}>
                            {paciente.minutosEspera} min
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">Llegó a las {paciente.horaLlegada}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{paciente.psicologo}</p>
                        {/* Alerta de espera prolongada */}
                        {paciente.minutosEspera >= 15 && (
                          <p className="text-xs text-orange-600 font-medium mt-1.5 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Considera ofrecer atención
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* LISTA DE ESPERA
                  Pacientes sugeridos para llenar huecos por cancelación.
                  Ordenados por prioridad de urgencia.
                  Cuando PHP esté listo:
                    - getListaEspera() trae pacientes por días sin cita
                  =========================== */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-dark">Lista de espera</h3>
                  <span className="text-xs text-slate-400">Sugeridos para huecos</span>
                </div>

                <div className="flex flex-col gap-2">
                  {LISTA_ESPERA_MOCK.map((paciente) => (
                    <div key={paciente.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      {/* Avatar con inicial */}
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                        paciente.prioridad === "urgente" ? "bg-rose-400" : "bg-primary"
                      }`}>
                        {paciente.nombre[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-dark truncate">{paciente.nombre}</p>
                        <p className="text-xs text-slate-400">{paciente.diasSinCita} días sin cita</p>
                      </div>
                      {/* Llamar directamente */}
                      <a
                        href={`tel:${paciente.telefono}`}
                        className="w-8 h-8 bg-primary bg-opacity-10 hover:bg-opacity-20 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                        title={`Llamar a ${paciente.nombre}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </a>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* Modal nueva cita */}
      <ModalNuevaCita
        abierto={modalCitaAbierto}
        onCerrar={() => setModalCitaAbierto(false)}
        onGuardar={handleGuardarCita}
        pacientes={PACIENTES_MOCK}
        fechaInicial=""
      />

      {/* Modal nuevo paciente */}
      <ModalNuevoPaciente
        abierto={modalPacienteAbierto}
        onCerrar={() => setModalPacienteAbierto(false)}
        onGuardar={handleGuardarPaciente}
      />

    </div>
  )
}