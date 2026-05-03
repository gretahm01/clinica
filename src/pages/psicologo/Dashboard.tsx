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
  getTodasLasTareas
} from "../../services/api"

// Funciones de ayuda
function colorEstado(estado: string) {
  const e = estado?.toLowerCase().trim();
  switch (e) {
    case "confirmada": return "#34d399" // Verde
    case "pendiente":  return "#fb923c" // Naranja
    case "reagendada": return "#f87171" // Rojo
    case "completada": return "#60a5fa" // Azul
    default:           return "#94a3b8" // Gris
  }
}

function obtenerMotivoLimpio(motivo: string) {
  if (!motivo) return "";
  return motivo.replace("[Paciente] ", "").replace("[Psicólogo] ", "");
}

// Componente Principal
export default function Dashboard() {
  const [modalAbierto, setModalAbierto]           = useState(false)
  const [fechaSeleccionada, setFechaSeleccionada] = useState("")
  const [pacientes, setPacientes]                 = useState<Paciente[]>([])
  const [guardando, setGuardando]                 = useState(false)
  
  const [citaSeleccionada, setCitaSeleccionada] = useState<{id: number, title: string, start: string, estado: string, feedback: string, notas: string, motivo: string} | null>(null)
  
  const [textoFeedback, setTextoFeedback]       = useState("")
  const [misNotas, setMisNotas]                 = useState("")
  const [loadingFeedback, setLoadingFeedback]   = useState(false)
  const [loadingCancelar, setLoadingCancelar]   = useState(false)
  
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

  const [tareasPendientes, setTareasPendientes] = useState<number>(0)
  
  const [eventosCitas, setEventosCitas] = useState<{
    id: string
    title: string
    start: string
    backgroundColor: string
    borderColor: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extendedProps: any
  }[]>([])

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
      const [resCitas, resPacientes, resHoy, resTareas] = await Promise.all([
        getCitas(),
        getPacientes(),
        getCitasHoy(),
        getTodasLasTareas()
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
              notas: cita.notas || "",
              motivo: cita.motivo || "" 
            }
          }))
        setEventosCitas(eventos)
      }
      if (resPacientes.success) setPacientes(resPacientes.data)
      if (resHoy.success) setPacientesHoy(resHoy.data)
      
      if (resTareas && resTareas.success && Array.isArray(resTareas.data)) {
        const porRevisar = resTareas.data.filter((t: any) => {
          const estadoLimpio = String(t.estado || "").toLowerCase().trim();
          return estadoLimpio === 'entregada';
        }).length;
        
        setTareasPendientes(porRevisar);
      }

    } catch (error) {
      console.error("Error al cargar datos principales del dashboard", error)
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
      notas: info.event.extendedProps.notas,
      motivo: info.event.extendedProps.motivo 
    })
    setModoReagendar(false)
    setTextoFeedback(info.event.extendedProps.feedback || "")
    setMisNotas(info.event.extendedProps.notas || "") 
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
      const motivoConEtiqueta = "[Psicólogo] " + motivoReagendar;
      const res = await reagendarCita(citaSeleccionada!.id, nuevaFecha, nuevaHora, motivoConEtiqueta, "reagendada");
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

  function handleClickFecha(info: { dateStr: string }) {
    setFechaSeleccionada(info.dateStr)
    setModalAbierto(true)
  }

  async function handleGuardarCita(datos: DatosCita) {
    try {
      setGuardando(true)
      const motivoConEtiqueta = "[Psicólogo] " + (datos.motivo || "Agendada desde el consultorio");
      const respuesta = await crearCita({
        pacienteId: datos.pacienteId,
        profesionalId: 0,
        fecha: datos.fecha,
        hora: datos.hora,
        estado: "pendiente",
        duracion: datos.duracion,
        motivo: motivoConEtiqueta
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

  // === CÁLCULOS DE LAS TARJETAS ===
  const hoyStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const mesActual = new Date().getMonth();
  const anioActual = new Date().getFullYear();
  
  // Mantiene el número total de confirmadas, sin restarlas cuando se completan
  const confirmadasHoyCount = pacientesHoy.filter(p => p.estado === 'confirmada' || p.estado === 'completada').length;
  
  // Cuenta solo las que ya fueron finalizadas
  const completadasHoyCount = pacientesHoy.filter(p => p.estado === 'completada').length;
  
  const completadasEsteMesCount = eventosCitas.filter(cita => {
    if (cita.extendedProps.estado !== 'completada') return false;
    const fechaCita = new Date(cita.start);
    return fechaCita.getMonth() === mesActual && fechaCita.getFullYear() === anioActual;
  }).length;

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
            
            {/* TARJETA 1: Confirmadas por Hoy */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-600 font-medium px-2 py-0.5 rounded-full">Hoy</span>
              </div>
              <p className="text-3xl font-bold text-dark">{confirmadasHoyCount}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Citas Confirmadas por Hoy</p>
            </div>

            {/* TARJETA 2: Completadas por Hoy */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-xs bg-blue-50 text-blue-500 font-medium px-2 py-0.5 rounded-full">Hoy</span>
              </div>
              <p className="text-3xl font-bold text-dark">{completadasHoyCount}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Citas Completadas Por Hoy</p>
            </div>

            {/* TARJETA 3: Tareas por Revisar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <span className="text-xs bg-rose-50 text-rose-500 font-medium px-2 py-0.5 rounded-full">Pendientes</span>
              </div>
              <p className="text-3xl font-bold text-dark">{tareasPendientes}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Tareas Por Revisar</p>
            </div>

            {/* TARJETA 4: Completadas este mes */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs bg-violet-50 text-violet-500 font-medium px-2 py-0.5 rounded-full">Este Mes</span>
              </div>
              <p className="text-3xl font-bold text-dark">{completadasEsteMesCount}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Citas Completadas en este mes</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-dark">Agenda Semanal</h2>
              <div className="hidden sm:flex items-center gap-4 text-xs text-slate-500 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#34d399] inline-block shadow-sm"></span>
                  Confirmada
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#fb923c] inline-block shadow-sm"></span>
                  Pendiente
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#f87171] inline-block shadow-sm"></span>
                  Reagendada
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#60a5fa] inline-block shadow-sm"></span>
                  Completada
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
                right: "dayGridMonth,timeGridWeek,timeGridDay" 
              }}
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

          <div className="p-4 pt-6">
            <h3 className="text-sm font-bold text-dark mb-3">
              Citas de Hoy
              {pacientesHoy.length > 0 && <span className="text-xs text-slate-400 font-normal ml-1">({pacientesHoy.length})</span>}
            </h3>
            {pacientesHoy.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-xs text-slate-400">Sin citas para hoy</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {pacientesHoy.map((paciente) => (
                  <div key={paciente.id} className="flex flex-col bg-slate-50 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-3 p-3">
                      <p className="text-xs font-bold text-dark flex-shrink-0 w-10">{paciente.hora.slice(0, 5)}</p>
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0 uppercase">
                        {paciente.nombre?.[0] ?? "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-dark truncate capitalize">
                          {paciente.nombre} {paciente.apellido}
                        </p>
                      </div>
                      
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase flex-shrink-0 ${
                        paciente.estado === "confirmada" ? "bg-emerald-100 text-emerald-600" : 
                        paciente.estado === "completada" ? "bg-blue-100 text-blue-600" : 
                        paciente.estado === "reagendada" ? "bg-red-100 text-red-600" :
                        "bg-orange-100 text-orange-600"
                      }`}>
                        {paciente.estado === "confirmada" || paciente.estado === "completada" ? "✓" : "•"}
                      </span>

                    </div>
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

      {/* MODAL DETALLES DE CITA */}
      {citaSeleccionada && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setCitaSeleccionada(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-xl font-bold text-dark capitalize">{citaSeleccionada.title}</h3>
                <p className="text-slate-500 text-sm mt-0.5">{citaSeleccionada.start.slice(11, 16)} hrs</p>
              </div>
              <button onClick={() => setCitaSeleccionada(null)} className="text-slate-400 hover:text-slate-600 text-3xl leading-none">&times;</button>
            </div>

            {/* MÁQUINA DE ESTADOS */}
            {(() => {
              const estaPendiente = citaSeleccionada.estado === 'pendiente' || citaSeleccionada.estado === 'reagendada';
              const iniciadaPorPsicologo = citaSeleccionada.motivo?.startsWith("[Psicólogo]");
              const motivoLimpio = obtenerMotivoLimpio(citaSeleccionada.motivo);

              if (estaPendiente) {
                return (
                  <div className="mb-4">
                    {iniciadaPorPsicologo ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                          En espera de confirmación
                        </p>
                        <p className="text-sm text-dark font-medium">
                          El paciente aún no confirma esta solicitud.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center mb-3">
                        <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider mb-1">
                          Acción Requerida
                        </p>
                        <p className="text-sm text-dark font-medium mb-2">
                          El paciente solicita este horario.
                        </p>
                        {motivoLimpio && (
                          <p className="text-xs text-orange-800 italic">"{motivoLimpio}"</p>
                        )}
                      </div>
                    )}
                    
                    {!iniciadaPorPsicologo && (
                      <button 
                        onClick={handleConfirmarSesion} 
                        disabled={loadingFeedback} 
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        Confirmar y Aceptar Cita
                      </button>
                    )}
                  </div>
                )
              }
              return null;
            })()}

            <div className="mb-4">
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
                Feedback Público (Visible para Paciente)
              </label>
              <textarea 
                value={textoFeedback} 
                onChange={(e) => setTextoFeedback(e.target.value)} 
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none bg-slate-50" 
                rows={2} 
              />
            </div>

            <div className="mb-5">
              <label className="block text-[11px] font-bold text-blue-500 uppercase mb-1.5 flex items-center gap-1 tracking-wider">
                Notas Clínicas (Privadas)
              </label>
              <textarea 
                value={misNotas} 
                onChange={(e) => setMisNotas(e.target.value)} 
                className="w-full border border-blue-200 bg-blue-50/50 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                rows={3} 
              />
            </div>

            {!modoReagendar && (
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100">
                <button 
                  onClick={handleGuardarTodo} 
                  disabled={loadingFeedback} 
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors border border-slate-200"
                >
                  Solo Guardar Notas
                </button>
                
                {citaSeleccionada.estado === 'confirmada' && (
                  <button 
                    onClick={handleFinalizarSesion} 
                    disabled={loadingFeedback} 
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Guardar y Marcar Completada
                  </button>
                )}
                
                {citaSeleccionada.estado !== 'completada' && citaSeleccionada.estado !== 'cancelada' && (
                  <button 
                    onClick={() => setModoReagendar(true)} 
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl font-bold text-sm shadow-md transition-colors"
                  >
                    Reagendar / Proponer Cambio
                  </button>
                )}
                
                {citaSeleccionada.estado !== "completada" && (
                  <button 
                    onClick={handleCancelarCita} 
                    disabled={loadingCancelar} 
                    className="w-full text-red-500 mt-2 text-xs font-bold hover:underline transition-colors"
                  >
                    Cancelar Cita
                  </button>
                )}
              </div>
            )}

            {modoReagendar && (
              <div className="space-y-3 mt-4 border-t border-slate-100 pt-4">
                <p className="text-sm font-bold text-dark">Proponer Nuevo Horario</p>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="date" 
                    value={nuevaFecha} 
                    min={new Date().toISOString().split("T")[0]} 
                    onChange={e => setNuevaFecha(e.target.value)} 
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-primary outline-none font-medium bg-white" 
                  />
                  <select 
                    value={nuevaHora} 
                    onChange={e => setNuevaHora(e.target.value)} 
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white focus:ring-primary outline-none font-medium"
                  >
                    <option value="">Hora...</option>
                    {opcionesHoras.map(h => <option key={h} value={h}>{h} hrs</option>)}
                  </select>
                </div>
                <textarea 
                  placeholder="Motivo del cambio..." 
                  value={motivoReagendar} 
                  onChange={e => setMotivoReagendar(e.target.value)} 
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm resize-none focus:ring-primary outline-none" 
                  rows={2} 
                />
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => setModoReagendar(false)} 
                    className="flex-1 border border-slate-200 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleReagendarPsicologo} 
                    disabled={loadingFeedback} 
                    className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-bold hover:bg-primary-hover transition-colors disabled:opacity-50"
                  >
                    Enviar Propuesta
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}