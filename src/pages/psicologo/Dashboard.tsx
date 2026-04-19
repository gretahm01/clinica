// ===========================
// src/pages/psicologo/Dashboard.tsx
// ===========================

import { useState, useEffect } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import esLocale from "@fullcalendar/core/locales/es"
import Navbar from "../../components/layout/Navbar"
import Sidebar from "../../components/layout/Sidebar"
import ModalNuevaCita, { type DatosCita } from "../../components/ui/ModalNuevaCita"
import type { Paciente } from "../../types"
import { getCitas, crearCita, getPacientes, cancelarCita, getCitasHoy } from "../../services/api"

const NOTIFICACIONES_MOCK = [
  { id: 1, tipo: "cita_solicitada", mensaje: "Carlos López solicitó una nueva cita", tiempo: "Hace 5 min", leida: false },
  { id: 2, tipo: "tarea_entregada", mensaje: "Carlos López entregó \"Diario de emociones\"", tiempo: "Hace 1 hora", leida: false },
  { id: 3, tipo: "cita_cancelada", mensaje: "Cita del viernes 27 fue cancelada", tiempo: "Ayer", leida: true },
]

function colorEstado(estado: string) {
  switch (estado) {
    case "confirmada": return "#34d399"
    case "pendiente":  return "#fb7185"
    case "cancelada":  return "#94a3b8"
    default:           return "#60a5fa"
  }
}

function iconoNotificacion(tipo: string) {
  switch (tipo) {
    case "cita_solicitada":
      return (
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )
    case "tarea_entregada":
      return (
        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
      )
    default:
      return (
        <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )
  }
}

