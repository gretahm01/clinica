// ===========================
// src/pages/paciente/CalendarioPaciente.tsx
// ===========================

import { useState, useEffect } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import esLocale from "@fullcalendar/core/locales/es"
import NavbarPaciente from "../../components/layout/NavbarPaciente"
import SidebarPaciente from "../../components/layout/SidebarPaciente"
import ModalSolicitarCita from "../../components/ui/ModalSolicitarCita"
import { useAuth } from "../../hooks/useAuth"
import { getCitasPorPaciente, confirmarCita, cancelarCita, reagendarCita, getNotificaciones, marcarNotificacionesLeidas } from "../../services/api"
import type { Cita } from "../../types"

// ===========================
// FUNCIONES DE AYUDA
// ===========================
function colorEstadoCalendario(estado: string) {
  switch (estado) {
    case 'confirmada': return '#34d399';
    case 'pendiente': return '#fb923c';
    case 'reagendada': return '#f87171';
    default: return '#94a3b8';
  }
}

function colorEstadoCita(estado: string) {
  switch (estado) {
    case 'confirmada': return 'bg-emerald-100 text-emerald-600';
    case 'pendiente': return 'bg-orange-100 text-orange-600';
    case 'reagendada': return 'bg-red-100 text-red-600';
    default: return 'bg-slate-100 text-slate-500';
  }
}

function etiquetaEstadoCita(estado: string) {
  switch (estado) {
    case 'confirmada': return 'Confirmada';
    case 'pendiente': return 'En Revisión';
    case 'reagendada': return 'Reagendada / Propuesta';
    default: return estado;
  }
}

