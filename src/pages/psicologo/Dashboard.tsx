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
import { 
  getCitas, 
  crearCita, 
  getPacientes, 
  cancelarCita, 
  getCitasHoy, 
  guardarFeedbackCita, 
  guardarNotasCita,
  completarCita, 
  confirmarCita,
  reagendarCita,
  getNotificaciones,
  marcarNotificacionesLeidas
} from "../../services/api"

function colorEstado(estado: string) {
  switch (estado) {
    case "confirmada": return "#34d399"
    case "pendiente":  return "#fb7185"
    case "cancelada":  return "#94a3b8"
    case "reagendada": return "#fb923c"
    case "completada": return "#60a5fa" 
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

function calcularTiempo(fechaStr: string) {
  if (!fechaStr) return "Hace un momento";
  const fecha = new Date(fechaStr);
  const ahora = new Date();
  const segundos = Math.floor((ahora.getTime() - fecha.getTime()) / 1000);
  if (segundos < 60) return "Hace un momento";
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `Hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Hace ${horas} horas`;
  const dias = Math.floor(horas / 24);
  if (dias === 1) return "Ayer";
  return `Hace ${dias} días`;
}

export default function Dashboard() {
  const [modalAbierto, setModalAbierto]       = useState(false)
  const [fechaSeleccionada, setFechaSeleccionada] = useState("")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [notificaciones, setNotificaciones]   = useState<any[]>([])
  const [pacientes, setPacientes]             = useState<Paciente[]>([])
  const [, setGuardando]                      = useState(false)
  const [citaSeleccionada, setCitaSeleccionada] = useState<{id: number, title: string, start: string, estado: string, feedback: string, notas: string} | null>(null)
  const [textoFeedback, setTextoFeedback]       = useState("")
  const [misNotas, setMisNotas]                 = useState("")
  const [loadingFeedback, setLoadingFeedback]   = useState(false)
  const [loadingCancelar, setLoadingCancelar] = useState(false)
  
  const [modoReagendar, setModoReagendar]     = useState(false)
  const [nuevaFecha, setNuevaFecha]           = useState("")
  const [nuevaHora, setNuevaHora]             = useState("")
  const [motivoReagendar, setMotivoReagendar] = useState("")

  const [pacientesHoy, setPacientesHoy]       = useState<{
    id: number
    hora: string
    estado: string
    nombre: string
    apellido: string
    motivo?: string
  }[]>([])
  const [eventosCitas, setEventosCitas] = useState<{
    id: string
    title: string
    start: string
    backgroundColor: string
    borderColor: string
    extendedProps: any
  }[]>([])

  const noLeidas = notificaciones.filter(n => !n.leida).length

  const generarHorarios = () => {
    const horas = [];
    for (let h = 8; h <= 20; h++) {
      const horaPad = h.toString().padStart(2, '0');
      horas.push(`${horaPad}:00`);
      if (h < 20) horas.push(`${horaPad}:30`);
    }
    return horas;
  };
  const opcionesHoras = generarHorarios();

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    try {
      const [resCitas, resPacientes, resHoy] = await Promise.all([
        getCitas(),
        getPacientes(),
        getCitasHoy()
      ]);

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
            extendedProps: {
              estado: cita.estado,
              feedback: cita.feedback || "",
              notas: cita.notas || ""
            }
          }))
        setEventosCitas(eventos)
      }
      if (resPacientes.success) setPacientes(resPacientes.data)
      if (resHoy.success) setPacientesHoy(resHoy.data)
    } catch {
      console.error("Error al cargar datos principales del dashboard")
    }

    try {
      const resNotif = await getNotificaciones();
      if (resNotif.success) {
        setNotificaciones(resNotif.data);
      }
    } catch {
      console.error("No se pudieron cargar las notificaciones");
      setNotificaciones([]);
    }
  }

  function handleNuevaCita() {
    setFechaSeleccionada("")
    setModalAbierto(true)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleClickCita(info: { event: any }) {
    setCitaSeleccionada({
      id: Number(info.event.id),
      title: info.event.title,
      start: info.event.startStr,
      estado: info.event.extendedProps.estado,
      feedback: info.event.extendedProps.feedback,
      notas: info.event.extendedProps.notas
    })
    setModoReagendar(false)
    setTextoFeedback(info.event.extendedProps.feedback || "")
    setMisNotas(info.event.extendedProps.notas || "") 
  }

  async function handleGuardarTodo() {
    if (!citaSeleccionada) return
    setLoadingFeedback(true)
    try {
      await Promise.all([
        guardarFeedbackCita(citaSeleccionada.id, textoFeedback),
        guardarNotasCita(citaSeleccionada.id, misNotas)
      ])
      setCitaSeleccionada(null)
      await cargarDatos() 
    } catch {
      alert("Error al guardar el registro")
    } finally {
      setLoadingFeedback(false)
    }
  }

  async function handleConfirmarSesion() {
    if (!citaSeleccionada) return
    setLoadingFeedback(true)
    try {
      const res = await confirmarCita(citaSeleccionada.id)
      if (res.success) {
        setCitaSeleccionada(null)
        await cargarDatos()
      }
    } catch {
      alert("Error al confirmar la cita")
    } finally {
      setLoadingFeedback(false)
    }
  }

  async function handleReagendarPsicologo() {
    if (!nuevaFecha || !nuevaHora) return alert("Selecciona fecha y hora");
    setLoadingFeedback(true);
    try {
      const motivoFinal = "Propuesto por tu psicólogo: " + motivoReagendar;
      const res = await reagendarCita(citaSeleccionada!.id, nuevaFecha, nuevaHora, motivoFinal, "reagendada");
      if (res.success) {
        setCitaSeleccionada(null);
        await cargarDatos();
      } else {
        alert(res.message || "Error al reagendar");
      }
    } catch { 
      alert("Error de conexión al reagendar"); 
    } finally { 
      setLoadingFeedback(false); 
    }
  }

  async function handleFinalizarSesion() {
    if (!citaSeleccionada) return
    setLoadingFeedback(true)
    try {
      await Promise.all([
        guardarFeedbackCita(citaSeleccionada.id, textoFeedback),
        guardarNotasCita(citaSeleccionada.id, misNotas)
      ])
      const res = await completarCita(citaSeleccionada.id)
      if (res.success) {
        setCitaSeleccionada(null)
        await cargarDatos()
      }
    } catch {
      alert("Error al completar la sesión")
    } finally {
      setLoadingFeedback(false)
    }
  }

  async function handleCancelarCita() {
    if (!citaSeleccionada) return
    setLoadingCancelar(true)
    try {
      const respuesta = await cancelarCita(citaSeleccionada.id)
      if (respuesta.success) {
        setCitaSeleccionada(null)
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
        estado: "confirmada", // <-- COMO PSICÓLOGA, TUS CITAS YA NACEN CONFIRMADAS
        duracion: datos.duracion,
      } as any)

      if (respuesta.success) {
        setModalAbierto(false)
        await cargarDatos()
      } else {
        alert(respuesta.message ?? "Error al agendar la cita")
      }
    } catch (err: unknown) {
      const mensaje = (err as any)?.response?.data?.message
      alert(mensaje ?? "Error al agendar la cita")
    } finally {
      setGuardando(false)
    }
  }

  async function marcarTodasLeidas() {
    await marcarNotificacionesLeidas();
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
  } 

  const mesActual = new Date().getMonth();
  const anioActual = new Date().getFullYear();
  
  const confirmadasHoyCount = pacientesHoy.filter(p => p.estado === 'confirmada').length;

  const citasEsteMesCount = eventosCitas.filter(cita => {
    const fechaCita = new Date(cita.start);
    return fechaCita.getMonth() === mesActual && fechaCita.getFullYear() === anioActual;
  }).length;

  const citasRealizadasCount = eventosCitas.filter(cita => cita.extendedProps.estado === 'completada').length;

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

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            
            {/* TARJETA 1 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-600 font-medium px-2 py-0.5 rounded-full">Hoy</span>
              </div>
              <p className="text-3xl font-bold text-dark">{confirmadasHoyCount}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Citas Confirmadas por Hoy</p>
            </div>

            {/* TARJETA 2 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <span className="text-xs bg-blue-50 text-blue-500 font-medium px-2 py-0.5 rounded-full">Este Mes</span>
              </div>
              <p className="text-3xl font-bold text-dark">{citasEsteMesCount}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Citas de Este Mes</p>
            </div>

            {/* TARJETA 3 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                </div>
                <span className="text-xs bg-rose-50 text-rose-500 font-medium px-2 py-0.5 rounded-full">Pendientes</span>
              </div>
              <p className="text-3xl font-bold text-dark">0</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Tareas por Revisar</p>
            </div>

            {/* TARJETA 4 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="text-xs bg-violet-50 text-violet-500 font-medium px-2 py-0.5 rounded-full">Completadas</span>
              </div>
              <p className="text-3xl font-bold text-dark">{citasRealizadasCount}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Citas Realizadas</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-dark">Agenda Semanal</h2>
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

        <aside className="w-72 min-h-screen bg-white border-l border-slate-100 flex flex-col flex-shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-dark">Notificaciones</h3>
                {noLeidas > 0 && (
                  <span className="w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{noLeidas}</span>
                )}
              </div>
              {noLeidas > 0 && (
                <button onClick={marcarTodasLeidas} className="text-xs text-primary hover:text-primary-hover font-medium transition-colors">Marcar Leídas</button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {notificaciones.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No tienes notificaciones</p>
              ) : (
                notificaciones.map((notif) => (
                  <div key={notif.id} className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${notif.leida ? "opacity-50" : "bg-slate-50"}`}>
                    {iconoNotificacion(notif.tipo)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-dark font-medium leading-snug">{notif.mensaje}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{calcularTiempo(notif.fecha)}</p>
                    </div>
                    {!notif.leida && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4">
            <h3 className="text-sm font-bold text-dark mb-3">
              Citas de Hoy
              {pacientesHoy.length > 0 && <span className="text-xs text-slate-400 font-normal ml-1">({pacientesHoy.length})</span>}
            </h3>
            {pacientesHoy.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <p className="text-xs text-slate-400">Sin citas para hoy</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {pacientesHoy.map((paciente) => (
                  <div key={paciente.id} className="flex flex-col bg-slate-50 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-3 p-3">
                      <p className="text-xs font-bold text-dark flex-shrink-0 w-10">{paciente.hora.slice(0, 5)}</p>
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {paciente.nombre?.[0] ?? "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-dark truncate">{paciente.nombre} {paciente.apellido}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                        paciente.estado === "confirmada" ? "bg-emerald-50 text-emerald-600" : 
                        paciente.estado === "reagendada" ? "bg-orange-50 text-orange-600" :
                        "bg-amber-50 text-amber-600"
                      }`}>
                        {paciente.estado === "confirmada" ? "✓" : "•"}
                      </span>
                    </div>
                    {paciente.estado === "reagendada" && paciente.motivo && (
                      <div className="px-2 pb-2">
                        <div className="bg-orange-50 p-1.5 rounded-lg border border-orange-100 leading-tight">
                          <span className="text-[9px] text-orange-500 font-bold uppercase mr-1">Motivo:</span>
                          <span className="text-[11px] text-orange-800 italic">"{paciente.motivo}"</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

      </div>

      <ModalNuevaCita abierto={modalAbierto} onCerrar={() => setModalAbierto(false)} onGuardar={handleGuardarCita} pacientes={pacientes} fechaInicial={fechaSeleccionada} />

      {/* MODAL DETALLES DE CITA */}
      {citaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-xl font-bold text-dark">{citaSeleccionada.title}</h3>
                <p className="text-slate-500 text-sm mt-0.5">{citaSeleccionada.start.slice(11, 16)} hrs</p>
              </div>
              <button onClick={() => setCitaSeleccionada(null)} className="text-slate-400 hover:text-slate-600 text-3xl leading-none">&times;</button>
            </div>

            <div className="mb-4">
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Feedback (Visible para Paciente)</label>
              <textarea value={textoFeedback} onChange={(e) => setTextoFeedback(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary" rows={2} />
            </div>

            <div className="mb-5">
              <label className="block text-[11px] font-bold text-blue-500 uppercase mb-1.5 flex items-center gap-1">Notas Clínicas (Privadas)</label>
              <textarea value={misNotas} onChange={(e) => setMisNotas(e.target.value)} className="w-full border border-blue-200 bg-blue-50/50 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" rows={3} />
            </div>

            <div className="flex flex-col gap-2">
              {modoReagendar ? (
                <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs font-bold text-dark uppercase">Proponer Nuevo Horario</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" value={nuevaFecha} onChange={e => setNuevaFecha(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-primary" />
                    <select value={nuevaHora} onChange={e => setNuevaHora(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white outline-none focus:ring-primary">
                      <option value="">Hora...</option>
                      {opcionesHoras.map(h => <option key={h} value={h}>{h} hrs</option>)}
                    </select>
                  </div>
                  <textarea placeholder="Motivo (ej. se empalma con junta)..." value={motivoReagendar} onChange={e => setMotivoReagendar(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 text-sm resize-none outline-none focus:ring-primary" rows={2} />
                  
                  <button onClick={handleReagendarPsicologo} disabled={loadingFeedback} className="w-full bg-primary text-white py-2 rounded-xl text-sm font-bold mt-1">Enviar Propuesta</button>
                  <button onClick={() => setModoReagendar(false)} className="w-full text-slate-400 text-xs py-1">Cancelar Cambio</button>
                </div>
              ) : (
                <>
                  <button onClick={handleGuardarTodo} disabled={loadingFeedback} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-xl transition-colors font-medium text-sm">
                    Solo Guardar Cambios
                  </button>

                  {/* Lógica del Superpoder: La Psicóloga SIEMPRE puede confirmar si está pendiente o reagendada */}
                  {(citaSeleccionada.estado === 'pendiente' || citaSeleccionada.estado === 'reagendada') && (
                    <button onClick={handleConfirmarSesion} disabled={loadingFeedback} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl transition-colors font-bold text-sm shadow-md">
                      Confirmar Cita
                    </button>
                  )}

                  {citaSeleccionada.estado !== 'completada' && citaSeleccionada.estado !== 'cancelada' && (
                    <button onClick={() => setModoReagendar(true)} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl transition-colors font-bold text-sm shadow-md">
                      Reagendar / Proponer Cambio
                    </button>
                  )}

                  {citaSeleccionada.estado === 'confirmada' && (
                    <button onClick={handleFinalizarSesion} disabled={loadingFeedback} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl transition-colors font-bold text-sm shadow-md flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Marcar como Completada
                    </button>
                  )}
                </>
              )}
            </div>

            {citaSeleccionada.estado !== "completada" && !modoReagendar && (
              <button onClick={handleCancelarCita} disabled={loadingCancelar} className="w-full text-red-500 mt-4 text-xs font-medium hover:underline">
                Cancelar Cita
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}