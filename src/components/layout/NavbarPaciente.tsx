// ===========================
// src/components/layout/NavbarPaciente.tsx
// ===========================

import { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"

// Links de navegación del paciente
const navItems = [
  {
    label: "Inicio",
    path: "/paciente/dashboard",
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Mi Agenda",
    path: "/paciente/calendario",
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Mis Tareas",
    path: "/paciente/tareas",
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
]

export default function NavbarPaciente() {
  const navigate            = useNavigate()
  const location            = useLocation()
  const { usuario, logout } = useAuth()

  // Controla si el menú desplegable está abierto
  const [menuAbierto, setMenuAbierto] = useState(false)

  // Controla si el modal de confirmación de cierre de sesión está visible
  const [modalCerrarSesion, setModalCerrarSesion] = useState(false)

  // Referencia al contenedor del menú para detectar clics fuera
  const menuRef = useRef<HTMLDivElement>(null)

  // Cierra el menú si el usuario hace clic fuera de él
  useEffect(() => {
    function handleClickFuera(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAbierto(false)
      }
    }
    document.addEventListener("mousedown", handleClickFuera)
    return () => document.removeEventListener("mousedown", handleClickFuera)
  }, [])

  // Ejecuta el logout real y redirige al login
  function confirmarCerrarSesion() {
    logout()
    setModalCerrarSesion(false)
    navigate("/login")
  }

  return (
    <>
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40">

        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/paciente/dashboard")}>
          <div className="w-4 h-4 bg-primary rounded-full"></div>
          <span className="font-bold text-dark text-lg tracking-tight">MedTrack</span>
        </div>

        {/* Links de navegación — Inicio y Mi Agenda */}
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/")
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
                  ${isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-dark"
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
        </div>

        {/* Menú desplegable del usuario */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 text-dark text-sm font-bold hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {/* Avatar con inicial del paciente */}
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold uppercase">
              {usuario?.nombre?.[0] ?? "P"}
            </div>
            <span className="capitalize">{usuario ? `${usuario.nombre} ${usuario.apellido}` : "Paciente"}</span>
            {/* Chevron que rota cuando el menú está abierto */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-4 h-4 text-slate-400 transition-transform ${menuAbierto ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown — solo visible cuando menuAbierto es true */}
          {menuAbierto && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden">

              {/* Info del paciente */}
              <div className="px-5 py-3 border-b border-slate-50 mb-1">
                <p className="text-sm font-bold text-dark capitalize truncate">
                  {usuario?.nombre} {usuario?.apellido}
                </p>
                <p className="text-xs text-slate-400 mt-0.5 truncate font-medium">{usuario?.email}</p>
              </div>

              {/* Opción: Mi perfil */}
              <button
                onClick={() => {
                  navigate("/paciente/perfil")
                  setMenuAbierto(false)
                }}
                className="w-full flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors focus-visible:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mi Perfil
              </button>

              {/* Opción: Cerrar sesión */}
              <button
                onClick={() => {
                  setMenuAbierto(false)
                  setModalCerrarSesion(true)
                }}
                className="w-full flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors focus-visible:outline-none mt-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar Sesión
              </button>

            </div>
          )}
        </div>

      </nav>

      {/* ===========================
          MODAL DE CONFIRMACIÓN DE CIERRE DE SESIÓN
          =========================== */}
      {modalCerrarSesion && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-auto">

            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-dark text-center mb-1">
              ¿Cerrar sesión?
            </h3>
            <p className="text-slate-500 text-sm font-medium text-center mb-6 px-4">
              Tendrás que volver a ingresar tus credenciales la próxima vez.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setModalCerrarSesion(false)}
                className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl hover:bg-slate-50 transition-colors font-bold text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarCerrarSesion}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl transition-colors font-bold text-sm shadow-sm"
              >
                Sí, cerrar sesión
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}