function formatearFecha(fechaStr: string) {
  if (!fechaStr) return "";
  const fecha = new Date(fechaStr + "T12:00:00");
  return fecha.toLocaleDateString("es-MX", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function esPasada(fechaStr: string) {
  if (!fechaStr) return false;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaCita = new Date(fechaStr + "T12:00:00");
  fechaCita.setHours(0, 0, 0, 0);
  return fechaCita < hoy;
}

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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
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

function obtenerMotivoLimpio(motivo: string) {
  if (!motivo) return "";
  return motivo.replace("[Paciente] ", "").replace("[Psicólogo] ", "");
}

// ===========================
// COMPONENTE PRINCIPAL
// ===========================
export default function CalendarioPaciente() {
  const { usuario } = useAuth()
  
  const [citasCrudas, setCitasCrudas] = useState<Cita[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [eventos, setEventos] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [notificaciones, setNotificaciones] = useState<any[]>([])
  const [proximaCita, setProximaCita] = useState<Cita | null>(null)

  const [modalNuevaCitaAbierto, setModalNuevaCitaAbierto] = useState(false)
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null)
  
  const [procesando, setProcesando] = useState(false)
  const [modoReagendar, setModoReagendar] = useState(false)
  const [nuevaFecha, setNuevaFecha] = useState("")
  const [nuevaHora, setNuevaHora] = useState("")
  const [motivoReagendar, setMotivoReagendar] = useState("")

  const opcionesHoras = (() => { 
    const h = []; 
    for(let i=8; i<=20; i++) { 
      h.push(`${i.toString().padStart(2, '0')}:00`); 
      if(i<20) h.push(`${i.toString().padStart(2, '0')}:30`); 
    } 
    return h; 
  })();

  useEffect(() => { 
    cargarDatos(); 
  }, [usuario])

  async function cargarDatos() {
    if (!usuario?.pacienteId) return;
    try {
      const [resCitas, resNotif] = await Promise.all([
        getCitasPorPaciente(Number(usuario.pacienteId)),
        getNotificaciones()
      ])
      
      if (resCitas.success) {
        setCitasCrudas(resCitas.data);
        
        // Mapear eventos para FullCalendar
        setEventos(resCitas.data.filter((c: Cita) => c.estado !== 'cancelada').map((c: Cita) => ({
          id: String(c.id), 
          title: "Sesión Psicológica", 
          start: `${c.fecha}T${c.hora}`,
          backgroundColor: colorEstadoCalendario(c.estado),
          borderColor: colorEstadoCalendario(c.estado)
        })));
        
        // Lógica de próxima cita
        const futuras = resCitas.data.filter((c: Cita) => !esPasada(c.fecha) && c.estado !== 'cancelada' && c.estado !== 'completada').sort((a: Cita, b: Cita) => a.fecha.localeCompare(b.fecha));
        setProximaCita(futuras.find((c: Cita) => c.estado === "confirmada") ?? futuras[0] ?? null);
      }
      
      if (resNotif.success) {
        setNotificaciones(resNotif.data);
      }
    } catch (error) { 
      console.error(error); 
    }
  }

  async function handleMarcarLeidas() {
    await marcarNotificacionesLeidas();
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
  }

  async function handleConfirmar(id: number) {
    setProcesando(true);
    try {
      const res = await confirmarCita(id);
      if (res.success) { 
        await cargarDatos(); 
        setCitaSeleccionada(null); 
      }
    } catch {
      alert("Error al confirmar cita")
    } finally { 
      setProcesando(false); 
    }
  }

  async function handleCancelar(id: number) {
    if (!confirm("¿Deseas cancelar esta cita?")) return;
    setProcesando(true);
    try {
      const res = await cancelarCita(id);
      if (res.success) { 
        await cargarDatos(); 
        setCitaSeleccionada(null); 
      }
    } catch {
      alert("Error al cancelar cita")
    } finally { 
      setProcesando(false); 
    }
  }

  async function handleReagendar() {
    if (!nuevaFecha || !nuevaHora || !motivoReagendar.trim()) {
      return alert("Completa todos los campos obligatorios");
    }
    setProcesando(true);
    try {
      const motivoConEtiqueta = "[Paciente] " + motivoReagendar;
      const res = await reagendarCita(citaSeleccionada!.id, nuevaFecha, nuevaHora, motivoConEtiqueta, 'pendiente');
      if (res.success) { 
        alert("Tu propuesta de cambio ha sido enviada."); 
        await cargarDatos(); 
        setCitaSeleccionada(null); 
        setModoReagendar(false); 
      }
    } catch {
      alert("Error al enviar propuesta")
    } finally { 
      setProcesando(false); 
    }
  }

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavbarPaciente />
      
      <div className="flex flex-1 overflow-hidden">
        
        <SidebarPaciente 
          proximaCita={proximaCita ? { fecha: proximaCita.fecha, hora: proximaCita.hora.slice(0, 5) } : null}
          onNuevaCita={() => setModalNuevaCitaAbierto(true)}
        />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-xl font-bold text-dark">Calendario de Sesiones</h2>
                <p className="text-sm text-slate-400 mt-0.5 font-medium">Revisa tus citas agendadas</p>
              </div>
              
              {/* LEYENDA DE COLORES */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
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
              </div>
            </div>

            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale={esLocale}
              events={eventos}
              height="650px"
              eventClick={(info) => {
                const cita = citasCrudas.find(c => c.id === Number(info.event.id));
                if (cita) {
                  setCitaSeleccionada(cita);
                  setModoReagendar(false);
                }
              }}
            />
          </div>
        </main>

        <aside className="w-72 min-h-screen bg-white border-l border-slate-100 flex flex-col flex-shrink-0 overflow-y-auto hidden lg:flex">
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-dark">Notificaciones</h3>
                {noLeidas > 0 && (
                  <span className="w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {noLeidas}
                  </span>
                )}
              </div>
              {noLeidas > 0 && (
                <button onClick={handleMarcarLeidas} className="text-xs text-primary hover:text-primary-hover font-medium transition-colors">
                  Marcar Leídas
                </button>
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
        </aside>

      </div>

      {/* MODAL DETALLES DE CITA */}
      {citaSeleccionada && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setCitaSeleccionada(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${colorEstadoCita(citaSeleccionada.estado)}`}>
                  {etiquetaEstadoCita(citaSeleccionada.estado)}
                </span>
                <h3 className="text-xl font-bold text-dark mt-3 capitalize">
                  {formatearFecha(citaSeleccionada.fecha)}
                </h3>
                <p className="text-slate-500 text-sm font-medium mt-1">
                  {citaSeleccionada.hora.slice(0, 5)} hrs
                </p>
              </div>
              <button onClick={() => setCitaSeleccionada(null)} className="text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none">
                &times;
              </button>
            </div>

            {!modoReagendar ? (
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100">
                
                {/* MÁQUINA DE ESTADOS PACIENTE */}
                {(() => {
                  const estaPendiente = citaSeleccionada.estado === 'pendiente' || citaSeleccionada.estado === 'reagendada';
                  const iniciadaPorPaciente = citaSeleccionada.motivo?.startsWith("[Paciente]");
                  const motivoLimpio = obtenerMotivoLimpio(citaSeleccionada.motivo || "");

                  if (estaPendiente) {
                    return (
                      <div className="mb-4">
                        {iniciadaPorPaciente ? (
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                              En revisión
                            </p>
                            <p className="text-sm text-dark font-medium">
                              El psicólogo está revisando tu solicitud.
                            </p>
                          </div>
                        ) : (
                          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center mb-3">
                            <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider mb-1">
                              Acción Requerida
                            </p>
                            <p className="text-sm text-dark font-medium mb-2">
                              El psicólogo propone este horario.
                            </p>
                            {motivoLimpio && (
                              <p className="text-xs text-orange-800 italic">"{motivoLimpio}"</p>
                            )}
                          </div>
                        )}
                        
                        {!iniciadaPorPaciente && (
                          <button 
                            onClick={() => handleConfirmar(citaSeleccionada.id)} 
                            disabled={procesando} 
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            Sí, Confirmar Asistencia
                          </button>
                        )}
                      </div>
                    )
                  }
                  return null;
                })()}

                {/* Feedback del Psicólogo */}
                {citaSeleccionada.feedback && (
                  <div className="mb-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
                    <p className="text-[10px] text-blue-500 font-bold uppercase mb-1 tracking-wider">
                      Nota de tu Psicólogo
                    </p>
                    <p className="text-sm text-dark italic">"{citaSeleccionada.feedback}"</p>
                  </div>
                )}

                {citaSeleccionada.estado !== "cancelada" && citaSeleccionada.estado !== "completada" && !esPasada(citaSeleccionada.fecha) && (
                  <>
                    <button 
                      onClick={() => setModoReagendar(true)} 
                      className="w-full border border-slate-200 text-slate-600 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
                    >
                      Proponer otro horario
                    </button>
                    <button 
                      onClick={() => handleCancelar(citaSeleccionada.id)} 
                      disabled={procesando} 
                      className="w-full text-red-500 mt-1 text-xs font-bold hover:underline transition-colors"
                    >
                      Cancelar Cita
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3 mt-4 border-t border-slate-100 pt-4">
                <p className="text-sm font-bold text-dark">Proponer nueva fecha</p>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="date" 
                    value={nuevaFecha} 
                    min={new Date().toISOString().split("T")[0]} 
                    onChange={e => setNuevaFecha(e.target.value)} 
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-primary outline-none bg-white font-medium" 
                  />
                  <select 
                    value={nuevaHora} 
                    onChange={e => setNuevaHora(e.target.value)} 
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-primary outline-none bg-white font-medium"
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
                    className="flex-1 border border-slate-200 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
                  >
                    Atrás
                  </button>
                  <button 
                    onClick={handleReagendar} 
                    disabled={procesando}
                    className="flex-1 bg-primary text-white py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 hover:bg-primary-hover transition-colors"
                  >
                    Enviar Propuesta
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL SOLICITAR CITA NUEVA */}
      <ModalSolicitarCita
        abierto={modalNuevaCitaAbierto}
        onCerrar={() => setModalNuevaCitaAbierto(false)}
        onGuardar={async (datos) => {
          setProcesando(true);
          try {
            const motivoConEtiqueta = "[Paciente] " + (datos.motivo || "Solicito espacio");
            
            const res = await crearCita({ 
              pacienteId: Number(usuario?.pacienteId), 
              profesionalId: 1, 
              fecha: datos.fecha, 
              hora: datos.hora, 
              estado: "pendiente", 
              duracion: 60, 
              motivo: motivoConEtiqueta 
            } as any);
            
            if (res.success) { 
              setModalNuevaCitaAbierto(false); 
              alert("Tu solicitud de cita ha sido enviada."); 
              await cargarDatos(); 
            } else {
              alert("Hubo un error al crear la cita.");
            }
          } catch (error) {
            alert("Error de conexión");
          } finally {
            setProcesando(false);
          }
        }}
      />
    </div>
  )
}