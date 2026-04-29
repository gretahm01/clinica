// ===========================
// src/pages/psicologo/DetalleTarea.tsx
// ===========================

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../../components/layout/Navbar"
import type { Tarea } from "../../types"
import { getTarea, actualizarTarea } from "../../services/api"

function colorEstado(estado: string) {
  switch (estado) {
    case "revisada":  return "bg-green-50 text-green-600 border-green-100"
    case "entregada": return "bg-blue-50 text-blue-600 border-blue-100"
    default:          return "bg-yellow-50 text-yellow-600 border-yellow-100"
  }
}

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

  const [tarea, setTarea]       = useState<Tarea | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState("")
  const [comentario, setComentario] = useState("")
  const [loading, setLoading]   = useState(false)
  const [guardado, setGuardado] = useState(false)

async function cargar() {
    if (!tareaId) return
    try {
      setCargando(true)
      const res = await getTarea(Number(tareaId))
      if (res.success) {
        setTarea(res.data)
        setComentario(res.data.comentarioTerapeuta ?? "")
      } else {
        setError(res.message ?? "No se pudo cargar la tarea")
      }
    } catch {
      setError("Error de conexión con el servidor")
    } finally {
      setCargando(false)
    }
  }

  // useEffect corregido
  useEffect(() => {
    cargar()
  }, [tareaId])

  async function handleMarcarRevisada() {
    if (!tarea) return
    setLoading(true)
    try {
      const res = await actualizarTarea(tarea.id, {
        estado: "revisada",
        comentarioTerapeuta: comentario,
      })
      if (res.success) {
        setTarea(prev => prev ? { ...prev, estado: "revisada", comentarioTerapeuta: comentario } : prev)
        setGuardado(true)
      }
    } catch {
      alert("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  async function handleGuardarComentario() {
    if (!tarea || !comentario.trim()) return
    setLoading(true)
    try {
      const res = await actualizarTarea(tarea.id, {
        comentarioTerapeuta: comentario,
      })
      if (res.success) {
        setTarea(prev => prev ? { ...prev, comentarioTerapeuta: comentario } : prev)
        setGuardado(true)
        setTimeout(() => setGuardado(false), 3000)
      } else {
        alert(res.message ?? "Error al guardar comentario")
      }
    } catch {
      alert("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !tarea) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center py-32">
          <p className="text-red-500 font-medium">{error || "Tarea no encontrada"}</p>
          <button
            onClick={() => navigate(`/psicologo/pacientes/${pacienteId}`)}
            className="mt-3 text-sm text-primary hover:underline"
          >
            Volver al perfil del paciente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-3xl mx-auto p-6">

        <button
          onClick={() => navigate(`/psicologo/pacientes/${pacienteId}`)}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-dark transition-colors mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al perfil del paciente
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-dark mb-1">{tarea.titulo}</h1>
              <p className="text-xs text-slate-400">
                Asignada el {new Date(tarea.fechaCreacion).toLocaleDateString("es-MX")}
                {tarea.fechaLimite && ` · Entrega: ${new Date(tarea.fechaLimite + "T12:00:00").toLocaleDateString("es-MX")}`}
              </p>
            </div>
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium border capitalize flex-shrink-0 ${colorEstado(tarea.estado)}`}>
              {tarea.estado}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {textoEstado(tarea.estado)}
          </p>
        </div>

        {/* Contenido */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
          <h3 className="font-semibold text-dark mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Instrucciones de la tarea
          </h3>
          <p className="text-sm text-dark leading-relaxed">{tarea.contenido || "Sin instrucciones registradas"}</p>
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
                  <p className="text-sm text-slate-400">El paciente no adjuntó archivos.</p>
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
            onChange={e => { setComentario(e.target.value); setGuardado(false) }}
            placeholder="Escribe tu retroalimentación sobre esta tarea..."
            rows={4}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm mb-3"
          />
          {guardado && (
            <p className="text-xs text-green-500 flex items-center gap-1 mb-3">✓ Comentario guardado</p>
          )}
          <button
            onClick={handleGuardarComentario}
            disabled={loading || !comentario.trim()}
            className="w-full border border-primary text-primary hover:bg-primary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed py-2.5 rounded-xl transition-colors font-medium text-sm"
          >
            {loading ? "Guardando..." : "Guardar comentario"}
          </button>
        </div>

        {/* Marcar como revisada */}
        {tarea.estado === "entregada" && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-dark mb-1">Marcar como revisada</h3>
            <p className="text-sm text-slate-400 mb-4">
              Al marcar como revisada el paciente sabrá que su tarea fue revisada.
            </p>
            <button
              onClick={handleMarcarRevisada}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors"
            >
              {loading ? "Guardando..." : "✓ Marcar como revisada"}
            </button>
          </div>
        )}

        {tarea.estado === "revisada" && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-5 text-center">
            <p className="text-green-600 font-medium text-sm">✓ Esta tarea ya fue marcada como revisada</p>
          </div>
        )}

      </div>
    </div>
  )
}