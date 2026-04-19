// ===========================
// src/components/layout/SidebarSecretaria.tsx
// ===========================
// Sidebar de la secretaria.
// Navegación: Dashboard, Pacientes y Calendario.
// Botón de nueva cita arriba.
// ===========================

import { useNavigate, useLocation } from "react-router-dom"

interface SidebarSecretariaProps {
  onNuevaCita?: () => void
  onNuevoPaciente?: () => void
}

const navItems = [
  {
    label: "Tablero",
    path: "/secretaria/dashboard",
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    label: "Pacientes",
    path: "/secretaria/pacientes",
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: "Calendario",
    path: "/secretaria/calendario",
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
]

export default function SidebarSecretaria({ onNuevaCita, onNuevoPaciente }: SidebarSecretariaProps) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-slate-100 flex flex-col flex-shrink-0">

      {/* Botones de acción rápida arriba */}
      <div className="p-3 pt-4 flex flex-col gap-2">
        {/* Nueva cita — acción principal */}
        <button
          onClick={onNuevaCita}
          className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Cita
        </button>

        {/* Nuevo paciente — acción secundaria */}
        <button
          onClick={onNuevoPaciente}
          className="w-full border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium py-2 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Nuevo Paciente
        </button>
      </div>

      <div className="px-3 py-1">
        <div className="border-t border-slate-100"></div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 pb-2">
          Menú
        </p>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
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