export default function Dashboard() {
  const [modalAbierto, setModalAbierto]       = useState(false)
  const [fechaSeleccionada, setFechaSeleccionada] = useState("")
  const [notificaciones, setNotificaciones]   = useState(NOTIFICACIONES_MOCK)
  const [pacientes, setPacientes]             = useState<Paciente[]>([])
  const [, setGuardando]                      = useState(false)
  const [citaACancelar, setCitaACancelar]     = useState<{id: number, title: string, start: string} | null>(null)
  const [loadingCancelar, setLoadingCancelar] = useState(false)
  const [pacientesHoy, setPacientesHoy]       = useState<{
    id: number
    hora: string
    estado: string
    nombre: string
    apellido: string
  }[]>([])
  const [eventosCitas, setEventosCitas] = useState<{
    id: string
    title: string
    start: string
    backgroundColor: string
    borderColor: string
  }[]>([])

  const noLeidas = notificaciones.filter(n => !n.leida).length

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    try {
      const [resCitas, resPacientes, resHoy] = await Promise.all([
        getCitas(),
        getPacientes(),
        getCitasHoy()
      ])

      if (resCitas.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const eventos = (resCitas.data as any[])
          .filter((cita) => cita.estado !== 'cancelada')
          .map((cita) => ({
            id: String(cita.id),
            title: `${cita.pacienteNombre} ${cita.pacienteApellido}`,
            start: `${cita.fecha}T${cita.hora}`,
            backgroundColor: colorEstado(cita.estado),
            borderColor: colorEstado(cita.estado),
          }))
        setEventosCitas(eventos)
      }

      if (resPacientes.success) {
        setPacientes(resPacientes.data)
      }

      if (resHoy.success) {
        setPacientesHoy(resHoy.data)
      }

    } catch {
      console.error("Error al cargar datos del dashboard")
    }
  }

  function handleNuevaCita() {
    setFechaSeleccionada("")
    setModalAbierto(true)
  }

  function handleClickCita(info: { event: { id: string; title: string; startStr: string } }) {
    setCitaACancelar({
      id: Number(info.event.id),
      title: info.event.title,
      start: info.event.startStr
    })
  }

  function handleClickFecha(info: { dateStr: string }) {
    setFechaSeleccionada(info.dateStr)
    setModalAbierto(true)
  }

  async function handleGuardarCita(datos: DatosCita) {
    try {
      setGuardando(true)
      const respuesta = await crearCita({
        pacienteId: datos.pacienteId,
        profesionalId: 0,
        fecha: datos.fecha,
        hora: datos.hora,
        estado: "pendiente",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        duracion: datos.duracion,
      } as any)

      if (respuesta.success) {
        setModalAbierto(false)
        await cargarDatos()
      } else {
        alert(respuesta.message ?? "Error al agendar la cita")
      }
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mensaje = (err as any)?.response?.data?.message
      alert(mensaje ?? "Error al agendar la cita")
    } finally {
      setGuardando(false)
    }
  }

  async function handleCancelarCita() {
    if (!citaACancelar) return
    setLoadingCancelar(true)
    try {
      const respuesta = await cancelarCita(citaACancelar.id)
      if (respuesta.success) {
        setCitaACancelar(null)
        await cargarDatos()
      } else {
        alert(respuesta.message ?? "Error al cancelar")
      }
    } catch {
      alert("Error de conexión")
    } finally {
      setLoadingCancelar(false)
    }
  }

  function marcarTodasLeidas() {
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          citasHoy={pacientesHoy.length}
          citasSemana={0}
          citasPendientes={0}
          proximasCitas={[]}
          onNuevaCita={handleNuevaCita}
        />

        <main className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 min-w-0">

          {/* Stats */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-600 font-medium px-2 py-0.5 rounded-full">activos</span>
              </div>
              <p className="text-3xl font-bold text-dark">{pacientes.length}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Pacientes</p>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs bg-blue-50 text-blue-500 font-medium px-2 py-0.5 rounded-full">este mes</span>
              </div>
              <p className="text-3xl font-bold text-dark">{eventosCitas.length}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Citas</p>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <span className="text-xs bg-rose-50 text-rose-500 font-medium px-2 py-0.5 rounded-full">pendientes</span>
              </div>
              <p className="text-3xl font-bold text-dark">0</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Tareas por revisar</p>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs bg-violet-50 text-violet-500 font-medium px-2 py-0.5 rounded-full">hoy</span>
              </div>
              <p className="text-3xl font-bold text-dark">{pacientesHoy.length}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Confirmadas hoy</p>
            </div>
          </div>

          {/* Calendario */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-dark">Agenda semanal</h2>
              <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>Confirmada</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-300 inline-block"></span>Pendiente</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-300 inline-block"></span>Completada</span>
              </div>
            </div>

            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              locale={esLocale}
              headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }}
              events={eventosCitas}
              eventClick={handleClickCita}
              dateClick={handleClickFecha}
              slotMinTime="07:00:00"
              slotMaxTime="23:00:00"
              allDaySlot={false}
              height="auto"
            />
          </div>
        </main>

        {/* Panel derecho */}
        <aside className="w-72 min-h-screen bg-white border-l border-slate-100 flex flex-col flex-shrink-0 overflow-y-auto">

          {/* Notificaciones */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-dark">Notificaciones</h3>
                {noLeidas > 0 && (
                  <span className="w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{noLeidas}</span>
                )}
              </div>
              {noLeidas > 0 && (
                <button onClick={marcarTodasLeidas} className="text-xs text-primary hover:text-primary-hover font-medium transition-colors">
                  Marcar leídas
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {notificaciones.map((notif) => (
                <div key={notif.id} className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${notif.leida ? "opacity-50" : "bg-slate-50"}`}>
                  {iconoNotificacion(notif.tipo)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-dark font-medium leading-snug">{notif.mensaje}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{notif.tiempo}</p>
                  </div>
                  {!notif.leida && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>}
                </div>
              ))}
            </div>
          </div>

          {/* Pacientes hoy */}
          <div className="p-4">
            <h3 className="text-sm font-bold text-dark mb-3">
              Pacientes hoy
              {pacientesHoy.length > 0 && (
                <span className="text-xs text-slate-400 font-normal ml-1">({pacientesHoy.length})</span>
              )}
            </h3>

            {pacientesHoy.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-xs text-slate-400">Sin pacientes hoy</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {pacientesHoy.map((paciente) => (
                  <div key={paciente.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs font-bold text-dark flex-shrink-0 w-10">{paciente.hora.slice(0, 5)}</p>
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {paciente.nombre?.[0] ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-dark truncate">{paciente.nombre} {paciente.apellido}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                      paciente.estado === "confirmada" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    }`}>
                      {paciente.estado === "confirmada" ? "✓" : "•"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      <ModalNuevaCita
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onGuardar={handleGuardarCita}
        pacientes={pacientes}
        fechaInicial={fechaSeleccionada}
      />

      {/* Modal cancelar cita desde calendario */}
      {citaACancelar && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-dark text-center mb-1">¿Cancelar esta cita?</h3>
            <p className="text-slate-500 text-sm text-center mb-1">{citaACancelar.title}</p>
            <p className="text-slate-400 text-xs text-center mb-6">
              {new Date(citaACancelar.start).toLocaleDateString("es-MX", {
                weekday: "long", year: "numeric", month: "long", day: "numeric"
              })}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCitaACancelar(null)}
                disabled={loadingCancelar}
                className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm"
              >
                No cancelar
              </button>
              <button
                onClick={handleCancelarCita}
                disabled={loadingCancelar}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-2.5 rounded-xl transition-colors font-medium text-sm"
              >
                {loadingCancelar ? "Cancelando..." : "Sí, cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
