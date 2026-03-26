// ===========================
// src/pages/paciente/DashboardPaciente.tsx
// ===========================
// Dashboard principal del paciente.
// Es lo primero que ve al iniciar sesión.
//
// Muestra:
//   - NavbarPaciente (componente reutilizable en todas las páginas del paciente)
//   - Saludo personalizado con su nombre
//   - Próxima cita destacada (la más próxima confirmada)
//   - Lista de todas sus citas (próximas arriba, historial abajo)
//   - Lista de sus tareas pendientes y entregadas
//   - Botón para solicitar nueva cita
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
// Reemplazar con llamadas reales a api.ts cuando PHP esté listo
// ===========================
const CITAS_MOCK: Cita[] = [
  {
    id: 1,
    pacienteId: 1,
    profesionalId: 1,
    fecha: "2026-04-01",
    hora: "10:00",
    estado: "confirmada",
    feedback: undefined,
  },
  {
    id: 2,
    pacienteId: 1,
    profesionalId: 1,
    fecha: "2026-03-20",
    hora: "10:00",
    estado: "completada",
    feedback: "Buen progreso esta sesión. Continúa con los ejercicios de respiración diafragmática que practicamos.",
  },
  {
    id: 3,
    pacienteId: 1,
    profesionalId: 1,
    fecha: "2026-03-13",
    hora: "10:00",
    estado: "completada",
    feedback: undefined,
  },
  {
    id: 4,
    pacienteId: 1,
    profesionalId: 1,
    fecha: "2026-03-05",
    hora: "09:00",
    estado: "cancelada",
    feedback: undefined,
  },
]

const TAREAS_MOCK: Tarea[] = [
  {
    id: 1,
    pacienteId: 1,
    profesionalId: 1,
    titulo: "Diario de emociones",
    contenido: "Escribe cada noche cómo te sentiste durante el día y qué lo provocó. Intenta identificar al menos 3 emociones distintas por semana.",
    fechaLimite: "2026-04-01",
    estado: "pendiente",
    fechaCreacion: "2026-03-20",
  },
  {
    id: 2,
    pacienteId: 1,
    profesionalId: 1,
    titulo: "Ejercicios de respiración",
    contenido: "Practica la respiración diafragmática 5 minutos cada mañana. Registra cómo te sientes antes y después.",
    fechaLimite: "2026-03-28",
    estado: "entregada",
    fechaCreacion: "2026-03-13",
    fechaEntrega: "2026-03-25",
  },
  {
    id: 3,
    pacienteId: 1,
    profesionalId: 1,
    titulo: "Lista de actividades positivas",
    contenido: "Haz una lista de 10 actividades que te den bienestar y realiza al menos 3 esta semana.",
    fechaLimite: "2026-03-15",
    estado: "revisada",
    comentarioTerapeuta: "Excelente trabajo. Me alegra ver que incluiste actividades sociales en tu lista.",
    fechaCreacion: "2026-03-08",
    fechaEntrega: "2026-03-14",
  },
]

// ===========================
// HELPERS
// ===========================

// Colores según el estado de la cita
function colorEstadoCita(estado: EstadoCita) {
  switch (estado) {
    case "confirmada":  return "bg-green-50 text-green-600"
    case "pendiente":   return "bg-yellow-50 text-yellow-600"
    case "cancelada":   return "bg-red-50 text-red-500"
    case "completada":  return "bg-slate-100 text-slate-500"
  }
}

// Etiqueta legible del estado de la cita
function etiquetaEstadoCita(estado: EstadoCita) {
  switch (estado) {
    case "confirmada":  return "Confirmada"
    case "pendiente":   return "Por confirmar"
    case "cancelada":   return "Cancelada"
    case "completada":  return "Completada"
  }
}

// Colores según el estado de la tarea
function colorEstadoTarea(estado: string) {
  switch (estado) {
    case "revisada":  return "bg-green-50 text-green-600"
    case "entregada": return "bg-blue-50 text-blue-600"
    default:          return "bg-yellow-50 text-yellow-600"
  }
}

