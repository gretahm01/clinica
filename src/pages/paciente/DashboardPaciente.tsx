// ===========================
// src/pages/paciente/DashboardPaciente.tsx
// ===========================

import { useState, useEffect } from "react"
import { useAuth } from "../../hooks/useAuth"
import type { Cita, Tarea, EstadoCita } from "../../types"
import ModalSolicitarCita from "../../components/ui/ModalSolicitarCita"
import NavbarPaciente from "../../components/layout/NavbarPaciente"
import SidebarPaciente from "../../components/layout/SidebarPaciente"
import { 
  getCitasPorPaciente, 
  cancelarCita, 
  reagendarCita, 
  crearCita, 
  confirmarCita, 
  getNotificaciones, 
  marcarNotificacionesLeidas 
} from "../../services/api"

const TAREAS_MOCK: Tarea[] = [
  { 
    id: 1, 
    pacienteId: 1, 
    profesionalId: 1, 
    titulo: "Diario de emociones", 
    contenido: "Escribe cada noche cómo te sentiste durante el día.", 
    fechaLimite: "2026-04-01", 
    estado: "pendiente", 
    fechaCreacion: "2026-03-20" 
  },
]

function colorEstadoCita(estado: EstadoCita) {
  const e = estado?.toLowerCase().trim();
  switch (e) {
    case "confirmada": return "bg-emerald-50 text-emerald-600 border border-emerald-100"
    case "pendiente":  return "bg-orange-50 text-orange-600 border border-orange-100"
    case "cancelada":  return "bg-slate-100 text-slate-500 border border-slate-200"
    case "completada": return "bg-blue-50 text-blue-600 border border-blue-100"
    case "reagendada": return "bg-red-50 text-red-600 border border-red-100"
    default:           return "bg-slate-50 text-slate-500 border border-slate-100"
  }
}

function etiquetaEstadoCita(estado: EstadoCita) {
  const e = estado?.toLowerCase().trim();
  switch (e) {
    case "confirmada": return "Confirmada"
    case "pendiente":  return "Pendiente de confirmar" 
    case "cancelada":  return "Cancelada"
    case "completada": return "Completada"
    case "reagendada": return "Requiere tu confirmación" 
    default:           return estado
  }
}

function formatearFecha(fecha: string) {
  return new Date(fecha + "T12:00:00").toLocaleDateString("es-MX", { 
    weekday: "long", 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  })
}

function esPasada(fecha: string) { 
  return new Date(fecha + "T23:59:59") < new Date() 
}

function obtenerMotivoLimpio(motivo: string) {
  if (!motivo) return "";
  return motivo.replace("[Paciente] ", "").replace("[Psicólogo] ", "");
}

