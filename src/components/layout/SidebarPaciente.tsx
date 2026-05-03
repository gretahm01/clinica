// ===========================
// src/components/layout/SidebarPaciente.tsx
// ===========================
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import type { Cita, Tarea } from "../../types"

interface SidebarPacienteProps {
  citasTotales?: Cita[]
  tareasTotales?: Tarea[] 
  onNuevaCita?: () => void
  onAbrirCita?: (cita: Cita) => void 
  onAbrirTarea?: (tarea: Tarea) => void 
  proximaCita?: any // Añadido para que no marque error con la prop que le pasamos desde el calendario
}

export default function SidebarPaciente({
  citasTotales = [],
  tareasTotales = [],
  onNuevaCita = () => {},
  onAbrirCita = () => {},
  onAbrirTarea = () => {},
  proximaCita = null
}: SidebarPacienteProps) {
  const { usuario } = useAuth()
  const navigate = useNavigate()

  // --- CÁLCULO CITA MÁS PRÓXIMA ---
  const citaProx = proximaCita || (citasTotales.length > 0 
    ? citasTotales.reduce((prox, actual) => {
        const dProx = new Date(`${prox.fecha}T${prox.hora}`).getTime();
        const dAct  = new Date(`${actual.fecha}T${actual.hora}`).getTime();
        return dAct < dProx ? actual : prox;
      })
    : null);

  // --- CÁLCULO TAREA MÁS PRÓXIMA ---
  const proximaTarea = tareasTotales.length > 0 
    ? tareasTotales.reduce((prox, actual) => {
        if (!prox.fechaLimite) return actual;
        if (!actual.fechaLimite) return prox;
        const dProx = new Date(`${prox.fechaLimite}T23:59:59`).getTime();
        const dAct  = new Date(`${actual.fechaLimite}T23:59:59`).getTime();
        return dAct < dProx ? actual : prox;
      })
    : null;

  return (
    // FIX DE ALTURA: h-full y min-h-full aseguran que siempre cubra toda la altura de la pantalla
    <aside className="w-80 bg-white border-r border-slate-100 flex flex-col p-5 gap-6 flex-shrink-0 overflow-y-auto h-full min-h-full custom-scrollbar">
      <div>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Bienvenido de vuelta</p>
        <h2 className="text-xl font-bold text-dark capitalize mb-4">{usuario?.nombre ?? "Paciente"} 👋</h2>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => navigate("/paciente/dashboard")}>
            <p className="text-2xl font-bold text-dark">{citasTotales.length}</p>
            <p className="text-xs text-slate-400 mt-0.5 font-bold uppercase tracking-wider">Citas</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => navigate("/paciente/tareas")}>
            <p className="text-2xl font-bold text-amber-500">{tareasTotales.length}</p>
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

      {/* SECCIÓN DE PRÓXIMOS EVENTOS */}
      <div className="flex flex-col gap-3">
        {/* BLOQUE CITA PRÓXIMA */}
        {citaProx ? (
          <div onClick={() => onAbrirCita(citaProx)} className="bg-dark rounded-2xl p-5 text-white shadow-md cursor-pointer hover:opacity-95 transition-all hover:scale-[1.02] group">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Próxima sesión</p>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${citaProx.estado === "confirmada" ? "bg-emerald-500 text-white" : "bg-orange-400 text-white"}`}>
                {citaProx.estado === "confirmada" ? "Confirmada" : "Por confirmar"}
              </span>
            </div>
            <p className="font-bold text-lg capitalize mb-1">{new Date(citaProx.fecha + "T12:00:00").toLocaleDateString("es-MX", { weekday: 'short', day: 'numeric', month: 'short' })}</p>
            <div className="flex items-center justify-between">
              <p className="text-primary-light text-sm font-medium">{citaProx.hora.slice(0, 5)} hrs</p>
              <p className="text-[10px] text-white/50 group-hover:text-white transition-colors">Ver Detalles →</p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl p-5 text-center border-2 border-dashed border-slate-200">
            <p className="text-sm text-slate-400 font-bold tracking-wide">Sin citas próximas</p>
          </div>
        )}

        {/* BLOQUE TAREA PRÓXIMA */}
        {tareasTotales.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl p-5 text-center border-2 border-dashed border-slate-200 mt-2">
            <p className="text-sm text-slate-400 font-bold tracking-wide">No hay tareas pendientes por entregar.</p>
          </div>
        ) : (
          <div onClick={() => onAbrirTarea(proximaTarea!)} className="mt-2 bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm cursor-pointer hover:bg-amber-100 transition-all hover:scale-[1.02] group relative">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-amber-600 uppercase tracking-widest font-bold">Tarea Pendiente</p>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            </div>
            <p className="font-bold text-dark text-sm mb-1 line-clamp-1">{proximaTarea?.titulo}</p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-amber-200/50">
              <p className="text-amber-700 text-xs font-medium">
                {proximaTarea?.fechaLimite ? `Límite: ${new Date(proximaTarea.fechaLimite + "T12:00:00").toLocaleDateString("es-MX", { day: 'numeric', month: 'short' })}` : 'Sin límite'}
              </p>
              <p className="text-[10px] font-bold text-amber-600 group-hover:underline">Entregar →</p>
            </div>
            
            {/* SUB-TARJETITA DE TAREAS EXTRA */}
            {tareasTotales.length > 1 && (
              <div className="mt-4 bg-amber-100/70 border border-amber-200/60 rounded-lg p-2 text-center flex items-center justify-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wide">
                  Tienes {tareasTotales.length - 1} más por entregar
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}