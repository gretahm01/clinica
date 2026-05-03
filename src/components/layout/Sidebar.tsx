// ===========================
// src/components/layout/Sidebar.tsx
// ===========================
// Sidebar de navegación del psicólogo.
// Botón "Nueva Cita" arriba, luego navegación con íconos.
// ===========================

import { useNavigate, useLocation } from "react-router-dom"

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
  onNuevaCita: () => void
}

const navItems = [
  {
    label: "Agenda",
    path: "/psicologo/dashboard",
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Pacientes",
    path: "/psicologo/pacientes",
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  // NUEVO BOTÓN PARA TAREAS
  {
    label: "Tareas",
    path: "/psicologo/tareas",
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
]

export default function Sidebar({ onNuevaCita }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-slate-100 flex flex-col flex-shrink-0">
      <div className="p-3 pt-4">
        <button
          onClick={onNuevaCita}
          className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Cita
        </button>
      </div>

      <div className="px-3 py-1">
        <div className="border-t border-slate-100"></div>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 pb-2">
          Menú
        </p>
        {navItems.map((item) => {
          // Ajustamos para que Tareas se marque activo incluso si estamos dentro de una tarea específica
          const isActive = location.pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all text-left
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
                ${isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-dark"
                }
              `}
            >
              <span className={isActive ? "text-white" : "text-slate-400"}>
                {item.icono}
              </span>
              {item.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}