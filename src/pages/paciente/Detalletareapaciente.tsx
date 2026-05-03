// ===========================
// src/pages/paciente/Detalletareapaciente.tsx
// ===========================

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import type { Tarea } from "../../types"
import NavbarPaciente from "../../components/layout/NavbarPaciente"
// CAMBIO IMPORTANTE: Importamos entregarTarea en lugar de actualizarTarea
import { getTarea, entregarTarea } from "../../services/api"

// Color del badge según el estado
function colorEstado(estado: string | undefined) {
  const e = (estado || "").toLowerCase().trim();
  switch (e) {
    case "revisada":  return "bg-green-50 text-green-600 border-green-100"
    case "entregada": return "bg-blue-50 text-blue-600 border-blue-100"
    default:          return "bg-yellow-50 text-yellow-600 border-yellow-100"
  }
}

// Etiqueta legible del estado
function etiquetaEstado(estado: string | undefined) {
  const e = (estado || "").toLowerCase().trim();
  switch (e) {
    case "revisada":  return "Revisada ✓"
    case "entregada": return "Entregada — pendiente de revisión"
    default:          return "Pendiente de entrega"
  }
}

export default function DetalleTareaPaciente() {
  const { tareaId } = useParams()
  const navigate    = useNavigate()

  const [tarea, setTarea]         = useState<Tarea | null>(null)
  const [cargando, setCargando]   = useState(true)
  
  const [textoEntrega, setTextoEntrega] = useState("")
  const [archivo, setArchivo]     = useState<File | null>(null)
  const inputArchivoRef           = useRef<HTMLInputElement>(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState("")

  // CARGAR LA TAREA REAL DESDE PHP
  useEffect(() => {
    if (tareaId) {
      cargarDetalle()
    }
  }, [tareaId])

  async function cargarDetalle() {
    setCargando(true)
    try {
      const res = await getTarea(Number(tareaId))
      if (res.success && res.data) {
        setTarea(res.data)
      } else {
        setError("No se pudo cargar la tarea.")
      }
    } catch (e) {
      setError("Error de conexión al cargar la tarea.")
    } finally {
      setCargando(false)
    }
  }

  // ENTREGAR LA TAREA A PHP
  async function handleEntregar() {
    if (!textoEntrega.trim() && !archivo) {
      return setError("Escribe algo o adjunta un archivo para entregar la tarea.")
    }
    
    setLoading(true)
    setError("")
    
    try {
      // AHORA SÍ usamos la función correcta que envía el texto y el archivo por FormData
      const res = await entregarTarea(Number(tareaId), textoEntrega, archivo)

      if (res.success) {
        // Actualizamos la vista localmente
        setTarea(prev => prev ? { ...prev, estado: "entregada", fechaEntrega: new Date().toISOString() } : null)
      } else {
        setError(res.message || "No se pudo entregar la tarea.")
      }
    } catch {
      setError("Error al entregar la tarea. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <NavbarPaciente />
        <div className="flex flex-1 items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!tarea) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <NavbarPaciente />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-dark font-medium mb-2">{error || "Tarea no encontrada"}</p>
            <button onClick={() => navigate("/paciente/tareas")} className="text-sm text-primary hover:text-primary-hover font-bold">
              Volver a mis tareas
            </button>
          </div>
        </div>
      </div>
    )
  }

  const estadoLimpio = (tarea.estado || "").toLowerCase().trim();

  return (
    <div className="min-h-screen bg-background">

      <NavbarPaciente />

      <div className="max-w-2xl mx-auto p-6">

        {/* Botón volver */}
        <button
          onClick={() => navigate("/paciente/tareas")}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-dark transition-colors mb-6 font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a mis tareas
        </button>

        {/* HEADER DE LA TAREA */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5 border border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold mb-2">Tarea asignada</p>
              <h1 className="text-2xl font-bold text-dark mb-1">{tarea.titulo}</h1>
              <p className="text-xs text-slate-500 font-medium">
                Asignada el {tarea.fechaCreacion ? new Date(tarea.fechaCreacion + "T12:00:00").toLocaleDateString("es-MX") : "Desconocida"}
                {tarea.fechaLimite && (
                  <> · Límite: <span className="font-bold text-dark">
                    {new Date(tarea.fechaLimite + "T12:00:00").toLocaleDateString("es-MX")}
                  </span></>
                )}
              </p>
            </div>
            <span className={`text-[10px] px-3 py-1.5 rounded-md font-bold uppercase tracking-wider border flex-shrink-0 w-fit ${colorEstado(tarea.estado)}`}>
              {etiquetaEstado(tarea.estado)}
            </span>
          </div>
        </div>

        {/* INSTRUCCIONES */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5 border border-slate-100">
          <h3 className="font-bold text-dark mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Instrucciones
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line font-medium mb-4">
            {tarea.contenido ?? "No hay instrucciones adicionales."}
          </p>

          {/* Mostrar material de apoyo del psicólogo si existe */}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(tarea as any).materialApoyo && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 px-4 py-3 rounded-xl w-fit">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
              </div>
              <div>
                <p className="text-xs font-bold text-blue-800">Tu psicólogo adjuntó un archivo</p>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <button onClick={() => window.open((tarea as any).materialApoyo, '_blank')} className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium">
                  Hacer clic para descargar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* COMENTARIO DEL TERAPEUTA — solo si está revisada */}
        {estadoLimpio === "revisada" && tarea.comentarioTerapeuta && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-5 border border-slate-100">
            <h3 className="font-bold text-dark mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Comentario de tu psicólogo
            </h3>
            <div className="bg-green-50/50 rounded-xl p-4 border-l-4 border-green-500">
              <p className="text-sm text-slate-700 leading-relaxed font-medium">{tarea.comentarioTerapeuta}</p>
            </div>
          </div>
        )}

        {/* FORMULARIO DE ENTREGA — solo si está pendiente */}
        {estadoLimpio === "pendiente" && (
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
            <h3 className="font-bold text-dark mb-1">Entregar tarea</h3>
            <p className="text-xs text-slate-400 mb-4 font-medium">Escribe tus respuestas y/o adjunta un archivo de evidencia.</p>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm font-medium px-4 py-3 rounded-xl mb-4 border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-dark mb-2">Tu respuesta</label>
                <textarea
                  value={textoEntrega}
                  onChange={(e) => { setTextoEntrega(e.target.value); setError("") }}
                  placeholder="Escribe aquí tu respuesta, reflexiones o lo que realizaste..."
                  rows={5}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm bg-slate-50"
                />
              </div>

              {/* Área de archivo adjunto */}
              <div>
                <label className="block text-sm font-bold text-dark mb-2">
                  Archivo adjunto <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <div
                  onClick={() => inputArchivoRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-200 bg-slate-50 rounded-xl px-4 py-4 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  {archivo ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="text-sm font-bold text-dark truncate max-w-xs">{archivo.name}</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setArchivo(null) }}
                        className="text-slate-400 hover:text-red-500 font-bold text-xs ml-2 flex-shrink-0 px-2 py-1 rounded hover:bg-red-50"
                      >
                        Quitar
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-bold text-slate-500">Haz clic para adjuntar un archivo</p>
                      <p className="text-xs font-medium text-slate-400 mt-1">Imagen, PDF, documento...</p>
                    </div>
                  )}
                </div>
                <input ref={inputArchivoRef} type="file" className="hidden" onChange={(e) => setArchivo(e.target.files?.[0] || null)} />
              </div>
            </div>

            <button
              onClick={handleEntregar}
              disabled={loading}
              className="w-full mt-6 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm"
            >
              {loading ? "Enviando entrega..." : "Entregar tarea"}
            </button>
          </div>
        )}

        {/* Pantalla cuando YA ESTÁ ENTREGADA / REVISADA */}
        {(estadoLimpio === "entregada" || estadoLimpio === "revisada") && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-blue-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-blue-700 font-bold mb-1 text-lg">
              {estadoLimpio === "revisada" ? "Tarea completada" : "¡Tarea entregada!"}
            </p>
            <p className="text-blue-600/80 text-sm font-medium px-4">
              {estadoLimpio === "revisada" 
                ? "Esta tarea ya fue revisada por tu psicólogo." 
                : "Tu psicólogo la revisará pronto y recibirás su comentario."}
            </p>
          </div>
        )}

      </div>
    </div>
  )
}