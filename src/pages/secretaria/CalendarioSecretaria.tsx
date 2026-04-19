// ===========================
// src/pages/secretaria/CalendarioSecretaria.tsx
// ===========================
// Calendario mensual de disponibilidad por psicóloga.
// Al picarle a un día abre un panel lateral con horarios (9am-6pm):
// muestra qué horas están ocupadas (con cita) y cuáles libres.
// Layout: NavbarSecretaria + SidebarSecretaria + contenido principal
// ===========================

import { useState, useEffect } from "react"
import NavbarSecretaria from "../../components/layout/NavbarSecretaria"
import SidebarSecretaria from "../../components/layout/SidebarSecretaria"

// ===========================
// TIPOS
// ===========================
interface Cita {
  appointment_id: number
  appointment_date: string
  appointment_time: string
  status: "pendiente" | "confirmada" | "cancelada"
  paciente_nombre: string
  paciente_apellido: string
  psicologa_nombre: string
  psicologa_apellido: string
  professional_id: number
}

interface Psicologa {
  professional_id: number
  nombre: string
  apellido: string
}

// Horarios de la clínica (9am–6pm)
const HORARIOS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]
const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

const STATUS_CHIP: Record<string, string> = {
  confirmada: "bg-emerald-100 text-emerald-700 border-emerald-200",
  pendiente:  "bg-amber-100 text-amber-700 border-amber-200",
  cancelada:  "bg-red-100 text-red-600 border-red-200",
}
const STATUS_DOT: Record<string, string> = {
  confirmada: "bg-emerald-500",
  pendiente:  "bg-amber-400",
  cancelada:  "bg-red-400",
}

