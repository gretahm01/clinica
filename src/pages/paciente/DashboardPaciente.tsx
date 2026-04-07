// ===========================
// src/pages/paciente/DashboardPaciente.tsx
// ===========================
// Dashboard principal del paciente — rediseñado con layout profesional.
// Sidebar fijo a la izquierda + contenido principal a la derecha.
// Inspirado en el estilo de Linear, Notion y software clínico real.
//
// Estructura:
//   - Sidebar fijo: saludo, stats rápidas, próxima cita destacada,
//     navegación y botón de solicitar cita
//   - Contenido principal: citas y tareas en grid amplio
//
// Cuando PHP esté listo:
//   - getCitasPorPaciente(pacienteId) → reemplaza CITAS_MOCK
//   - getTareasPorPaciente(pacienteId) → reemplaza TAREAS_MOCK
// ===========================

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import type { Cita, Tarea, EstadoCita } from "../../types"
import ModalSolicitarCita from "../../components/ui/ModalSolicitarCita"
import NavbarPaciente from "../../components/layout/NavbarPaciente"

// ===========================
// DATOS MOCK
// ===========================
const CITAS_MOCK: Cita[] = [
  {
    id: 1, pacienteId: 1, profesionalId: 1,
    fecha: "2026-04-01", hora: "10:00",
    estado: "confirmada", feedback: undefined,
  },
  {
    id: 2, pacienteId: 1, profesionalId: 1,
    fecha: "2026-03-20", hora: "10:00",
    estado: "completada",
    feedback: "Buen progreso esta sesión. Continúa con los ejercicios de respiración diafragmática que practicamos.",
  },
  {
    id: 3, pacienteId: 1, profesionalId: 1,
    fecha: "2026-03-13", hora: "10:00",
    estado: "completada", feedback: undefined,
  },
  {
    id: 4, pacienteId: 1, profesionalId: 1,
    fecha: "2026-03-05", hora: "09:00",
    estado: "cancelada", feedback: undefined,
  },
]

const TAREAS_MOCK: Tarea[] = [
  {
    id: 1, pacienteId: 1, profesionalId: 1,
    titulo: "Diario de emociones",
    contenido: "Escribe cada noche cómo te sentiste durante el día.",
    fechaLimite: "2026-04-01",
    estado: "pendiente", fechaCreacion: "2026-03-20",
  },
  {
    id: 2, pacienteId: 1, profesionalId: 1,
    titulo: "Ejercicios de respiración",
    contenido: "Practica la respiración diafragmática 5 minutos cada mañana.",
    fechaLimite: "2026-03-28",
    estado: "entregada", fechaCreacion: "2026-03-13", fechaEntrega: "2026-03-25",
  },
  {
    id: 3, pacienteId: 1, profesionalId: 1,
    titulo: "Lista de actividades positivas",
    contenido: "Haz una lista de 10 actividades que te den bienestar.",
    fechaLimite: "2026-03-15",
    estado: "revisada",
    comentarioTerapeuta: "Excelente trabajo. Me alegra ver que incluiste actividades sociales.",
    fechaCreacion: "2026-03-08", fechaEntrega: "2026-03-14",
  },
]

// ===========================
// HELPERS
// ===========================

function colorEstadoCita(estado: EstadoCita) {
  switch (estado) {
    case "confirmada": return "bg-emerald-50 text-emerald-600 border border-emerald-100"
    case "pendiente":  return "bg-amber-50 text-amber-600 border border-amber-100"
    case "cancelada":  return "bg-red-50 text-red-500 border border-red-100"
    case "completada": return "bg-slate-100 text-slate-500 border border-slate-200"
  }
}

function etiquetaEstadoCita(estado: EstadoCita) {
  switch (estado) {
    case "confirmada": return "Confirmada"
    case "pendiente":  return "Por confirmar"
    case "cancelada":  return "Cancelada"
    case "completada": return "Completada"
  }
}

function colorEstadoTarea(estado: string) {
  switch (estado) {
    case "revisada":  return "bg-emerald-50 text-emerald-600 border border-emerald-100"
    case "entregada": return "bg-blue-50 text-blue-600 border border-blue-100"
    default:          return "bg-amber-50 text-amber-600 border border-amber-100"
  }
}

