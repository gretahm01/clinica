import { useState, useEffect } from "react"
import Navbar from "../../components/layout/Navbar"
import SidebarAdmin from "../../components/layout/SidebarAdmin"
import { getAdminDashboardStats } from "../../services/api"

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalPsicologos: 0, totalPacientes: 0 })
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        const res = await getAdminDashboardStats()
        if (res.success) setStats(res.data)
      } catch (e) {
        console.error("Error cargando stats de admin", e)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <SidebarAdmin />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-dark">Panel de Administración</h1>
            <p className="text-slate-500 mt-1 font-medium">Resumen global de la clínica</p>
          </div>

          {cargando ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              
              {/* Tarjeta Psicólogos */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-4xl font-bold text-dark">{stats.totalPsicologos}</p>
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mt-1">Psicólogos Registrados</p>
                </div>
              </div>

              {/* Tarjeta Pacientes */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-6">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-4xl font-bold text-dark">{stats.totalPacientes}</p>
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mt-1">Pacientes Registrados</p>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  )
}