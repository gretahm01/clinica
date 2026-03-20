// ===========================
// src/components/layout/Sidebar.tsx
// ===========================
// Panel izquierdo del dashboard del psicólogo.
// Muestra estadísticas rápidas, botón de nueva cita
// y la lista de citas próximas del día.
// ===========================

import { useNavigate } from "react-router-dom"

// Definimos el tipo de los props que recibe este componente.
// Props son datos que el componente padre le pasa al hijo.
// En este caso, el Dashboard le pasará las citas al Sidebar.
interface CitaResumen {
id: number
pacienteNombre: string
hora: string
tipo: string
}

interface SidebarProps {
citasHoy: number
citasSemana: number
citasPendientes: number
proximasCitas: CitaResumen[]
  onNuevaCita: () => void  // función que se ejecuta al presionar "+ Nueva Cita"
}

export default function Sidebar({
citasHoy,
citasSemana,
citasPendientes,
proximasCitas,
onNuevaCita
}: SidebarProps) {

return (
    <aside className="w-72 min-h-screen bg-background border-r border-slate-200 p-4 flex flex-col gap-4">

      {/* Tarjetas de estadísticas */}
    <div className="flex flex-col gap-3">

        <div className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm">
        <div className="bg-background rounded-lg p-2 text-lg">📅</div>
        <div>
            <p className="text-2xl font-bold text-dark">{citasHoy}</p>
            <p className="text-sm text-slate-500">Citas hoy</p>
        </div>
        </div>

        <div className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm">
        <div className="bg-background rounded-lg p-2 text-lg">📊</div>
        <div>
            <p className="text-2xl font-bold text-dark">{citasSemana}</p>
            <p className="text-sm text-slate-500">Esta semana</p>
        </div>
        </div>

        <div className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm">
        <div className="bg-background rounded-lg p-2 text-lg">⏳</div>
        <div>
            <p className="text-2xl font-bold text-orange-400">{citasPendientes}</p>
            <p className="text-sm text-slate-500">Pendientes</p>
        </div>
        </div>

    </div>

      {/* Botón nueva cita */}
    <button
        onClick={onNuevaCita}
        className="w-full bg-primary-hover hover:bg-primary transition-colors text-white font-bold py-3 rounded-xl"
    >
        + Nueva Cita
    </button>

      {/* Lista de próximas citas hoy */}
    <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Próximas hoy
        </p>

        <div className="flex flex-col gap-2">
        {proximasCitas.length === 0 ? (
            <p className="text-sm text-slate-400">No hay más citas hoy</p>
        ) : (
            proximasCitas.map((cita) => (
            <div
                key={cita.id}
                className="bg-white rounded-xl p-3 border-l-4 border-primary shadow-sm"
            >
                <p className="font-semibold text-dark text-sm">{cita.pacienteNombre}</p>
                <p className="text-xs text-slate-500">{cita.hora} · {cita.tipo}</p>
            </div>
            ))
        )}
        </div>
    </div>

    </aside>
)
}