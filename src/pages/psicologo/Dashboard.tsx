// ===========================
// src/pages/psicologo/Dashboard.tsx
// ===========================
// Dashboard principal del psicólogo — layout de 3 columnas.
//
// Columna izquierda: Sidebar (navegación)
// Columna central: Stats horizontales + Calendario FullCalendar
// Columna derecha: Notificaciones + Pacientes del día
//
// Inspirado en TheraDash y software clínico profesional.
// Colores: verde primario + rosa pastel + azul pastel + morado suave
//
// Cuando PHP esté listo:
//   - getCitas() → reemplaza mockCitas y mockProximasCitas
//   - getPacientes() → reemplaza [] en ModalNuevaCita
//   - getNotificaciones() → reemplaza NOTIFICACIONES_MOCK
// ===========================

import { useState } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import esLocale from "@fullcalendar/core/locales/es"
import Navbar from "../../components/layout/Navbar"
import Sidebar from "../../components/layout/Sidebar"
import ModalNuevaCita, { type DatosCita } from "../../components/ui/ModalNuevaCita"

// ===========================
// DATOS MOCK
// ===========================
const mockCitas: never[] = []
const mockProximasCitas: never[] = []

// Notificaciones de ejemplo — vendrán de getNotificaciones() cuando PHP esté listo
const NOTIFICACIONES_MOCK = [
  {
    id: 1,
    tipo: "cita_solicitada",   // el paciente solicitó una cita nueva
    mensaje: "Carlos López solicitó una nueva cita",
    tiempo: "Hace 5 min",
    leida: false,
  },
  {
    id: 2,
    tipo: "tarea_entregada",   // el paciente entregó una tarea
    mensaje: "Carlos López entregó \"Diario de emociones\"",
    tiempo: "Hace 1 hora",
    leida: false,
  },
  {
    id: 3,
    tipo: "cita_cancelada",    // el paciente canceló una cita
    mensaje: "Cita del viernes 27 fue cancelada",
    tiempo: "Ayer",
    leida: true,
  },
]

// Pacientes con cita hoy — vendrán de getCitasHoy() cuando PHP esté listo
const PACIENTES_HOY_MOCK: {
  id: number
  nombre: string
  hora: string
  tipo: string
  estado: "confirmada" | "pendiente"
}[] = []

// ===========================
// HELPER — ícono y color por tipo de notificación
// ===========================
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

