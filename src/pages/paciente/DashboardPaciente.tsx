// ===========================
// src/pages/paciente/DashboardPaciente.tsx
// ===========================

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import type { Cita, Tarea, EstadoCita } from "../../types"
import ModalSolicitarCita from "../../components/ui/ModalSolicitarCita"
import NavbarPaciente from "../../components/layout/NavbarPaciente"
import { getCitasPorPaciente, cancelarCita, reagendarCita, crearCita, confirmarCita } from "../../services/api"

const TAREAS_MOCK: Tarea[] = [
  { id: 1, pacienteId: 1, profesionalId: 1, titulo: "Diario de emociones", contenido: "Escribe cada noche cómo te sentiste durante el día.", fechaLimite: "2026-04-01", estado: "pendiente", fechaCreacion: "2026-03-20" },
]

function colorEstadoCita(estado: EstadoCita) {
  switch (estado) {
    case "confirmada": return "bg-emerald-50 text-emerald-600 border border-emerald-100"
    case "pendiente":  return "bg-amber-50 text-amber-600 border border-amber-100"
    case "cancelada":  return "bg-slate-100 text-slate-500 border border-slate-200"
    case "completada": return "bg-blue-50 text-blue-600 border border-blue-100"
    case "reagendada": return "bg-orange-50 text-orange-600 border border-orange-100"
    default:           return "bg-slate-50 text-slate-500 border border-slate-100"
  }
}

function etiquetaEstadoCita(estado: EstadoCita) {
  switch (estado) {
    case "confirmada": return "Confirmada"
    case "pendiente":  return "En revisión" // Cambiado para que sepa que el doc la está revisando
    case "cancelada":  return "Cancelada"
    case "completada": return "Completada"
    case "reagendada": return "Requiere tu confirmación" // Súper claro para el paciente
    default:           return estado
  }
}

function formatearFecha(fecha: string) {
  return new Date(fecha + "T12:00:00").toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
}

function esPasada(fecha: string) {
  return new Date(fecha + "T23:59:59") < new Date()
}

