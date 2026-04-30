// ===========================
// src/pages/paciente/ListaTareasPaciente.tsx
// ===========================

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import NavbarPaciente from "../../components/layout/NavbarPaciente"
import type { Tarea } from "../../types"
import { getTareasPorPaciente } from "../../services/api"
import { useAuth } from "../../hooks/useAuth"

export default function ListaTareasPaciente() {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const idCorrecto = (usuario as any)?.pacienteId || (usuario as any)?.id || usuario?.userId;
    if (idCorrecto) {
      cargarMisTareas(idCorrecto)
    } else {
      const timer = setTimeout(() => {
        setCargando(false)
        setError("No se pudo identificar tu sesión.")
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [usuario])

  async function cargarMisTareas(id: number | string) {
    setCargando(true)
    setError("")
    try {
      const res = await getTareasPorPaciente(Number(id))
      if (res.success) {
        setTareas(Array.isArray(res.data) ? res.data : [])
      } else {
        setError(res.message || "No se pudieron cargar tus tareas.")
      }
    } catch (e) {
      setError("Error de conexión.")
    } finally {
      setCargando(false)
    }
  }

  // Agrupar tareas por estado
  const porEntregar = tareas.filter(t => (t.estado || "").toLowerCase().trim() === "pendiente")
  const entregadas  = tareas.filter(t => (t.estado || "").toLowerCase().trim() === "entregada")
  const revisadas   = tareas.filter(t => (t.estado || "").toLowerCase().trim() === "revisada")

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

  return (
    <div className="min-h-screen bg-background">
      <NavbarPaciente />

      <div className="max-w-[1400px] mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark">Mis Tareas</h1>
          <p className="text-slate-500 font-medium">Organización de tus actividades terapéuticas.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 font-medium">
            {error}
          </div>
        )}

        {/* CONTENEDOR DE LAS 3 COLUMNAS/TARJETAS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* 1. POR ENTREGAR */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                <h2 className="font-bold text-dark uppercase tracking-wider text-sm">1. Por Entregar</h2>
              </div>
              <span className="bg-amber-100 text-amber-600 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                {porEntregar.length}
              </span>
            </div>
            
            <div className="space-y-4">
              {porEntregar.length === 0 ? (
                <EmptyState mensaje="No tienes tareas pendientes" color="amber" />
              ) : (
                porEntregar.map(t => <CardTarea key={t.id} tarea={t} navigate={navigate} />)
              )}
            </div>
          </section>

          {/* 2. ENTREGADAS */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <h2 className="font-bold text-dark uppercase tracking-wider text-sm">2. Entregadas</h2>
              </div>
              <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                {entregadas.length}
              </span>
            </div>

            <div className="space-y-4">
              {entregadas.length === 0 ? (
                <EmptyState mensaje="No hay tareas en revisión" color="blue" />
              ) : (
                entregadas.map(t => <CardTarea key={t.id} tarea={t} navigate={navigate} />)
              )}
            </div>
          </section>

          {/* 3. REVISADAS */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <h2 className="font-bold text-dark uppercase tracking-wider text-sm">3. Revisadas</h2>
              </div>
              <span className="bg-emerald-100 text-emerald-600 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                {revisadas.length}
              </span>
            </div>

            <div className="space-y-4">
              {revisadas.length === 0 ? (
                <EmptyState mensaje="Aún no tienes tareas revisadas" color="emerald" />
              ) : (
                revisadas.map(t => <CardTarea key={t.id} tarea={t} navigate={navigate} />)
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}

// Sub-componente para la tarjeta de cada tarea
function CardTarea({ tarea, navigate }: { tarea: Tarea, navigate: any }) {
  const esPendiente = (tarea.estado || "").toLowerCase().trim() === "pendiente";

  return (
    <div 
      onClick={() => navigate(`/paciente/tareas/${tarea.id}`)}
      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group"
    >
      <h3 className="font-bold text-dark group-hover:text-primary transition-colors mb-2 line-clamp-1">
        {tarea.titulo}
      </h3>
      <p className="text-xs text-slate-500 line-clamp-2 mb-4 font-medium leading-relaxed">
        {tarea.contenido || "Sin descripción adicional."}
      </p>
      
      <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
          </svg>
          {esPendiente ? (
            <span>Límite: {tarea.fechaLimite ? new Date(tarea.fechaLimite + "T12:00:00").toLocaleDateString("es-MX", {day:'numeric', month:'short'}) : '--'}</span>
          ) : (
            <span>Entregado: {tarea.fechaEntrega ? new Date(tarea.fechaEntrega).toLocaleDateString("es-MX", {day:'numeric', month:'short'}) : '--'}</span>
          )}
        </div>
        <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
}

// Sub-componente para cuando una columna está vacía
function EmptyState({ mensaje, color }: { mensaje: string, color: string }) {
  const colors: any = {
    amber: "bg-amber-50 text-amber-400",
    blue: "bg-blue-50 text-blue-400",
    emerald: "bg-emerald-50 text-emerald-400"
  }
  return (
    <div className={`rounded-2xl border-2 border-dashed border-slate-100 p-8 text-center ${colors[color] || "bg-slate-50 text-slate-400"}`}>
      <p className="text-xs font-bold uppercase tracking-widest">{mensaje}</p>
    </div>
  )
}