function etiquetaEstadoTarea(estado: string) {
  switch (estado) {
    case "revisada":  return "Revisada ✓"
    case "entregada": return "Entregada"
    default:          return "Pendiente"
  }
}

// Formatea "2026-04-01" → "miércoles, 1 de abril de 2026"
function formatearFecha(fecha: string) {
  return new Date(fecha + "T12:00:00").toLocaleDateString("es-MX", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  })
}

// Formato corto: "1 abr 2026"
function formatearFechaCorta(fecha: string) {
  return new Date(fecha + "T12:00:00").toLocaleDateString("es-MX", {
    day: "numeric", month: "short", year: "numeric",
  })
}

function esPasada(fecha: string) {
  return new Date(fecha + "T23:59:59") < new Date()
}

// ===========================
// COMPONENTE PRINCIPAL
// ===========================
export default function DashboardPaciente() {
  const navigate    = useNavigate()
  const { usuario } = useAuth()

  const [modalCitaAbierto, setModalCitaAbierto] = useState(false)
  const [pestañaTareas, setPestañaTareas]       = useState<"activas" | "historial">("activas")
  const [seccionActiva, setSeccionActiva]       = useState<"citas" | "tareas">("citas")

  // Filtros de citas
  const citasProximas = CITAS_MOCK
    .filter(c => !esPasada(c.fecha) && c.estado !== "cancelada")
    .sort((a, b) => a.fecha.localeCompare(b.fecha))

  const historialCitas = CITAS_MOCK
    .filter(c => esPasada(c.fecha) || c.estado === "cancelada")
    .sort((a, b) => b.fecha.localeCompare(a.fecha))

  const proximaCita = citasProximas.find(c => c.estado === "confirmada") ?? citasProximas[0]

  // Filtros de tareas
  const tareasActivas   = TAREAS_MOCK.filter(t => t.estado === "pendiente" || t.estado === "entregada")
  const tareasHistorial = TAREAS_MOCK.filter(t => t.estado === "revisada")
  const tareasPendientes = TAREAS_MOCK.filter(t => t.estado === "pendiente").length

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Navbar completo arriba */}
      <NavbarPaciente />

      {/* Layout: sidebar + contenido */}
      <div className="flex flex-1 overflow-hidden">

        {/* ===========================
            SIDEBAR FIJO
            Ancho fijo de 280px, altura completa.
            Contiene: saludo, stats, próxima cita y navegación.
            =========================== */}
        <aside className="w-72 min-h-screen bg-white border-r border-slate-100 flex flex-col p-5 gap-5 flex-shrink-0">

          {/* Saludo personalizado */}
          <div className="pt-2">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
              Bienvenido de vuelta
            </p>
            <h2 className="text-xl font-bold text-dark">
              {usuario?.nombre ?? "Paciente"} 👋
            </h2>
          </div>

          {/* ===========================
              STATS RÁPIDAS
              Contador de tareas pendientes y próxima cita
              =========================== */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-dark">{citasProximas.length}</p>
              <p className="text-xs text-slate-400 mt-0.5">Citas próximas</p>
            </div>
            <div className="bg-background rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-amber-500">{tareasPendientes}</p>
              <p className="text-xs text-slate-400 mt-0.5">Tareas pendientes</p>
            </div>
          </div>

          {/* ===========================
              PRÓXIMA CITA DESTACADA EN SIDEBAR
              Card oscuro llamativo — lo más importante que debe ver el paciente
              =========================== */}
          {proximaCita ? (
            <div
              onClick={() => navigate(`/paciente/citas/${proximaCita.id}`)}
              className="bg-dark rounded-2xl p-4 cursor-pointer hover:opacity-95 transition-all hover:shadow-lg group"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                  Próxima cita
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  proximaCita.estado === "confirmada"
                    ? "bg-emerald-500 text-white"
                    : "bg-amber-400 text-dark"
                }`}>
                  {etiquetaEstadoCita(proximaCita.estado)}
                </span>
              </div>
              <p className="text-white font-bold text-sm leading-snug mb-1 capitalize">
                {formatearFecha(proximaCita.fecha)}
              </p>
              <p className="text-slate-400 text-xs">{proximaCita.hora} hrs</p>
              <div className="mt-3 flex items-center gap-1 text-slate-400 text-xs group-hover:text-slate-300 transition-colors">
                <span>Ver detalles</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ) : (
            // Si no hay cita próxima — invita a solicitar una
            <div className="bg-background rounded-2xl p-4 text-center border-2 border-dashed border-slate-200">
              <p className="text-sm text-slate-400 mb-2">Sin citas próximas</p>
              <button
                onClick={() => setModalCitaAbierto(true)}
                className="text-xs text-primary font-medium hover:text-primary-hover"
              >
                + Solicitar cita
              </button>
            </div>
          )}

          {/* ===========================
              NAVEGACIÓN DEL SIDEBAR
              Tabs para cambiar entre Citas y Tareas en el contenido principal
              =========================== */}
          <nav className="flex flex-col gap-1">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1 px-2">
              Secciones
            </p>

            {/* Tab Citas */}
            <button
              onClick={() => setSeccionActiva("citas")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                seccionActiva === "citas"
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-600 hover:bg-background"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Mis citas</span>
              {/* Badge con cantidad de citas próximas */}
              {citasProximas.length > 0 && (
                <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  seccionActiva === "citas" ? "bg-white text-primary" : "bg-primary text-white"
                }`}>
                  {citasProximas.length}
                </span>
              )}
            </button>

            {/* Tab Tareas */}
            <button
              onClick={() => setSeccionActiva("tareas")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                seccionActiva === "tareas"
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-600 hover:bg-background"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span>Mis tareas</span>
              {/* Badge con tareas pendientes */}
              {tareasPendientes > 0 && (
                <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  seccionActiva === "tareas" ? "bg-white text-primary" : "bg-amber-500 text-white"
                }`}>
                  {tareasPendientes}
                </span>
              )}
            </button>
          </nav>

          {/* Botón solicitar cita al fondo del sidebar */}
          <div className="mt-auto">
            <button
              onClick={() => setModalCitaAbierto(true)}
              className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Solicitar cita
            </button>
          </div>

        </aside>

        {/* ===========================
            CONTENIDO PRINCIPAL
            Cambia según la sección activa (citas o tareas)
            =========================== */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* ===========================
              SECCIÓN: CITAS
              =========================== */}
          {seccionActiva === "citas" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-dark">Mis citas</h1>
                  <p className="text-slate-400 text-sm mt-0.5">
                    {CITAS_MOCK.length} citas en total
                  </p>
                </div>
              </div>

              {/* Citas próximas */}
              {citasProximas.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Próximas
                  </h2>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    {citasProximas.map((cita) => (
                      <div
                        key={cita.id}
                        onClick={() => navigate(`/paciente/citas/${cita.id}`)}
                        className="bg-white rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all border border-slate-100 hover:border-primary group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* Bloque de fecha visual */}
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                              <p className="text-lg font-bold text-primary leading-none">
                                {new Date(cita.fecha + "T12:00:00").getDate()}
                              </p>
                              <p className="text-xs text-primary font-medium">
                                {new Date(cita.fecha + "T12:00:00").toLocaleDateString("es-MX", { month: "short" }).replace(".", "")}
                              </p>
                            </div>
                            <div>
                              <p className="font-semibold text-dark capitalize">
                                {new Date(cita.fecha + "T12:00:00").toLocaleDateString("es-MX", { weekday: "long" })}
                              </p>
                              <p className="text-sm text-slate-400">{cita.hora} hrs · Psicología clínica</p>
                            </div>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${colorEstadoCita(cita.estado)}`}>
                            {etiquetaEstadoCita(cita.estado)}
                          </span>
                        </div>
                        <p className="text-xs text-primary font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          Ver detalles →
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Historial */}
              {historialCitas.length > 0 && (
                <div>
                  <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Historial
                  </h2>
                  <div className="flex flex-col gap-2">
                    {historialCitas.map((cita) => (
                      <div
                        key={cita.id}
                        onClick={() => navigate(`/paciente/citas/${cita.id}`)}
                        className="bg-white rounded-xl px-5 py-4 cursor-pointer hover:shadow-sm transition-all border border-slate-100 hover:border-slate-200 flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                            <p className="text-sm font-bold text-slate-500 leading-none">
                              {new Date(cita.fecha + "T12:00:00").getDate()}
                            </p>
                            <p className="text-xs text-slate-400">
                              {new Date(cita.fecha + "T12:00:00").toLocaleDateString("es-MX", { month: "short" }).replace(".", "")}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-dark capitalize">
                              {new Date(cita.fecha + "T12:00:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-slate-400">{cita.hora} hrs</p>
                              {/* Indicador de retroalimentación disponible */}
                              {cita.feedback && (
                                <span className="text-xs text-primary font-medium flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                  </svg>
                                  Retroalimentación disponible
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${colorEstadoCita(cita.estado)}`}>
                            {etiquetaEstadoCita(cita.estado)}
                          </span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===========================
              SECCIÓN: TAREAS
              =========================== */}
          {seccionActiva === "tareas" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-dark">Mis tareas</h1>
                  <p className="text-slate-400 text-sm mt-0.5">
                    {tareasPendientes} pendiente{tareasPendientes !== 1 ? "s" : ""}
                  </p>
                </div>
                {/* Tabs activas / revisadas */}
                <div className="flex gap-1 bg-white border border-slate-100 rounded-xl p-1">
                  <button
                    onClick={() => setPestañaTareas("activas")}
                    className={`text-xs px-4 py-2 rounded-lg font-medium transition-colors ${
                      pestañaTareas === "activas"
                        ? "bg-primary text-white shadow-sm"
                        : "text-slate-500 hover:text-dark"
                    }`}
                  >
                    Activas ({tareasActivas.length})
                  </button>
                  <button
                    onClick={() => setPestañaTareas("historial")}
                    className={`text-xs px-4 py-2 rounded-lg font-medium transition-colors ${
                      pestañaTareas === "historial"
                        ? "bg-primary text-white shadow-sm"
                        : "text-slate-500 hover:text-dark"
                    }`}
                  >
                    Revisadas ({tareasHistorial.length})
                  </button>
                </div>
              </div>

              {/* Lista de tareas activas */}
              {pestañaTareas === "activas" && (
                <div>
                  {tareasActivas.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                      <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="font-semibold text-dark mb-1">¡Todo al día!</p>
                      <p className="text-sm text-slate-400">No tienes tareas pendientes.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {tareasActivas.map((tarea) => (
                        <div
                          key={tarea.id}
                          onClick={() => navigate(`/paciente/tareas/${tarea.id}`)}
                          className="bg-white rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all border border-slate-100 hover:border-primary group"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <h3 className="font-semibold text-dark">{tarea.titulo}</h3>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${colorEstadoTarea(tarea.estado)}`}>
                              {etiquetaEstadoTarea(tarea.estado)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400 line-clamp-2 mb-3">{tarea.contenido}</p>
                          <div className="flex items-center justify-between">
                            {tarea.fechaLimite && (
                              <p className="text-xs text-slate-400 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Entrega: {formatearFechaCorta(tarea.fechaLimite)}
                              </p>
                            )}
                            <p className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                              {tarea.estado === "pendiente" ? "Entregar →" : "Ver →"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Lista de tareas revisadas */}
              {pestañaTareas === "historial" && (
                <div>
                  {tareasHistorial.length === 0 ? (
                    <p className="text-sm text-slate-400 py-8 text-center">No hay tareas revisadas aún.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {tareasHistorial.map((tarea) => (
                        <div
                          key={tarea.id}
                          onClick={() => navigate(`/paciente/tareas/${tarea.id}`)}
                          className="bg-white rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all border border-slate-100 hover:border-emerald-200 group"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="font-semibold text-dark">{tarea.titulo}</h3>
                            <span className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 bg-emerald-50 text-emerald-600 border border-emerald-100">
                              Revisada ✓
                            </span>
                          </div>
                          {/* Preview del comentario del terapeuta */}
                          {tarea.comentarioTerapeuta && (
                            <div className="bg-background rounded-lg px-3 py-2 mt-2">
                              <p className="text-xs text-slate-500 line-clamp-2">
                                💬 {tarea.comentarioTerapeuta}
                              </p>
                            </div>
                          )}
                          <p className="text-xs text-primary font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            Ver detalle →
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* Modal para solicitar una nueva cita */}
      <ModalSolicitarCita
        abierto={modalCitaAbierto}
        onCerrar={() => setModalCitaAbierto(false)}
        onGuardar={(datos) => {
          console.log("Solicitud de cita:", datos)
          // TODO: llamar a solicitarCita(datos) de src/services/api.ts
          setModalCitaAbierto(false)
        }}
      />

    </div>
  )
}