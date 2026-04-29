// ===========================
// src/pages/paciente/CalendarioPaciente.tsx
// ===========================

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import esLocale from "@fullcalendar/core/locales/es"
import NavbarPaciente from "../../components/layout/NavbarPaciente"

// ===========================
// DATOS MOCK 
// ===========================
const NOTIFICACIONES_PACIENTE = [
{
    id: 1,
    tipo: "cita_confirmada",
    mensaje: "Tu cita del miércoles ha sido confirmada",
    tiempo: "Hace 10 min",
    leida: false,
},
{
    id: 2,
    tipo: "nueva_tarea",
    mensaje: "Tu psicólogo asignó: 'Dibujo libre'",
    tiempo: "Hace 2 horas",
    leida: false,
},
]

const PROXIMA_CITA_MOCK = {
fecha: "mañana",
hora: "10:00 AM",
id: 1,
}

// ===========================
// HELPER — Íconos
// ===========================
function iconoNotificacion(tipo: string) {
switch (tipo) {
    case "nueva_tarea":
    return (
        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        </div>
    )
    default:
    return (
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        </div>
    )
}
}

export default function CalendarioPaciente() {
    const navigate = useNavigate()
    const [eventos, setEventos] = useState<object[]>([])
    const [notificaciones, setNotificaciones] = useState(NOTIFICACIONES_PACIENTE)

    const noLeidas = notificaciones.filter(n => !n.leida).length

    useEffect(() => {
    // Aquí cargarás tus eventos desde la API de Greta cuando esté lista
    setEventos([]) 
}, [])

    function marcarTodasLeidas() {
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
    }

    return (
    <div className="min-h-screen bg-background flex flex-col">
    <NavbarPaciente />

    <div className="flex-1 p-6">
        {/* Layout: calendario + panel derecho */}
        <div className="flex gap-6 h-full">

          {/* COLUMNA IZQUIERDA — Calendario */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-5">
            <div>
                <h2 className="text-xl font-bold text-dark">Mi Agenda</h2>
                <p className="text-sm text-slate-400 mt-0.5">Revisa tus próximas sesiones</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-primary inline-block"></span>
                Confirmada
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-200 inline-block"></span>
                  Pendiente
                </span>
              </div>
            </div>

            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale={esLocale}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek",
              }}
              events={eventos}
              height="650px"
              eventClick={(info) => {
                navigate(`/paciente/citas/${info.event.id}`)
              }}
            />
          </div>

          {/* COLUMNA DERECHA — Sidebar */}
          <aside className="w-80 flex flex-col gap-4 flex-shrink-0">

            {/* Notificaciones */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-dark text-sm">Notificaciones</h3>
                  {noLeidas > 0 && (
                    <span className="bg-rose-100 text-rose-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                      {noLeidas}
                    </span>
                  )}
                </div>
                {noLeidas > 0 && (
                  <button
                    onClick={marcarTodasLeidas}
                    className="text-[11px] text-primary hover:text-primary-hover font-medium transition-colors"
                  >
                    Marcar leídas
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {notificaciones.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl flex gap-3 transition-all ${
                      n.leida ? "opacity-50" : "bg-slate-50 border border-slate-100"
                    }`}
                  >
                    {iconoNotificacion(n.tipo)}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-dark leading-snug">
                        {n.mensaje}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{n.tiempo}</p>
                    </div>
                    {!n.leida && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                    )}
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 py-2 text-[11px] font-semibold text-slate-400 hover:text-primary transition-colors border-t border-slate-50">
                Ver todas
              </button>
            </div>

            {/* Próxima cita destacada */}
            <div
              onClick={() => navigate(`/paciente/citas/${PROXIMA_CITA_MOCK.id}`)}
              className="bg-dark rounded-2xl p-5 text-white shadow-sm cursor-pointer hover:opacity-95 transition-opacity"
            >
              <p className="text-[10px] text-slate-400 mb-1 uppercase tracking-wider font-semibold">
                Próxima sesión
              </p>
              <p className="font-bold text-lg capitalize">{PROXIMA_CITA_MOCK.fecha}</p>
              <p className="text-slate-300 text-sm">{PROXIMA_CITA_MOCK.hora}</p>

              <div className="mt-4 flex items-center justify-between">
                <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all">
                  Ver detalle →
                </button>
                <svg className="w-7 h-7 opacity-20" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
                </svg>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  )
}