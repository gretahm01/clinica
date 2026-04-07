// ===========================
// src/pages/paciente/DetalleTareaPaciente.tsx
// ===========================
// Página de detalle de una tarea vista por el paciente.
// Se accede desde el dashboard al picarle a una tarea.
// Ruta: /paciente/tareas/:tareaId
//
// El paciente puede:
//   - Ver las instrucciones completas de la tarea
//   - Escribir un texto de entrega
//   - Adjuntar un archivo (image_path en la BD)
//   - Ver el comentario del terapeuta si ya fue revisada
//
// Cuando PHP esté listo:
//   - getTarea(tareaId) → reemplaza TAREAS_MOCK
//   - entregarTarea(tareaId, { texto, archivo }) → sube la entrega
// ===========================

import { useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import type { Tarea } from "../../types"
import NavbarPaciente from "../../components/layout/NavbarPaciente"

// ===========================
// DATOS MOCK
// Reemplazar con getTarea(tareaId) cuando PHP esté listo
// ===========================
const TAREAS_MOCK: Tarea[] = [
  {
    id: 1,
    pacienteId: 1,
    profesionalId: 1,
    titulo: "Diario de emociones",
    contenido: "Escribe cada noche cómo te sentiste durante el día y qué lo provocó. Intenta identificar al menos 3 emociones distintas por semana. Puedes usar la siguiente estructura:\n\n• ¿Qué emoción sentí?\n• ¿Qué la provocó?\n• ¿Cómo reaccioné?\n• ¿Cómo me siento ahora al recordarlo?",
    fechaLimite: "2026-04-01",
    estado: "pendiente",
    fechaCreacion: "2026-03-20",
  },
  {
    id: 2,
    pacienteId: 1,
    profesionalId: 1,
    titulo: "Ejercicios de respiración",
    contenido: "Practica la respiración diafragmática 5 minutos cada mañana. Registra cómo te sientes antes y después de cada sesión.",
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
    contenido: "Haz una lista de 10 actividades que te den bienestar y realiza al menos 3 esta semana. Al final de la semana escribe cómo te sentiste al realizarlas.",
    fechaLimite: "2026-03-15",
    estado: "revisada",
    comentarioTerapeuta: "Excelente trabajo. Me alegra ver que incluiste actividades sociales en tu lista. Para la próxima semana intenta agregar al menos una actividad nueva que no hayas probado antes.",
    fechaCreacion: "2026-03-08",
    fechaEntrega: "2026-03-14",
  },
]

// Color del badge según el estado
function colorEstado(estado: string) {
  switch (estado) {
    case "revisada":  return "bg-green-50 text-green-600 border-green-100"
    case "entregada": return "bg-blue-50 text-blue-600 border-blue-100"
    default:          return "bg-yellow-50 text-yellow-600 border-yellow-100"
  }
}

// Etiqueta legible del estado
function etiquetaEstado(estado: string) {
  switch (estado) {
    case "revisada":  return "Revisada ✓"
    case "entregada": return "Entregada — pendiente de revisión"
    default:          return "Pendiente de entrega"
  }
}

// ===========================
// COMPONENTE PRINCIPAL
// ===========================
export default function DetalleTareaPaciente() {
  const { tareaId } = useParams()
  const navigate    = useNavigate()

  const tareaEncontrada = TAREAS_MOCK.find(t => t.id === Number(tareaId))
  const [tarea, setTarea]         = useState<Tarea | null>(tareaEncontrada ?? null)
  const [textoEntrega, setTextoEntrega] = useState("")
  const [archivo, setArchivo]     = useState<File | null>(null)
  const inputArchivoRef           = useRef<HTMLInputElement>(null)
  const [loading, setLoading]     = useState(false)
  const [entregado, setEntregado] = useState(false)
  const [error, setError]         = useState("")

  if (!tarea) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-dark font-medium mb-2">Tarea no encontrada</p>
          <button onClick={() => navigate("/paciente/dashboard")} className="text-sm text-primary hover:text-primary-hover">
            Volver al dashboard
          </button>
        </div>
      </div>
    )
  }

  // Entrega la tarea — TODO: llamar a entregarTarea() cuando PHP esté listo
  async function handleEntregar() {
    if (!textoEntrega.trim() && !archivo) {
      return setError("Escribe algo o adjunta un archivo para entregar la tarea.")
    }
    setLoading(true)
    setError("")
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      setTarea(prev => prev ? { ...prev, estado: "entregada", fechaEntrega: new Date().toISOString().split("T")[0] } : null)
      setEntregado(true)
    } catch {
      setError("Error al entregar la tarea. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">

      {/* NavbarPaciente reutilizable — mismo en todas las páginas del paciente */}
      <NavbarPaciente />

      <div className="max-w-2xl mx-auto p-6">

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

        {/* HEADER DE LA TAREA */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-2">Tarea asignada</p>
              <h1 className="text-2xl font-bold text-dark mb-1">{tarea.titulo}</h1>
              <p className="text-xs text-slate-400">
                Asignada el {new Date(tarea.fechaCreacion).toLocaleDateString("es-MX")}
                {tarea.fechaLimite && (
                  <> · Entrega: <span className="font-medium text-dark">
                    {new Date(tarea.fechaLimite + "T12:00:00").toLocaleDateString("es-MX")}
                  </span></>
                )}
              </p>
            </div>
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium border flex-shrink-0 ${colorEstado(tarea.estado)}`}>
              {etiquetaEstado(tarea.estado)}
            </span>
          </div>
        </div>

        {/* INSTRUCCIONES */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
          <h3 className="font-semibold text-dark mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Instrucciones
          </h3>
          {/* whitespace-pre-line respeta los saltos de línea del texto */}
          <p className="text-sm text-dark leading-relaxed whitespace-pre-line">
            {tarea.contenido ?? "No hay instrucciones adicionales."}
          </p>
        </div>

        {/* COMENTARIO DEL TERAPEUTA — solo si está revisada */}
        {tarea.estado === "revisada" && tarea.comentarioTerapeuta && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
            <h3 className="font-semibold text-dark mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Comentario de tu psicólogo
            </h3>
            <div className="bg-background rounded-xl p-4 border-l-4 border-primary">
              <p className="text-sm text-dark leading-relaxed">{tarea.comentarioTerapeuta}</p>
            </div>
          </div>
        )}

        {/* FORMULARIO DE ENTREGA — solo si está pendiente */}
        {tarea.estado === "pendiente" && !entregado && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-dark mb-1">Entregar tarea</h3>
            <p className="text-xs text-slate-400 mb-4">Escribe tus respuestas y/o adjunta un archivo.</p>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Tu respuesta</label>
                <textarea
                  value={textoEntrega}
                  onChange={(e) => { setTextoEntrega(e.target.value); setError("") }}
                  placeholder="Escribe aquí tu respuesta, reflexiones o lo que realizaste..."
                  rows={5}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                />
              </div>

              {/* Área de archivo adjunto — se guarda en task.image_path en la BD */}
              <div>
                <label className="block text-sm font-medium text-dark mb-1">
                  Archivo adjunto <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <div
                  onClick={() => inputArchivoRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-200 rounded-xl px-4 py-4 text-center cursor-pointer hover:border-primary transition-colors"
                >
                  {archivo ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="text-sm text-dark truncate max-w-xs">{archivo.name}</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setArchivo(null) }}
                        className="text-slate-400 hover:text-red-500 text-xs ml-2 flex-shrink-0"
                      >
                        Quitar
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-slate-400">Haz clic para adjuntar un archivo</p>
                      <p className="text-xs text-slate-300 mt-1">Imagen, PDF, documento...</p>
                    </div>
                  )}
                </div>
                <input ref={inputArchivoRef} type="file" className="hidden" onChange={(e) => setArchivo(e.target.files?.[0] || null)} />
              </div>
            </div>

            <button
              onClick={handleEntregar}
              disabled={loading}
              className="w-full mt-6 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors"
            >
              {loading ? "Enviando entrega..." : "Entregar tarea"}
            </button>
          </div>
        )}

        {/* Pantalla de éxito al entregar en esta sesión */}
        {entregado && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-700 font-semibold mb-1">¡Tarea entregada!</p>
            <p className="text-green-600 text-sm">Tu psicólogo la revisará pronto y recibirás su comentario.</p>
          </div>
        )}

        {/* Ya estaba entregada antes de entrar */}
        {tarea.estado === "entregada" && !entregado && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-center">
            <p className="text-blue-600 font-medium text-sm">
              Ya entregaste esta tarea el {tarea.fechaEntrega ? new Date(tarea.fechaEntrega).toLocaleDateString("es-MX") : ""}
            </p>
            <p className="text-blue-500 text-xs mt-1">Tu psicólogo la revisará pronto.</p>
          </div>
        )}

        {/* Ya fue revisada */}
        {tarea.estado === "revisada" && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-5 text-center">
            <p className="text-green-600 font-medium text-sm">✓ Esta tarea fue revisada por tu psicólogo</p>
            {tarea.fechaEntrega && (
              <p className="text-green-500 text-xs mt-1">
                Entregada el {new Date(tarea.fechaEntrega).toLocaleDateString("es-MX")}
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  )
}