// Etiqueta legible del estado de la tarea
function etiquetaEstadoTarea(estado: string) {
  switch (estado) {
    case "revisada":  return "Revisada ✓"
    case "entregada": return "Entregada"
    default:          return "Pendiente"
  }
}

// Formatea una fecha "2026-04-01" en texto legible
function formatearFecha(fecha: string) {
  return new Date(fecha + "T12:00:00").toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Devuelve true si la fecha ya pasó
function esPasada(fecha: string) {
  return new Date(fecha + "T23:59:59") < new Date()
}

// ===========================
// COMPONENTE PRINCIPAL
// ===========================
export default function DashboardPaciente() {
  const navigate    = useNavigate()
  const { usuario } = useAuth()

  // Controla si el modal de solicitar cita está abierto
  const [modalCitaAbierto, setModalCitaAbierto] = useState(false)

  // Controla qué sección de tareas se muestra: activas o revisadas
  const [pestañaTareas, setPestañaTareas] = useState<"activas" | "historial">("activas")

  // Citas futuras no canceladas — las más próximas primero
  const citasProximas = CITAS_MOCK.filter(
    c => !esPasada(c.fecha) && c.estado !== "cancelada"
  ).sort((a, b) => a.fecha.localeCompare(b.fecha))

  // Citas pasadas o canceladas — las más recientes primero
  const historialCitas = CITAS_MOCK.filter(
    c => esPasada(c.fecha) || c.estado === "cancelada"
  ).sort((a, b) => b.fecha.localeCompare(a.fecha))

  // La próxima cita confirmada (o la primera próxima si no hay confirmada)
  const proximaCita = citasProximas.find(c => c.estado === "confirmada") ?? citasProximas[0]

  // Tareas activas: pendientes o entregadas (aún no revisadas)
  const tareasActivas = TAREAS_MOCK.filter(
    t => t.estado === "pendiente" || t.estado === "entregada"
  )

  // Tareas del historial: ya revisadas por el psicólogo
  const tareasHistorial = TAREAS_MOCK.filter(t => t.estado === "revisada")

  return (
    <div className="min-h-screen bg-background">

      {/* NavbarPaciente reutilizable — mismo en todas las páginas del paciente */}
      <NavbarPaciente />

      <div className="max-w-4xl mx-auto p-6">

        {/* ===========================
            SALUDO + BOTÓN SOLICITAR CITA
            =========================== */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-dark">
              Hola, {usuario?.nombre ?? "bienvenido"} 👋
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Aquí puedes ver tus citas y tareas asignadas.
            </p>
          </div>
          <button
            onClick={() => setModalCitaAbierto(true)}
            className="bg-primary hover:bg-primary-hover text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            + Solicitar cita
          </button>
        </div>

        {/* ===========================
            PRÓXIMA CITA DESTACADA
            Solo se muestra si hay una cita próxima confirmada o pendiente.
            Al picarle navega al detalle de esa cita.
            =========================== */}
        {proximaCita && (
          <div
            onClick={() => navigate(`/paciente/citas/${proximaCita.id}`)}
            className="bg-dark text-white rounded-2xl p-5 mb-6 cursor-pointer hover:opacity-95 transition-opacity"
          >
            <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-medium">
              Próxima cita
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold mb-1">
                  {formatearFecha(proximaCita.fecha)}
                </p>
                <p className="text-slate-300 text-sm">
                  {proximaCita.hora} hrs · Psicología clínica
                </p>
              </div>
              <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                proximaCita.estado === "confirmada"
                  ? "bg-green-500 text-white"
                  : "bg-yellow-400 text-dark"
              }`}>
                {etiquetaEstadoCita(proximaCita.estado)}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-3">
              Toca para ver detalles →
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ===========================
              COLUMNA IZQUIERDA — CITAS
              =========================== */}
          <div className="flex flex-col gap-4">

            {/* Citas próximas — futuras y no canceladas */}
            {citasProximas.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h3 className="font-semibold text-dark mb-4">Citas próximas</h3>
                <div className="flex flex-col gap-3">
                  {citasProximas.map((cita) => (
                    <div
                      key={cita.id}
                      onClick={() => navigate(`/paciente/citas/${cita.id}`)}
                      className="flex items-center justify-between p-3 bg-background rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-dark">
                          {formatearFecha(cita.fecha)}
                        </p>
                        <p className="text-xs text-slate-400">{cita.hora} hrs</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${colorEstadoCita(cita.estado)}`}>
                        {etiquetaEstadoCita(cita.estado)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Historial de citas pasadas o canceladas */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-semibold text-dark mb-4">Historial de citas</h3>
              {historialCitas.length === 0 ? (
                <p className="text-sm text-slate-400">No hay citas anteriores.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {historialCitas.map((cita) => (
                    <div
                      key={cita.id}
                      onClick={() => navigate(`/paciente/citas/${cita.id}`)}
                      className="flex items-center justify-between p-3 bg-background rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-dark">
                          {formatearFecha(cita.fecha)}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-slate-400">{cita.hora} hrs</p>
                          {/* Indicador visual si la cita tiene retroalimentación */}
                          {cita.feedback && (
                            <span className="text-xs text-primary font-medium">
                              · Tiene retroalimentación
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${colorEstadoCita(cita.estado)}`}>
                        {etiquetaEstadoCita(cita.estado)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* ===========================
              COLUMNA DERECHA — TAREAS
              Tabs para ver tareas activas o revisadas
              =========================== */}
          <div className="bg-white rounded-2xl shadow-sm p-5">

            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-dark">Mis tareas</h3>
              <div className="flex gap-1 bg-background rounded-lg p-1">
                <button
                  onClick={() => setPestañaTareas("activas")}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                    pestañaTareas === "activas"
                      ? "bg-white text-dark shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  Activas ({tareasActivas.length})
                </button>
                <button
                  onClick={() => setPestañaTareas("historial")}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                    pestañaTareas === "historial"
                      ? "bg-white text-dark shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  Revisadas ({tareasHistorial.length})
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {pestañaTareas === "activas" ? (
                tareasActivas.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-2xl mb-2">✅</p>
                    <p className="text-sm text-slate-400">No tienes tareas pendientes.</p>
                  </div>
                ) : (
                  tareasActivas.map((tarea) => (
                    <div
                      key={tarea.id}
                      onClick={() => navigate(`/paciente/tareas/${tarea.id}`)}
                      className="p-4 bg-background rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-medium text-dark">{tarea.titulo}</p>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${colorEstadoTarea(tarea.estado)}`}>
                          {etiquetaEstadoTarea(tarea.estado)}
                        </span>
                      </div>
                      {tarea.fechaLimite && (
                        <p className="text-xs text-slate-400">
                          Entrega: {new Date(tarea.fechaLimite + "T12:00:00").toLocaleDateString("es-MX")}
                        </p>
                      )}
                      <p className="text-xs text-primary font-medium mt-2">
                        {tarea.estado === "pendiente" ? "Toca para entregar →" : "Toca para ver →"}
                      </p>
                    </div>
                  ))
                )
              ) : (
                tareasHistorial.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">No hay tareas revisadas aún.</p>
                ) : (
                  tareasHistorial.map((tarea) => (
                    <div
                      key={tarea.id}
                      onClick={() => navigate(`/paciente/tareas/${tarea.id}`)}
                      className="p-4 bg-background rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-medium text-dark">{tarea.titulo}</p>
                        <span className="text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 bg-green-50 text-green-600">
                          Revisada ✓
                        </span>
                      </div>
                      {tarea.comentarioTerapeuta && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          💬 "{tarea.comentarioTerapeuta}"
                        </p>
                      )}
                    </div>
                  ))
                )
              )}
            </div>

          </div>

        </div>
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