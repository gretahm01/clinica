// ===========================
// src/pages/psicologo/DetalleTarea.tsx
// ===========================

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../../components/layout/Navbar"
import type { Tarea } from "../../types"
// CAMBIO IMPORTANTE: Importamos getPaciente
import { getTarea, actualizarTarea, getPaciente } from "../../services/api"

function colorEstado(estado: string) {
  switch (estado) {
    case "revisada":  return "bg-emerald-50 text-emerald-600 border border-emerald-100"
    case "entregada": return "bg-blue-50 text-blue-600 border border-blue-100"
    default:          return "bg-amber-50 text-amber-600 border border-amber-100"
  }
}

function textoEstado(estado: string) {
  switch (estado) {
    case "revisada":  return "Ya revisada por ti"
    case "entregada": return "Entregada por el paciente — Pendiente de tu revisión"
    default:          return "El paciente aún no ha entregado esta tarea"
  }
}

export default function DetalleTarea() {
  const { pacienteId, tareaId } = useParams()
  const navigate = useNavigate()

  const [tarea, setTarea]       = useState<Tarea | null>(null)
  const [pacienteNombre, setPacienteNombre] = useState("") // NUEVO: Estado para el nombre
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState("")
  const [comentario, setComentario] = useState("")
  const [loading, setLoading]   = useState(false)
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    async function cargar() {
      if (!tareaId || !pacienteId) return
      try {
        setCargando(true)
        // NUEVO: Hacemos ambas peticiones al mismo tiempo
        const [resTarea, resPaciente] = await Promise.all([
          getTarea(Number(tareaId)),
          getPaciente(Number(pacienteId))
        ])

        if (resTarea.success) {
          setTarea(resTarea.data)
          setComentario(resTarea.data.comentarioTerapeuta ?? "")
        } else {
          setError(resTarea.message ?? "No se pudo cargar la tarea")
        }

        if (resPaciente.success && resPaciente.data) {
          setPacienteNombre(`${resPaciente.data.nombre} ${resPaciente.data.apellido}`)
        }

      } catch {
        setError("Error de conexión con el servidor")
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [tareaId, pacienteId])

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
        setTimeout(() => setGuardado(false), 3000)
      } else {
        alert(res.message || "Error al intentar marcar la tarea como revisada");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const mensaje = err.response?.data?.message || "Error crítico al comunicar con la base de datos";
      alert("Error: " + mensaje);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const mensaje = err.response?.data?.message || "Error al guardar el comentario";
      alert("Error: " + mensaje);
    } finally {
      setLoading(false)
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !tarea) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="text-center py-32">
          <p className="text-red-500 font-medium">{error || "Tarea no encontrada"}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-3 text-sm text-primary hover:underline font-medium"
          >
            Regresar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="max-w-3xl mx-auto p-6 w-full">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-dark transition-colors mb-6 font-medium"
        >
          ← Regresar
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5 border border-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-dark mb-1">{tarea.titulo}</h1>
              
              {/* NUEVO: Mostrar el nombre del paciente */}
              {pacienteNombre && (
                <p className="text-sm font-bold text-primary mb-3 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {pacienteNombre}
                </p>
              )}

              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {tarea.fechaCreacion ? `Asignada el ${new Date(tarea.fechaCreacion).toLocaleDateString("es-MX", { day: 'numeric', month: 'short', year: 'numeric'})}` : 'Fecha de asignación desconocida'}
                {tarea.fechaLimite && ` · Límite: ${new Date(tarea.fechaLimite + "T12:00:00").toLocaleDateString("es-MX", { day: 'numeric', month: 'short', year: 'numeric'})}`}
              </p>
            </div>
            <span className={`text-[10px] px-2.5 py-1.5 rounded-md font-bold uppercase tracking-wider flex-shrink-0 ${colorEstado(tarea.estado || 'pendiente')}`}>
              {tarea.estado}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-4 flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {textoEstado(tarea.estado || 'pendiente')}
          </p>
        </div>

        {/* Contenido / Instrucciones */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5 border border-slate-100">
          <h3 className="font-bold text-dark mb-3 flex items-center gap-2 border-b border-slate-100 pb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Instrucciones de la tarea
          </h3>
          <p className="text-sm text-dark leading-relaxed whitespace-pre-wrap mb-4">
            {tarea.contenido || "Sin instrucciones registradas"}
          </p>

          {/* Mostrar Material de Apoyo (El archivo que subió el psicólogo) */}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(tarea as any).materialApoyo && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 px-4 py-3 rounded-xl w-fit">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
              </div>
              <div>
                <p className="text-xs font-bold text-blue-800">Material de apoyo adjunto</p>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <button onClick={() => window.open((tarea as any).materialApoyo, '_blank')} className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium">
                  Hacer clic para ver
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Entrega del paciente (Texto y Archivo) */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5 border border-slate-100">
          <h3 className="font-bold text-dark mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Entrega del paciente
          </h3>
          
          {tarea.estado === "pendiente" ? (
            <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-8 text-center">
              <p className="text-sm text-slate-400 font-medium">El paciente aún no ha entregado esta tarea.</p>
            </div>
          ) : (
            <div>
              {tarea.fechaEntrega && (
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Entregada el {new Date(tarea.fechaEntrega).toLocaleDateString("es-MX", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric"
                  })}
                </p>
              )}

              {/* TEXTO DE RESPUESTA DEL PACIENTE */}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(tarea as any).respuestaPaciente && (
                <div className="mb-4 bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Comentarios del paciente</p>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <p className="text-sm text-dark whitespace-pre-wrap">{((tarea as any).respuestaPaciente)}</p>
                </div>
              )}

              {/* ARCHIVO ADJUNTO DEL PACIENTE */}
              {tarea.imagePath ? (
                <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-emerald-800 truncate">Archivo entregado</p>
                    <button onClick={() => window.open(tarea.imagePath, '_blank')} className="text-xs text-emerald-600 hover:underline truncate block w-full text-left">
                      {tarea.imagePath.split('/').pop()}
                    </button>
                  </div>
                  <button 
                    onClick={() => window.open(tarea.imagePath, '_blank')}
                    className="ml-auto text-xs bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 px-4 py-2 rounded-lg font-bold transition-colors"
                  >
                    Ver archivo
                  </button>
                </div>
              ) : (
                <p className="text-sm text-slate-400 font-medium italic mt-2">El paciente no adjuntó archivos extras.</p>
              )}
            </div>
          )}
        </div>

        {/* Comentario del terapeuta */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5 border border-slate-100">
          <h3 className="font-bold text-dark mb-1 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Comentario para el paciente
          </h3>
          <p className="text-xs text-slate-400 mb-4 font-medium">Este comentario será visible en el portal del paciente.</p>
          <textarea
            value={comentario}
            onChange={e => { setComentario(e.target.value); setGuardado(false) }}
            placeholder="Escribe tu retroalimentación sobre esta tarea..."
            rows={4}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm mb-3 bg-slate-50/50"
          />
          
          <div className="flex items-center justify-between">
            <div>
              {guardado && (
                <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Comentario guardado
                </p>
              )}
            </div>
            <button
              onClick={handleGuardarComentario}
              disabled={loading || !comentario.trim()}
              className="border border-primary text-primary hover:bg-primary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed px-6 py-2.5 rounded-xl transition-colors font-bold text-sm"
            >
              {loading ? "Guardando..." : "Guardar comentario"}
            </button>
          </div>
        </div>

        {/* Marcar como revisada */}
        {tarea.estado === "entregada" && (
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-dark mb-1">Marcar como revisada</h3>
              <p className="text-xs text-slate-400 font-medium">
                El paciente será notificado de que ya revisaste su entrega.
              </p>
            </div>
            <button
              onClick={handleMarcarRevisada}
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-sm flex items-center gap-2 flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              {loading ? "Procesando..." : "Marcar Revisada"}
            </button>
          </div>
        )}

        {tarea.estado === "revisada" && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 text-center shadow-sm mt-5">
            <p className="text-emerald-600 font-bold text-sm flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Esta tarea ya fue marcada como revisada
            </p>
          </div>
        )}

      </div>
    </div>
  )
}