export default function DashboardPaciente() {
  const navigate    = useNavigate()
  const { usuario } = useAuth()

  const [citas, setCitas] = useState<Cita[]>([]) 
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
    obtenerCitas();
  }, [usuario]);

  async function obtenerCitas() {
    if (!usuario?.pacienteId) {
      setCargando(false)
      return;
    }
    try {
      const respuesta = await getCitasPorPaciente(Number(usuario.pacienteId));
      if (respuesta.success) setCitas(respuesta.data); 
    } catch (error) {
      console.error("Error al descargar citas:", error);
    } finally {
      setCargando(false);
    }
  }

  function abrirModalCita(cita: Cita) {
    setCitaSeleccionada(cita)
    setModoReagendar(false)
    setNuevaFecha("")
    setNuevaHora("")
    setMotivoReagendar("")
  }

  async function handleConfirmar(id: number) {
    setProcesando(true)
    try {
      const res = await confirmarCita(id)
      if (res.success) {
        await obtenerCitas()
        setCitaSeleccionada(null)
      }
    } catch { alert("Error al confirmar") }
    finally { setProcesando(false) }
  }

  async function handleCancelar(id: number) {
    if (!confirm("¿Estás seguro de que quieres cancelar esta cita?")) return
    setProcesando(true)
    try {
      const res = await cancelarCita(id)
      if (res.success) {
        await obtenerCitas()
        setCitaSeleccionada(null)
      }
    } catch { alert("Error al cancelar cita") }
    finally { setProcesando(false) }
  }

  async function handleReagendar() {
  if (!nuevaFecha || !nuevaHora || !motivoReagendar.trim()) {
    alert("Por favor completa la nueva fecha, hora y motivo.")
    return
  }
  setProcesando(true)
  try {
    if (!citaSeleccionada) return
    // ENVIAMOS 'pendiente' porque el paciente está proponiendo
    const res = await reagendarCita(citaSeleccionada.id, nuevaFecha, nuevaHora, motivoReagendar, 'pendiente')
    if (res.success) {
      alert("Tu propuesta de cambio ha sido enviada al psicólogo.")
      await obtenerCitas()
      setCitaSeleccionada(null)
      setModoReagendar(false)
    }
  } catch { alert("Error de conexión al reagendar") }
  finally { setProcesando(false) }
}

  const citasProximas = citas
    .filter(c => !esPasada(c.fecha) && c.estado !== "cancelada" && c.estado !== "completada")
    .sort((a, b) => a.fecha.localeCompare(b.fecha))

  const historialCitas = citas
    .filter(c => esPasada(c.fecha) || c.estado === "cancelada" || c.estado === "completada")
    .sort((a, b) => b.fecha.localeCompare(a.fecha))

  const proximaCita = citasProximas.find(c => c.estado === "confirmada") ?? citasProximas[0]
  const tareasPendientes = TAREAS_MOCK.filter(t => t.estado === "pendiente").length

  if (cargando) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
        <p className="text-slate-500 font-medium">Cargando tu información...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavbarPaciente />

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 min-h-screen bg-white border-r border-slate-100 flex flex-col p-5 gap-5 flex-shrink-0">
          <div className="pt-2">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Bienvenido de vuelta</p>
            <h2 className="text-xl font-bold text-dark capitalize">{usuario?.nombre ?? "Paciente"} 👋</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background rounded-xl p-3 text-center border border-slate-100">
              <p className="text-2xl font-bold text-dark">{citasProximas.length}</p>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">Próximas</p>
            </div>
            <div className="bg-background rounded-xl p-3 text-center border border-slate-100">
              <p className="text-2xl font-bold text-amber-500">{tareasPendientes}</p>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">Tareas</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {proximaCita ? (
              <div onClick={() => abrirModalCita(proximaCita)} className="bg-dark rounded-2xl p-4 cursor-pointer hover:opacity-95 transition-all hover:shadow-lg group">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Próxima cita</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${proximaCita.estado === "confirmada" ? "bg-emerald-500 text-white" : "bg-orange-400 text-white"}`}>
                    {etiquetaEstadoCita(proximaCita.estado)}
                  </span>
                </div>
                <p className="text-white font-bold text-sm leading-snug mb-1 capitalize">{formatearFecha(proximaCita.fecha)}</p>
                <p className="text-slate-400 text-xs font-medium">{proximaCita.hora.slice(0, 5)} hrs</p>
              </div>
            ) : (
              <div className="bg-background rounded-2xl p-4 text-center border-2 border-dashed border-slate-200">
                <p className="text-sm text-slate-400 font-medium">Sin citas próximas</p>
              </div>
            )}

            {/* === NUEVO BOTÓN AQUÍ === */}
            <button 
              onClick={() => setModalCitaAbierto(true)} 
              className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 border border-primary/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Agendar Nueva Cita
            </button>
          </div>

          <nav className="flex flex-col gap-1 mt-4">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 px-2">Navegación</p>
            <button onClick={() => setSeccionActiva("citas")} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left ${seccionActiva === "citas" ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}>
              <span>Mis Citas</span>
              {citasProximas.length > 0 && <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-md font-bold ${seccionActiva === "citas" ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>{citasProximas.length}</span>}
            </button>
            <button onClick={() => setSeccionActiva("tareas")} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left ${seccionActiva === "tareas" ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}>
              <span>Mis Tareas</span>
              {tareasPendientes > 0 && <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-md font-bold ${seccionActiva === "tareas" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-600"}`}>{tareasPendientes}</span>}
            </button>
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          {seccionActiva === "citas" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-dark">Mis Citas</h1>
                  <p className="text-slate-400 text-sm mt-0.5 font-medium">{citas.length} citas en total</p>
                </div>
              </div>

              {citasProximas.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Próximas y Pendientes</h2>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    {citasProximas.map((cita) => (
                      <div key={cita.id} onClick={() => abrirModalCita(cita)} className="bg-white rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all border border-slate-100 hover:border-primary group">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                              <p className="text-lg font-bold text-primary leading-none">{new Date(cita.fecha + "T12:00:00").getDate()}</p>
                              <p className="text-[10px] font-bold uppercase text-primary mt-0.5">{new Date(cita.fecha + "T12:00:00").toLocaleDateString("es-MX", { month: "short" }).replace(".", "")}</p>
                            </div>
                            <div>
                              <p className="font-bold text-dark capitalize mb-0.5">{new Date(cita.fecha + "T12:00:00").toLocaleDateString("es-MX", { weekday: "long" })}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  {cita.hora.slice(0, 5)} hrs
                                </p>
                              </div>
                            </div>
                          </div>
                          <span className={`text-[10px] px-2.5 py-1.5 rounded-md font-bold uppercase tracking-wider flex-shrink-0 ${colorEstadoCita(cita.estado)}`}>{etiquetaEstadoCita(cita.estado)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {historialCitas.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Historial</h2>
                  <div className="flex flex-col gap-2">
                    {historialCitas.map((cita) => (
                      <div key={cita.id} onClick={() => abrirModalCita(cita)} className="bg-white rounded-xl px-5 py-4 cursor-pointer hover:shadow-sm transition-all border border-slate-100 hover:border-slate-200 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center justify-center flex-shrink-0">
                            <p className="text-sm font-bold text-slate-500 leading-none">{new Date(cita.fecha + "T12:00:00").getDate()}</p>
                            <p className="text-[9px] font-bold uppercase text-slate-400 mt-0.5">{new Date(cita.fecha + "T12:00:00").toLocaleDateString("es-MX", { month: "short" }).replace(".", "")}</p>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-dark capitalize">{new Date(cita.fecha + "T12:00:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs font-medium text-slate-400">{cita.hora.slice(0, 5)} hrs</p>
                              {cita.feedback && <span className="text-[10px] text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded flex items-center gap-1">Con nota</span>}
                            </div>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2.5 py-1.5 rounded-md font-bold uppercase tracking-wider ${colorEstadoCita(cita.estado)}`}>{etiquetaEstadoCita(cita.estado)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* MODAL DETALLES DE CITA */}
      {citaSeleccionada && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setCitaSeleccionada(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${colorEstadoCita(citaSeleccionada.estado)}`}>{etiquetaEstadoCita(citaSeleccionada.estado)}</span>
                <h3 className="text-xl font-bold text-dark mt-3 capitalize">{formatearFecha(citaSeleccionada.fecha)}</h3>
                <p className="text-slate-500 text-sm font-medium mt-1">{citaSeleccionada.hora.slice(0, 5)} hrs</p>
              </div>
              <button onClick={() => setCitaSeleccionada(null)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>

            {modoReagendar ? (
              <div className="space-y-3 mt-4 border-t border-slate-100 pt-4">
                <p className="text-sm font-bold text-dark">Proponer nueva fecha y hora</p>
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" value={nuevaFecha} min={new Date().toISOString().split("T")[0]} onChange={e => setNuevaFecha(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-dark focus:ring-primary outline-none font-medium" />
                  <select
                    value={nuevaHora}
                    onChange={e => setNuevaHora(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-dark focus:ring-primary outline-none bg-white font-medium"
                  >
                    <option value="">Hora...</option>
                    {opcionesHoras.map(h => <option key={h} value={h}>{h} hrs</option>)}
                  </select>
                </div>
                <textarea placeholder="Motivo del cambio (ej. se me complicó el trabajo)..." value={motivoReagendar} onChange={e => setMotivoReagendar(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-dark resize-none focus:ring-primary outline-none" rows={2} />
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setModoReagendar(false)} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">Atrás</button>
                  <button onClick={handleReagendar} disabled={procesando} className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-bold hover:bg-primary-hover transition-colors disabled:opacity-50">{procesando ? "Enviando..." : "Confirmar Cambio"}</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-4 border-t border-slate-100 pt-4">
                
                {/* Lógica del Balón: Si el psicólogo propuso la cita (reagendada), el paciente debe confirmar */}
                {citaSeleccionada.estado === "reagendada" && !esPasada(citaSeleccionada.fecha) && (
                  <div className="mb-4">
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 mb-3">
                      <p className="text-[10px] text-orange-600 font-bold uppercase mb-1 tracking-wider">Tu psicólogo te propone este horario</p>
                      <p className="text-sm text-dark italic">"{citaSeleccionada.motivo || "No especificó motivo"}"</p>
                    </div>
                    <button 
                      onClick={() => handleConfirmar(citaSeleccionada.id)} 
                      disabled={procesando} 
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors text-sm shadow-sm flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      Aceptar y Confirmar Cita
                    </button>
                  </div>
                )}

                {citaSeleccionada.feedback && (
                  <div className="mb-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
                    <p className="text-[10px] text-blue-500 font-bold uppercase mb-1 tracking-wider">Nota de tu Psicólogo</p>
                    <p className="text-sm text-dark italic">"{citaSeleccionada.feedback}"</p>
                  </div>
                )}

                {citaSeleccionada.estado !== "cancelada" && citaSeleccionada.estado !== "completada" && !esPasada(citaSeleccionada.fecha) && (
                  <>
                    {citaSeleccionada.estado !== "reagendada" && (
                      <button onClick={() => setModoReagendar(true)} className="w-full border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold py-2.5 rounded-xl transition-colors text-sm">Proponer otro horario</button>
                    )}
                    {citaSeleccionada.estado === "reagendada" && (
                      <button onClick={() => setModoReagendar(true)} className="w-full border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold py-2.5 rounded-xl transition-colors text-sm">No puedo, proponer otra hora</button>
                    )}
                    <button onClick={() => handleCancelar(citaSeleccionada.id)} disabled={procesando} className="w-full text-red-500 hover:bg-red-50 font-bold py-2.5 rounded-xl transition-colors text-sm mt-1">{procesando ? "Cancelando..." : "Cancelar cita"}</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL SOLICITAR CITA */}
      <ModalSolicitarCita
        abierto={modalCitaAbierto}
        onCerrar={() => setModalCitaAbierto(false)}
        onGuardar={async (datos) => {
          setProcesando(true);
          try {
            const nuevaCita = {
              pacienteId: Number(usuario?.pacienteId),
              profesionalId: 1, 
              fecha: datos.fecha,
              hora: datos.hora,
              estado: "pendiente",
              duracion: 60,
              motivo: datos.motivo || "Solicitada por el paciente"
            };
            const respuesta = await crearCita(nuevaCita as any);
            
            if (respuesta.success) {
              setModalCitaAbierto(false); // AHORA SÍ SE CIERRA
              alert("Tu solicitud de cita ha sido enviada. El psicólogo la revisará pronto.");
              await obtenerCitas(); 
            } else {
              alert("Error al solicitar la cita: " + respuesta.message);
            }
          } catch (error) { 
            console.error(error); 
            alert("Error de conexión al solicitar la cita");
          } finally {
            setProcesando(false);
          }
        }}
      />
    </div>
  )
}