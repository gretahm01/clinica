import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import { LayoutDashboard, Users, UserCog, Settings, LogOut } from "lucide-react"

const navItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
  { label: "Personal",  path: "/admin/staff",     icon: <UserCog size={20} /> },
  { label: "Pacientes", path: "/admin/pacientes", icon: <Users size={20} /> },
]

export default function SidebarAdmin() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-slate-100 flex flex-col flex-shrink-0">
      
      {/* Header / Logo del Admin */}
      <div className="p-5 border-b border-slate-100 flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-dark">MedTrack</h1>
        <p className="text-xs font-medium text-primary">Panel de Administración</p>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-3 flex flex-col gap-1 mt-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 pb-2">
          Menú Principal
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
                {item.icon}
              </span>
              {item.label}
            </button>
          )
        })}

        <div className="px-3 py-4">
          <div className="border-t border-slate-100"></div>
        </div>

        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 pb-2">
          Sistema
        </p>
        
        {/* Botón de Configuración Actualizado */}
        <button 
          onClick={() => navigate('/admin/configuracion')}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
            ${location.pathname === '/admin/configuracion' 
              ? 'bg-primary text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-dark'
            }
          `}
        >
          <span className={location.pathname === '/admin/configuracion' ? 'text-white' : 'text-slate-400'}>
            <Settings size={20} />
          </span>
          Configuración
        </button>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>
      
    </aside>
  )
}