// ===========================
// COMPONENTE PRINCIPAL
// ===========================
export default function Dashboard() {

  const [modalAbierto, setModalAbierto]           = useState(false)
  const [fechaSeleccionada, setFechaSeleccionada] = useState("")

  // Notificaciones con estado local para marcar como leídas
  const [notificaciones, setNotificaciones] = useState(NOTIFICACIONES_MOCK)

  // Cuenta notificaciones no leídas — para el badge del navbar
  const noLeidas = notificaciones.filter(n => !n.leida).length

  function handleNuevaCita() {
    setFechaSeleccionada("")
    setModalAbierto(true)
  }

  function handleClickCita(info: { event: { id: string; title: string } }) {
    console.log("Cita seleccionada:", info.event.title)
  }

  function handleClickFecha(info: { dateStr: string }) {
    setFechaSeleccionada(info.dateStr)
    setModalAbierto(true)
  }

  function handleGuardarCita(datos: DatosCita) {
    console.log("Guardar cita:", datos)
    setModalAbierto(false)
  }

  // Marca todas las notificaciones como leídas
  function marcarTodasLeidas() {
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Navbar sticky */}
      <Navbar />

      {/* Layout: sidebar + centro + panel derecho */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar delgado de navegación */}
        <Sidebar
          citasHoy={0}
          citasSemana={0}
          citasPendientes={0}
          proximasCitas={mockProximasCitas}
          onNuevaCita={handleNuevaCita}
        />

        {/* ===========================
            COLUMNA CENTRAL — principal
            Stats + Calendario
            =========================== */}
        <main className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 min-w-0">

          {/* Stats horizontales en fila de 4 */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">

            {/* Pacientes — verde */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                {/* Badge de cambio — placeholder por ahora */}
                <span className="text-xs bg-emerald-50 text-emerald-600 font-medium px-2 py-0.5 rounded-full">
                  activos
                </span>
              </div>
              <p className="text-3xl font-bold text-dark">0</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Pacientes</p>
            </div>

            {/* Citas este mes — azul pastel */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs bg-blue-50 text-blue-500 font-medium px-2 py-0.5 rounded-full">
                  este mes
                </span>
              </div>
              <p className="text-3xl font-bold text-dark">0</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Citas</p>
            </div>

            {/* Tareas por revisar — rosa pastel */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <span className="text-xs bg-rose-50 text-rose-500 font-medium px-2 py-0.5 rounded-full">
                  pendientes
                </span>
              </div>
              <p className="text-3xl font-bold text-dark">0</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Tareas por revisar</p>
            </div>

            {/* Confirmadas hoy — morado suave */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs bg-violet-50 text-violet-500 font-medium px-2 py-0.5 rounded-full">
                  hoy
                </span>
              </div>
              <p className="text-3xl font-bold text-dark">0</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Confirmadas hoy</p>
            </div>

          </div>

          {/* Calendario */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-dark">Agenda semanal</h2>
              {/* Leyenda de colores */}
              <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
                  Confirmada
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-300 inline-block"></span>
                  Pendiente
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-300 inline-block"></span>
                  Completada
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>
                  Cancelada
                </span>
              </div>
            </div>

            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              locale={esLocale}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={mockCitas}
              eventClick={handleClickCita}
              dateClick={handleClickFecha}
              slotMinTime="08:00:00"
              slotMaxTime="20:00:00"
              allDaySlot={false}
              height="auto"
            />
          </div>

        </main>

        {/* ===========================
            PANEL DERECHO
            Notificaciones + Pacientes de hoy
            Ancho fijo de 280px
            =========================== */}
        <aside className="w-72 min-h-screen bg-white border-l border-slate-100 flex flex-col flex-shrink-0 overflow-y-auto">

          {/* ===========================
              NOTIFICACIONES
              Badge con cantidad no leídas.
              Cuando PHP esté listo: getNotificaciones() reemplaza NOTIFICACIONES_MOCK
              =========================== */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-dark">Notificaciones</h3>
                {/* Badge de no leídas */}
                {noLeidas > 0 && (
                  <span className="w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {noLeidas}
                  </span>
                )}
              </div>
              {noLeidas > 0 && (
                <button
                  onClick={marcarTodasLeidas}
                  className="text-xs text-primary hover:text-primary-hover font-medium transition-colors"
                >
                  Marcar leídas
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {notificaciones.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">Sin notificaciones nuevas</p>
              ) : (
                notificaciones.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                      notif.leida ? "opacity-50" : "bg-slate-50"
                    }`}
                  >
                    {iconoNotificacion(notif.tipo)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-dark font-medium leading-snug">
                        {notif.mensaje}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{notif.tiempo}</p>
                    </div>
                    {/* Punto azul para no leídas */}
                    {!notif.leida && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ===========================
              PACIENTES DEL DÍA
              Lista de citas agendadas para hoy con hora y estado.
              Cuando PHP esté listo: getCitasHoy() reemplaza PACIENTES_HOY_MOCK
              =========================== */}
          <div className="p-4">
            <h3 className="text-sm font-bold text-dark mb-3">Pacientes hoy</h3>

            {PACIENTES_HOY_MOCK.length === 0 ? (
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
                {PACIENTES_HOY_MOCK.map((paciente) => (
                  <div
                    key={paciente.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-background transition-colors cursor-pointer"
                  >
                    {/* Hora de la cita */}
                    <div className="text-center flex-shrink-0">
                      <p className="text-xs font-bold text-dark">{paciente.hora}</p>
                    </div>
                    {/* Avatar con inicial */}
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {paciente.nombre[0]}
                    </div>
                    {/* Nombre y tipo */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-dark truncate">{paciente.nombre}</p>
                      <p className="text-xs text-slate-400 truncate">{paciente.tipo}</p>
                    </div>
                    {/* Estado */}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                      paciente.estado === "confirmada"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
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

      {/* Modal nueva cita */}
      <ModalNuevaCita
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onGuardar={handleGuardarCita}
        pacientes={[]}
        fechaInicial={fechaSeleccionada}
      />

    </div>
  )
}