// ===========================
// PANEL LATERAL — HORARIOS DEL DÍA
// ===========================
function PanelDia({ fecha, citas, onCerrar }: { fecha: Date | null; citas: Cita[]; onCerrar: () => void }) {
  if (!fecha) return null

  const horasOcupadas = new Set(citas.map((c) => c.appointment_time.slice(0, 5)))

  return (
    <div className="w-80 flex-shrink-0 bg-white border-l border-slate-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{DIAS_SEMANA[fecha.getDay()]}</p>
          <h3 className="text-lg font-bold text-dark">{fecha.getDate()} de {MESES[fecha.getMonth()]}</h3>
        </div>
        <button onClick={onCerrar} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-2 px-5 py-3 border-b border-slate-100">
        <div className="text-center p-2 bg-emerald-50 rounded-xl">
          <p className="text-lg font-bold text-emerald-600">{citas.filter((c) => c.status === "confirmada").length}</p>
          <p className="text-xs text-emerald-600/70">Conf.</p>
        </div>
        <div className="text-center p-2 bg-amber-50 rounded-xl">
          <p className="text-lg font-bold text-amber-500">{citas.filter((c) => c.status === "pendiente").length}</p>
          <p className="text-xs text-amber-500/70">Pend.</p>
        </div>
        <div className="text-center p-2 bg-slate-50 rounded-xl">
          <p className="text-lg font-bold text-slate-500">{HORARIOS.length - horasOcupadas.size}</p>
          <p className="text-xs text-slate-400">Libres</p>
        </div>
      </div>

      {/* Lista de horarios */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
        {HORARIOS.map((hora) => {
          const citasHora = citas.filter((c) => c.appointment_time.slice(0, 5) === hora)
          const libre = citasHora.length === 0
          return (
            <div key={hora} className="flex gap-3 items-start">
              <span className="text-xs font-medium text-slate-400 w-12 pt-2.5 flex-shrink-0">{hora}</span>
              {libre ? (
                <div className="flex-1 h-10 rounded-xl border border-dashed border-slate-200 flex items-center px-3">
                  <span className="text-xs text-slate-300">Disponible</span>
                </div>
              ) : (
                <div className="flex-1 space-y-1.5">
                  {citasHora.map((cita) => (
                    <div key={cita.appointment_id} className={`rounded-xl border px-3 py-2 ${STATUS_CHIP[cita.status]}`}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[cita.status]}`} />
                        <p className="text-xs font-semibold truncate">{cita.paciente_nombre} {cita.paciente_apellido}</p>
                      </div>
                      <p className="text-xs opacity-70 pl-3">{cita.psicologa_nombre} {cita.psicologa_apellido}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ===========================
// COMPONENTE PRINCIPAL
// ===========================
export default function CalendarioSecretaria() {
  const hoy = new Date()
  const [mesActual, setMesActual] = useState(hoy.getMonth())
  const [anioActual, setAnioActual] = useState(hoy.getFullYear())
  const [citas, setCitas] = useState<Cita[]>([])
  const [psicologas, setPsicologas] = useState<Psicologa[]>([])
  const [filtroPsicologa, setFiltroPsicologa] = useState<string>("todas")
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date | null>(null)
  const [cargando, setCargando] = useState(true)

  const API = import.meta.env.VITE_API_URL ?? "http://localhost/clinica/backend"

  useEffect(() => { cargarCitas() }, [mesActual, anioActual])

  async function cargarCitas() {
    try {
      setCargando(true)
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }
      const [resCitas, resPsicologas] = await Promise.all([
        fetch(`${API}/routes/citas.php?mes=${mesActual + 1}&anio=${anioActual}`, { headers }),
        fetch(`${API}/routes/pacientes.php?lista=psicologas`, { headers }),
      ])
      const dataCitas = await resCitas.json()
      const dataPsicologas = await resPsicologas.json()
      if (dataCitas.success) setCitas(dataCitas.data)
      if (dataPsicologas.success) setPsicologas(dataPsicologas.data)
    } catch {
      console.error("Error al cargar el calendario")
    } finally {
      setCargando(false)
    }
  }

  function irMesAnterior() {
    if (mesActual === 0) { setMesActual(11); setAnioActual((a) => a - 1) }
    else setMesActual((m) => m - 1)
    setDiaSeleccionado(null)
  }

  function irMesSiguiente() {
    if (mesActual === 11) { setMesActual(0); setAnioActual((a) => a + 1) }
    else setMesActual((m) => m + 1)
    setDiaSeleccionado(null)
  }

  function generarDias(): (Date | null)[] {
    const primerDia = new Date(anioActual, mesActual, 1).getDay()
    const totalDias = new Date(anioActual, mesActual + 1, 0).getDate()
    const dias: (Date | null)[] = Array(primerDia).fill(null)
    for (let d = 1; d <= totalDias; d++) dias.push(new Date(anioActual, mesActual, d))
    return dias
  }

  const citasFiltradas = citas.filter((c) =>
    filtroPsicologa === "todas" || `${c.psicologa_nombre} ${c.psicologa_apellido}` === filtroPsicologa
  )

  function citasDelDia(fecha: Date): Cita[] {
    return citasFiltradas.filter((c) => {
      const fc = new Date(c.appointment_date + "T00:00:00")
      return fc.getDate() === fecha.getDate() && fc.getMonth() === fecha.getMonth() && fc.getFullYear() === fecha.getFullYear()
    })
  }

  const citasDia = diaSeleccionado ? citasDelDia(diaSeleccionado) : []

  function esHoy(fecha: Date) {
    return fecha.getDate() === hoy.getDate() && fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear()
  }

  function esDiaSeleccionado(fecha: Date) {
    if (!diaSeleccionado) return false
    return fecha.getDate() === diaSeleccionado.getDate() && fecha.getMonth() === diaSeleccionado.getMonth() && fecha.getFullYear() === diaSeleccionado.getFullYear()
  }

  const dias = generarDias()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NavbarSecretaria />

      <div className="flex flex-1 overflow-hidden">
        <SidebarSecretaria onNuevaCita={() => {}} onNuevoPaciente={() => {}} />

        <main className="flex-1 flex overflow-hidden">

          {/* Columna principal del calendario */}
          <div className="flex-1 overflow-y-auto p-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-dark">Calendario</h1>
                <p className="text-slate-400 text-sm mt-0.5">Disponibilidad de horarios por psicóloga</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Filtro psicóloga */}
                <select
                  value={filtroPsicologa}
                  onChange={(e) => { setFiltroPsicologa(e.target.value); setDiaSeleccionado(null) }}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                >
                  <option value="todas">Todas las psicólogas</option>
                  {psicologas.map((ps) => (
                    <option key={ps.professional_id} value={`${ps.nombre} ${ps.apellido}`}>
                      {ps.nombre} {ps.apellido}
                    </option>
                  ))}
                </select>

                {/* Navegar meses */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <button onClick={irMesAnterior} className="px-3 py-2.5 hover:bg-slate-50 transition-colors text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-sm font-semibold text-dark px-4 min-w-36 text-center">
                    {MESES[mesActual]} {anioActual}
                  </span>
                  <button onClick={irMesSiguiente} className="px-3 py-2.5 hover:bg-slate-50 transition-colors text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Botón hoy */}
                <button
                  onClick={() => { setMesActual(hoy.getMonth()); setAnioActual(hoy.getFullYear()); setDiaSeleccionado(hoy) }}
                  className="bg-white border border-slate-200 hover:border-primary text-sm font-medium text-slate-600 hover:text-primary px-4 py-2.5 rounded-xl transition-colors"
                >
                  Hoy
                </button>
              </div>
            </div>

            {/* Leyenda */}
            <div className="flex items-center gap-5 mb-4">
              {[["bg-emerald-500", "Confirmada"], ["bg-amber-400", "Pendiente"], ["bg-red-400", "Cancelada"]].map(([color, label]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="text-xs text-slate-500">{label}</span>
                </div>
              ))}
            </div>

            {/* Cargando */}
            {cargando ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-400 text-sm">Cargando calendario...</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                {/* Cabecera días de semana */}
                <div className="grid grid-cols-7 border-b border-slate-100">
                  {DIAS_SEMANA.map((dia) => (
                    <div key={dia} className="py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">{dia}</div>
                  ))}
                </div>

                {/* Grid del mes */}
                <div className="grid grid-cols-7">
                  {dias.map((fecha, i) => {
                    if (!fecha) return <div key={`vacio-${i}`} className="min-h-24 border-b border-r border-slate-50" />

                    const citasD = citasDelDia(fecha)
                    const seleccionado = esDiaSeleccionado(fecha)
                    const hoyDia = esHoy(fecha)

                    return (
                      <div
                        key={fecha.toISOString()}
                        onClick={() => setDiaSeleccionado(seleccionado ? null : fecha)}
                        className={`min-h-24 border-b border-r border-slate-50 p-2 cursor-pointer transition-colors ${seleccionado ? "bg-primary/5" : "hover:bg-slate-50"}`}
                      >
                        {/* Número del día */}
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold transition-colors
                            ${hoyDia ? "bg-primary text-white" : seleccionado ? "bg-primary/10 text-primary" : "text-dark hover:bg-slate-100"}`}>
                            {fecha.getDate()}
                          </span>
                          {citasD.length > 0 && (
                            <span className="text-xs text-slate-400 font-medium">{citasD.length}</span>
                          )}
                        </div>

                        {/* Chips de citas (máx 2 visibles) */}
                        <div className="space-y-1">
                          {citasD.slice(0, 2).map((cita) => (
                            <div key={cita.appointment_id} className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium truncate border ${STATUS_CHIP[cita.status]}`}>
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[cita.status]}`} />
                              <span className="truncate">{cita.appointment_time.slice(0, 5)} {cita.paciente_nombre}</span>
                            </div>
                          ))}
                          {citasD.length > 2 && (
                            <p className="text-xs text-slate-400 pl-1">+{citasD.length - 2} más</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Panel lateral del día seleccionado */}
          {diaSeleccionado && (
            <PanelDia fecha={diaSeleccionado} citas={citasDia} onCerrar={() => setDiaSeleccionado(null)} />
          )}
        </main>
      </div>
    </div>
  )
}