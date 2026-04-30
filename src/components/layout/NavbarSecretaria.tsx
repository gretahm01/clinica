// ===========================
// src/components/layout/NavbarSecretaria.tsx
// ===========================
// Navbar de la secretaria — mismo estilo que el del psicólogo
// pero adaptado a su rol.
// ===========================

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"

export default function NavbarSecretaria() {
  const navigate            = useNavigate()
  const { usuario, logout } = useAuth()

  const [menuAbierto, setMenuAbierto]             = useState(false)
  const [modalCerrarSesion, setModalCerrarSesion] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Fecha de hoy formateada
  const fechaHoy = new Date().toLocaleDateString("es-MX", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  })

  useEffect(() => {
    function handleClickFuera(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAbierto(false)
      }
    }
    document.addEventListener("mousedown", handleClickFuera)
    return () => document.removeEventListener("mousedown", handleClickFuera)
  }, [])

  function confirmarCerrarSesion() {
    logout()
    setModalCerrarSesion(false)
    navigate("/login")
  }

  return (
    <>
      <nav className="bg-white border-b border-slate-100 px-5 h-16 flex items-center gap-4 z-40 sticky top-0">

        {/* Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="font-bold text-dark text-lg tracking-tight">MedTrack</span>
        </div>

        {/* Fecha de hoy — centro */}
        <div className="hidden lg:flex items-center gap-2 text-sm text-slate-400 flex-1 justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="capitalize">{fechaHoy}</span>
        </div>

        {/* Menú usuario */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="flex items-center gap-3 pl-3 pr-4 py-2 rounded-xl hover:bg-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
              {usuario?.nombre?.[0] ?? "S"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-dark leading-none">
                {usuario?.nombre} {usuario?.apellido}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Secretaria</p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-4 h-4 text-slate-400 transition-transform ${menuAbierto ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {menuAbierto && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-dark">{usuario?.nombre} {usuario?.apellido}</p>
                <p className="text-xs text-slate-400 mt-0.5">{usuario?.email}</p>
              </div>
              <button
                onClick={() => { setMenuAbierto(false); setModalCerrarSesion(true) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Modal cerrar sesión */}
      {modalCerrarSesion && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-dark text-center mb-1">¿Cerrar sesión?</h3>
            <p className="text-slate-500 text-sm text-center mb-6">Tu sesión se cerrará y tendrás que volver a iniciar sesión.</p>
            <div className="flex gap-3">
              <button onClick={() => setModalCerrarSesion(false)} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm">Cancelar</button>
              <button onClick={confirmarCerrarSesion} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl transition-colors font-medium text-sm">Sí, cerrar sesión</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}