export default function DashboardPaciente() {
  const { usuario } = useAuth()
  
  const [citas, setCitas] = useState<Cita[]>([]) 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [notificaciones, setNotificaciones] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  
  const [modalCitaAbierto, setModalCitaAbierto] = useState(false)
  const [seccionActiva, setSeccionActiva]       = useState<"citas" | "tareas">("citas")
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null)
  
  const [procesando, setProcesando] = useState(false)
  const [modoReagendar, setModoReagendar] = useState(false)
  const [nuevaFecha, setNuevaFecha] = useState("")
  const [nuevaHora, setNuevaHora] = useState("")
  const [motivoReagendar, setMotivoReagendar] = useState("")

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
    obtenerDatosGenerales(); 
  }, [usuario]);

  async function obtenerDatosGenerales() {
    if (!usuario?.pacienteId) { 
      setCargando(false); 
      return; 
    }
    try {
      const [resCitas, resNotif] = await Promise.all([
        getCitasPorPaciente(Number(usuario.pacienteId)), 
        getNotificaciones()
      ])
      
      if (resCitas.success) setCitas(resCitas.data); 
      if (resNotif.success) setNotificaciones(resNotif.data);
    } finally { 
      setCargando(false); 
    }
  }

  async function handleMarcarLeidas() {
    await marcarNotificacionesLeidas();
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
  }

  function abrirModalCita(cita: Cita) { 
    setCitaSeleccionada(cita); 
    setModoReagendar(false); 
  }

  async function handleConfirmar(id: number) {
    setProcesando(true)
    try {
      const res = await confirmarCita(id)
      if (res.success) { 
        await obtenerDatosGenerales(); 
        setCitaSeleccionada(null) 
      }
    } catch {
      alert("Error al confirmar la cita")
    } finally {
      setProcesando(false)
    }
  }

  async function handleCancelar(id: number) {
    if (!confirm("¿Estás seguro de cancelar?")) return
    setProcesando(true)
    try {
      const res = await cancelarCita(id)
      if (res.success) { 
        await obtenerDatosGenerales(); 
        setCitaSeleccionada(null) 
      }
    } catch {
      alert("Error al cancelar la cita")
    } finally {
      setProcesando(false)
    }
  }

  async function handleReagendar() {
    if (!nuevaFecha || !nuevaHora || !motivoReagendar.trim()) {
      return alert("Completa los datos de fecha, hora y motivo")
    }
    setProcesando(true)
    try {
      const motivoConEtiqueta = "[Paciente] " + motivoReagendar;
      const res = await reagendarCita(citaSeleccionada!.id, nuevaFecha, nuevaHora, motivoConEtiqueta, 'pendiente')
      
      if (res.success) { 
        await obtenerDatosGenerales(); 
        setCitaSeleccionada(null); 
        setModoReagendar(false) 
      }
    } catch {
      alert("Error al proponer el cambio de cita")
    } finally {
      setProcesando(false)
    }
  }

  const citasProximas = citas
    .filter(c => !esPasada(c.fecha) && c.estado !== "cancelada" && c.estado !== "completada")
    .sort((a, b) => a.fecha.localeCompare(b.fecha))

  const historialCitas = citas
    .filter(c => esPasada(c.fecha) || c.estado === "cancelada" || c.estado === "completada")
    .sort((a, b) => b.fecha.localeCompare(a.fecha))

  const proximaCita = citasProximas.find(c => c.estado === "confirmada") ?? citasProximas[0] ?? null
  const tareasPendientes = TAREAS_MOCK.filter(t => t.estado === "pendiente").length

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center animate-pulse bg-background">
        <div className="text-primary font-bold text-lg">Cargando tu información...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavbarPaciente />
      
      <div className="flex flex-1 overflow-hidden">
        <SidebarPaciente 
          citasProximasCount={citasProximas.length} 
          tareasPendientesCount={tareasPendientes}
          proximaCita={proximaCita} 
          notificaciones={notificaciones}
          onNuevaCita={() => setModalCitaAbierto(true)} 
          onMarcarLeidas={async () => { await marcarNotificacionesLeidas(); obtenerDatosGenerales(); }}
          seccionActiva={seccionActiva} 
          setSeccionActiva={setSeccionActiva} 
          mostrarNavegacionInterna={true}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {seccionActiva === "citas" && (
            <div>
              <h1 className="text-2xl font-bold text-dark mb-6">Mis Citas</h1>
              
              {citasProximas.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Próximas y Pendientes
                  </h2>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    {citasProximas.map((cita) => (
                      <div 
                        key={cita.id} 
                        onClick={() => abrirModalCita(cita)} 
                        className="bg-white rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all border border-slate-100 hover:border-primary group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex flex-col items-center justify-center">
                              <p className="text-lg font-bold text-primary leading-none">
                                {new Date(cita.fecha + "T12:00:00").getDate()}
                              </p>
                              <p className="text-[10px] font-bold uppercase text-primary mt-0.5">
                                {new Date(cita.fecha + "T12:00:00").toLocaleDateString("es-MX", { month: "short" }).replace(".", "")}
                              </p>
                            </div>
                            <div>
                              <p className="font-bold text-dark capitalize">
                                {formatearFecha(cita.fecha)}
                              </p>
                              <p className="text-xs font-medium text-slate-500 mt-1">
                                {cita.hora.slice(0, 5)} hrs
                              </p>
                            </div>
                          </div>
                          <span className={`text-[10px] px-2.5 py-1.5 rounded-md font-bold uppercase ${colorEstadoCita(cita.estado)}`}>
                            {etiquetaEstadoCita(cita.estado)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {historialCitas.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Historial
                  </h2>
                  <div className="flex flex-col gap-2">
                    {historialCitas.map((cita) => (
                      <div 
                        key={cita.id} 
                        onClick={() => abrirModalCita(cita)} 
                        className="bg-white rounded-xl px-5 py-4 cursor-pointer hover:shadow-sm transition-all border border-slate-100 hover:border-slate-200 flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center justify-center">
                            <p className="text-sm font-bold text-slate-500 leading-none">
                              {new Date(cita.fecha + "T12:00:00").getDate()}
                            </p>
                            <p className="text-[9px] font-bold uppercase text-slate-400 mt-0.5">
                              {new Date(cita.fecha + "T12:00:00").toLocaleDateString("es-MX", { month: "short" }).replace(".", "")}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-dark capitalize">
                              {new Date(cita.fecha + "T12:00:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs font-medium text-slate-400">
                                {cita.hora.slice(0, 5)} hrs
                              </p>
                              {cita.feedback && (
                                <span className="text-[10px] text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded">
                                  Con nota
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2.5 py-1.5 rounded-md font-bold uppercase ${colorEstadoCita(cita.estado)}`}>
                          {etiquetaEstadoCita(cita.estado)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* MODAL DETALLE DE CITA */}
      {citaSeleccionada && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setCitaSeleccionada(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase ${colorEstadoCita(citaSeleccionada.estado)}`}>
                  {etiquetaEstadoCita(citaSeleccionada.estado)}
                </span>
                <h3 className="text-xl font-bold text-dark mt-3 capitalize">
                  {formatearFecha(citaSeleccionada.fecha)}
                </h3>
                <p className="text-slate-500 text-sm font-medium mt-1">
                  {citaSeleccionada.hora.slice(0, 5)} hrs
                </p>
              </div>
              <button onClick={() => setCitaSeleccionada(null)} className="text-slate-400 text-2xl hover:text-slate-600 transition-colors">
                &times;
              </button>
            </div>

            {/* MÁQUINA DE ESTADOS PACIENTE */}
            {(() => {
              const estaPendiente = citaSeleccionada.estado === 'pendiente' || citaSeleccionada.estado === 'reagendada';
              const iniciadaPorPaciente = citaSeleccionada.motivo?.startsWith("[Paciente]");
              const motivoLimpio = obtenerMotivoLimpio(citaSeleccionada.motivo || "");

              if (estaPendiente && !modoReagendar) {
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
                          Tu psicólogo propone este horario.
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

            {!modoReagendar && citaSeleccionada.estado !== "completada" && citaSeleccionada.estado !== "cancelada" && !esPasada(citaSeleccionada.fecha) && (
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100">
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
              </div>
            )}

            {modoReagendar && (
              <div className="space-y-3 mt-4 border-t border-slate-100 pt-4">
                <p className="text-sm font-bold text-dark">Proponer nueva fecha</p>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="date" 
                    value={nuevaFecha} 
                    min={new Date().toISOString().split("T")[0]} 
                    onChange={e => setNuevaFecha(e.target.value)} 
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-primary outline-none" 
                  />
                  <select 
                    value={nuevaHora} 
                    onChange={e => setNuevaHora(e.target.value)} 
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-primary outline-none"
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
        abierto={modalCitaAbierto}
        onCerrar={() => setModalCitaAbierto(false)}
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
              setModalCitaAbierto(false); 
              alert("Tu solicitud ha sido enviada al psicólogo."); 
              await obtenerDatosGenerales(); 
            } else {
              alert("Error al enviar la solicitud.");
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