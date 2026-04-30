// ===========================
// src/components/layout/SidebarPaciente.tsx
// ===========================
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import type { Cita } from "../../types"

interface SidebarPacienteProps {
  citasProximasCount: number
  tareasPendientesCount: number
  proximaCita: Cita | null
  notificaciones: any[]
  onNuevaCita: () => void
  onMarcarLeidas: () => void
  seccionActiva?: "citas" | "tareas"
  setSeccionActiva?: (seccion: "citas" | "tareas") => void
  mostrarNavegacionInterna?: boolean
}

function iconoNotificacion(tipo: string) {
  switch (tipo) {
    case "nueva_tarea":
      return (
        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
        </div>
      )
    default:
      return (
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </div>
      )
  }
}

function calcularTiempo(fechaStr: string) {
  if (!fechaStr) return "Hace un momento"
  const fecha = new Date(fechaStr)
  const ahora = new Date()
  const segundos = Math.floor((ahora.getTime() - fecha.getTime()) / 1000)
  if (segundos < 60) return "Hace un momento"
  const minutos = Math.floor(segundos / 60)
  if (minutos < 60) return `Hace ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `Hace ${horas} horas`
  const dias = Math.floor(horas / 24)
  if (dias === 1) return "Ayer"
  return `Hace ${dias} días`
}

export default function SidebarPaciente({
  citasProximasCount,
  tareasPendientesCount,
  proximaCita,
  notificaciones,
  onNuevaCita,
  onMarcarLeidas,
  seccionActiva,
  setSeccionActiva,
  mostrarNavegacionInterna = false
}: SidebarPacienteProps) {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const noLeidas = notificaciones.filter(n => !n.leida).length

  return (
    <aside className="w-80 bg-white border-r border-slate-100 flex flex-col p-5 gap-6 flex-shrink-0 overflow-y-auto h-full">
      <div>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Bienvenido de vuelta</p>
        <h2 className="text-xl font-bold text-dark capitalize mb-4">{usuario?.nombre ?? "Paciente"} 👋</h2>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
            <p className="text-2xl font-bold text-dark">{citasProximasCount}</p>
            <p className="text-xs text-slate-400 mt-0.5 font-bold uppercase tracking-wider">Citas</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
            <p className="text-2xl font-bold text-amber-500">{tareasPendientesCount}</p>
            <p className="text-xs text-slate-400 mt-0.5 font-bold uppercase tracking-wider">Tareas</p>
          </div>
        </div>
      </div>

      <button 
        onClick={onNuevaCita} 
        className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 border border-primary/20 shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
        Agendar Nueva Cita
      </button>

      {mostrarNavegacionInterna && setSeccionActiva && (
        <nav className="flex flex-col gap-1 -mt-2">
          <button onClick={() => setSeccionActiva("citas")} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left ${seccionActiva === "citas" ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}>
            <span>Mis Citas</span>
          </button>
          <button onClick={() => setSeccionActiva("tareas")} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left ${seccionActiva === "tareas" ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}>
            <span>Mis Tareas</span>
          </button>
        </nav>
      )}

      <div>
        {proximaCita ? (
          <div onClick={() => navigate(`/paciente/dashboard`)} className="bg-dark rounded-2xl p-5 text-white shadow-md cursor-pointer hover:opacity-95 transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Próxima sesión</p>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${proximaCita.estado === "confirmada" ? "bg-emerald-500 text-white" : "bg-orange-400 text-white"}`}>
                {proximaCita.estado === "confirmada" ? "Confirmada" : "Por confirmar"}
              </span>
            </div>
            <p className="font-bold text-lg capitalize mb-1">{new Date(proximaCita.fecha + "T12:00:00").toLocaleDateString("es-MX", { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <p className="text-primary-light text-sm font-medium">{proximaCita.hora.slice(0, 5)} hrs</p>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl p-5 text-center border-2 border-dashed border-slate-200">
            <p className="text-sm text-slate-400 font-bold italic tracking-wide">Sin citas próximas</p>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col min-h-0 border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-dark text-sm">Notificaciones</h3>
            {noLeidas > 0 && <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{noLeidas}</span>}
          </div>
          {noLeidas > 0 && (
            <button onClick={onMarcarLeidas} className="text-[11px] text-primary hover:text-primary-hover font-bold transition-colors">Marcar leídas</button>
          )}
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto pr-1">
          {notificaciones.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4 italic">No tienes notificaciones recientes.</p>
          ) : (
            notificaciones.map((n) => (
              <div key={n.id} className={`p-3 rounded-xl flex gap-3 transition-all ${n.leida ? "opacity-50" : "bg-slate-50 border border-slate-100"}`}>
                {iconoNotificacion(n.tipo)}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-dark leading-snug">{n.mensaje}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">{calcularTiempo(n.fecha)}</p>
                </div>
                {!n.leida && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>}
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  )
}