// ===========================
// src/pages/psicologo/DetalleTarea.tsx
// ===========================
// Página de detalle de una tarea específica.
// Se accede desde el perfil del paciente al picar una tarea.
// Ruta: /psicologo/pacientes/:pacienteId/tareas/:tareaId
//
// El psicólogo puede:
//   - Ver el contenido de la tarea
//   - Ver si el paciente la entregó
//   - Marcarla como revisada
//   - Dejar un comentario al paciente
// ===========================

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../../components/layout/Navbar"
import type { Tarea } from "../../types"

// Datos mock — vendrán de getTarea(tareaId) cuando PHP esté listo
const TAREA_EJEMPLO: Tarea = {
  id: 1,
  pacienteId: 1,
  profesionalId: 1,
  titulo: "Diario de emociones",
  contenido: "Escribe cada noche cómo te sentiste durante el día y qué lo provocó. Intenta identificar al menos 3 emociones distintas por semana.",
  fechaLimite: "2026-03-17",
  estado: "entregada",
  imagePath: undefined,
  comentarioTerapeuta: "",
  fechaCreacion: "2026-03-10",
  fechaEntrega: "2026-03-16",
}

// Colores por estado de tarea
function colorEstado(estado: string) {
  switch (estado) {
    case "revisada":  return "bg-green-50 text-green-600 border-green-100"
    case "entregada": return "bg-blue-50 text-blue-600 border-blue-100"
    default:          return "bg-yellow-50 text-yellow-600 border-yellow-100"
  }
}

// Texto descriptivo del estado
function textoEstado(estado: string) {
  switch (estado) {
    case "revisada":  return "Ya revisada por el psicólogo"
    case "entregada": return "Entregada por el paciente — pendiente de revisión"
    default:          return "El paciente aún no ha entregado esta tarea"
  }
}

export default function DetalleTarea() {
  const { pacienteId, tareaId } = useParams()
  const navigate = useNavigate()

  // Cuando PHP esté listo: getTarea(tareaId)
  const [tarea, setTarea] = useState<Tarea>(TAREA_EJEMPLO)

  // Comentario del terapeuta — editable
  const [comentario, setComentario] = useState(tarea.comentarioTerapeuta ?? "")
  const [loading, setLoading]       = useState(false)
  const [guardado, setGuardado]     = useState(false)

  // Marca la tarea como revisada y guarda el comentario
  // TODO: llamar a actualizarTarea(tareaId, { estado: "revisada", comentarioTerapeuta: comentario })
  async function handleMarcarRevisada() {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      setTarea(prev => ({ ...prev, estado: "revisada", comentarioTerapeuta: comentario }))
      setGuardado(true)
      // TODO: PHP notifica al paciente que su tarea fue revisada
    } catch {
      alert("Error al guardar. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  // Solo guarda el comentario sin cambiar el estado
  async function handleGuardarComentario() {
    if (!comentario.trim()) return
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 600))
      setTarea(prev => ({ ...prev, comentarioTerapeuta: comentario }))
      setGuardado(true)
      setTimeout(() => setGuardado(false), 3000)
    } catch {
      alert("Error al guardar. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-3xl mx-auto p-6">

        {/* Botón volver */}
        <button
          onClick={() => navigate(`/psicologo/pacientes/${pacienteId}`)}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-dark transition-colors mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al perfil del paciente
        </button>

        {/* Header de la tarea */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-dark mb-1">{tarea.titulo}</h1>
              <p className="text-xs text-slate-400">
                Asignada el {new Date(tarea.fechaCreacion).toLocaleDateString("es-MX")}
                {tarea.fechaLimite && ` · Entrega: ${new Date(tarea.fechaLimite).toLocaleDateString("es-MX")}`}
              </p>
            </div>
            {/* Badge de estado */}
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium border capitalize flex-shrink-0 ${colorEstado(tarea.estado)}`}>
              {tarea.estado}
            </span>
          </div>

          {/* Descripción del estado */}
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {textoEstado(tarea.estado)}
          </p>
        </div>

        {/* Contenido de la tarea */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
          <h3 className="font-semibold text-dark mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Instrucciones de la tarea
          </h3>
          <p className="text-sm text-dark leading-relaxed">{tarea.contenido}</p>
        </div>

        {/* Entrega del paciente */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
          <h3 className="font-semibold text-dark mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Entrega del paciente
          </h3>

          {tarea.estado === "pendiente" ? (
            <div className="bg-background rounded-xl px-4 py-6 text-center">
              <p className="text-sm text-slate-400">El paciente aún no ha entregado esta tarea.</p>
            </div>
          ) : (
            <div>
              {tarea.fechaEntrega && (
                <p className="text-xs text-slate-400 mb-3">
                  Entregada el {new Date(tarea.fechaEntrega).toLocaleDateString("es-MX", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric"
                  })}
                </p>
              )}
              {/* Archivo adjunto del paciente */}
              {tarea.imagePath ? (
                <div className="flex items-center gap-3 bg-background rounded-xl p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-dark">Archivo adjunto</p>
                    <p className="text-xs text-slate-400">{tarea.imagePath}</p>
                  </div>
                  <button className="ml-auto text-xs text-primary hover:text-primary-hover font-medium">
                    Ver archivo
                  </button>
                </div>
              ) : (
                <div className="bg-background rounded-xl px-4 py-4">
                  <p className="text-sm text-slate-400">El paciente no adjuntó archivos en esta entrega.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comentario del terapeuta */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
          <h3 className="font-semibold text-dark mb-1 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Comentario para el paciente
          </h3>
          <p className="text-xs text-slate-400 mb-3">Este comentario será visible para el paciente.</p>

          <textarea
            value={comentario}
            onChange={e => {
              setComentario(e.target.value)
              setGuardado(false)
            }}
            placeholder="Escribe tu retroalimentación sobre esta tarea..."
            rows={4}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm mb-3"
          />

          {/* Indicador de guardado */}
          {guardado && (
            <p className="text-xs text-green-500 flex items-center gap-1 mb-3">
              ✓ Comentario guardado correctamente
            </p>
          )}

          <button
            onClick={handleGuardarComentario}
            disabled={loading || !comentario.trim()}
            className="w-full border border-primary text-primary hover:bg-primary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed py-2.5 rounded-xl transition-colors font-medium text-sm"
          >
            {loading ? "Guardando..." : "Guardar comentario"}
          </button>
        </div>

        {/* Botón marcar como revisada — solo si está entregada */}
        {tarea.estado === "entregada" && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-dark mb-1">Marcar como revisada</h3>
            <p className="text-sm text-slate-400 mb-4">
              Al marcar como revisada, el paciente recibirá una notificación indicando que su tarea fue revisada.
            </p>
            <button
              onClick={handleMarcarRevisada}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors"
            >
              {loading ? "Guardando..." : "✓ Marcar como revisada y notificar al paciente"}
            </button>
          </div>
        )}

        {/* Mensaje si ya está revisada */}
        {tarea.estado === "revisada" && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-5 text-center">
            <p className="text-green-600 font-medium text-sm">✓ Esta tarea ya fue marcada como revisada</p>
            <p className="text-green-500 text-xs mt-1">El paciente fue notificado.</p>
          </div>
        )}

      </div>
    </div>
  )
}
