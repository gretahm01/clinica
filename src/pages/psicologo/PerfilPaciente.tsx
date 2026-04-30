// ===========================
// src/pages/psicologo/PerfilPaciente.tsx
// ===========================

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../../components/layout/Navbar"
import Swal from 'sweetalert2'
import { Trash2 } from "lucide-react"

import type { Paciente, Cita, Tarea, EstadoCita } from "../../types"
import ModalNuevaCita, { type DatosCita } from "../../components/ui/ModalNuevaCita"
import ModalNuevaTarea, { type DatosTarea } from "../../components/ui/ModalNuevaTarea"

import { 
  getPaciente, 
  getCitasPorPaciente, 
  cancelarCita, 
  confirmarCita, 
  completarCita, 
  guardarFeedbackCita, 
  guardarNotasCita,
  getContactoEmergencia,
  guardarContactoEmergencia,
  crearCita,
  getTareasPorPaciente,
  crearTarea,
  eliminarTarea
} from "../../services/api"

// Funciones de Ayuda
function calcularEdad(fechaNacimiento: string) {
  const hoy = new Date(); 
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
}

function colorEstadoCita(estado: EstadoCita) {
  const e = estado?.toLowerCase().trim();
  switch (e) {
    case "confirmada": return "bg-emerald-50 text-emerald-600 border border-emerald-100"
    case "pendiente":  return "bg-orange-50 text-orange-600 border border-orange-100"
    case "reagendada": return "bg-red-50 text-red-600 border border-red-100"
    case "cancelada":  return "bg-slate-50 text-slate-500 border border-slate-100"
    case "completada": return "bg-blue-50 text-blue-600 border border-blue-100"
    default:           return "bg-slate-50 text-slate-500 border border-slate-100"
  }
}

function colorEstadoTarea(estado: string) {
  switch (estado) {
    case "revisada":  return "bg-emerald-50 text-emerald-600 border border-emerald-100"
    case "entregada": return "bg-blue-50 text-blue-600 border border-blue-100"
    default:          return "bg-amber-50 text-amber-600 border border-amber-100"
  }
}

function obtenerMotivoLimpio(motivo: string) {
  if (!motivo) return "";
  return motivo.replace("[Paciente] ", "").replace("[Psicólogo] ", "");
}

export default function PerfilPaciente() {
  const { pacienteId } = useParams()
  const navigate = useNavigate()

  // Estados del Perfil
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState("")
  const [citas, setCitas] = useState<Cita[]>([])
  const [contacto, setContacto] = useState<{nombre: string, telefono: string, parentesco: string} | null>(null)
  const [tareas, setTareas] = useState<Tarea[]>([])

  // Estados de Modales
  const [modalCitaAbierto, setModalCitaAbierto] = useState(false)
  const [modalTareaAbierto, setModalTareaAbierto] = useState(false)
  
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null)
  const [textoFeedback, setTextoFeedback] = useState("")
  const [misNotas, setMisNotas] = useState("")
  const [loadingFeedback, setLoadingFeedback] = useState(false)
  const [exitoFeedback, setExitoFeedback] = useState(false)

  const [modalContactoOpen, setModalContactoOpen] = useState(false)
  const [formContacto, setFormContacto] = useState({ nombre: "", telefono: "", parentesco: "" })
  const [guardandoContacto, setGuardandoContacto] = useState(false)

  const [citaACancelar, setCitaACancelar] = useState<Cita | null>(null)
  const [loadingCancelar, setLoadingCancelar] = useState(false)
  
  const [citaAConfirmar, setCitaAConfirmar] = useState<Cita | null>(null)
  const [loadingConfirmar, setLoadingConfirmar] = useState(false)

  // Carga Inicial
  useEffect(() => { 
    if (pacienteId) cargarTodo() 
  }, [pacienteId])

  async function cargarTodo() {
    setCargando(true)
    await Promise.all([
      cargarPaciente(), 
      cargarCitas(), 
      cargarContactoEmergencia(), 
      cargarTareas()
    ])
    setCargando(false)
  }

  async function cargarPaciente() {
    try {
      const res = await getPaciente(Number(pacienteId))
      if (res.success) {
        setPaciente(res.data)
      } else {
        setError("No se pudo cargar el perfil")
      }
    } catch { 
      setError("Error de conexión") 
    }
  }

  async function cargarCitas() {
    try { 
      const res = await getCitasPorPaciente(Number(pacienteId)); 
      if (res.success) setCitas(res.data) 
    } catch (e) {
      console.error(e)
    }
  }

  async function cargarContactoEmergencia() {
    try { 
      const res = await getContactoEmergencia(Number(pacienteId)); 
      if (res.success && res.data?.nombre) {
        setContacto(res.data);
      } else {
        setContacto(null)
      }
    } catch (e) {
      console.error(e)
    }
  }

  async function cargarTareas() {
    try { 
      const res = await getTareasPorPaciente(Number(pacienteId)); 
      if (res.success) setTareas(res.data) 
    } catch (e) {
      console.error(e)
    }
  }

  // Acciones (Guardar, Confirmar, Cancelar)
  async function handleGuardarCita(datos: DatosCita) {
    try {
      const motivoConEtiqueta = "[Psicólogo] " + (datos.motivo || "Agendada desde perfil");
      const res = await crearCita({ 
        ...datos, 
        pacienteId: Number(pacienteId), 
        profesionalId: 0, 
        estado: "pendiente", 
        motivo: motivoConEtiqueta 
      } as any)
      
      if (res.success) { 
        setModalCitaAbierto(false); 
        await cargarCitas() 
      } else {
        alert(res.message ?? "Error")
      }
    } catch { 
      alert("Error de conexión") 
    }
  }

  async function handleGuardarContacto() {
    setGuardandoContacto(true)
    try {
      const res = await guardarContactoEmergencia(Number(pacienteId), formContacto)
      if (res.success) { 
        setContacto(formContacto); 
        setModalContactoOpen(false) 
      }
    } catch { 
      alert("Error") 
    } finally { 
      setGuardandoContacto(false) 
    }
  }

  function abrirModalContacto() {
    if (contacto) {
      setFormContacto({ nombre: contacto.nombre, telefono: contacto.telefono, parentesco: contacto.parentesco })
    } else {
      setFormContacto({ nombre: "", telefono: "", parentesco: "" })
    }
    setModalContactoOpen(true)
  }

  async function handleCancelarCita() {
    if (!citaACancelar) return
    setLoadingCancelar(true)
    try {
      const res = await cancelarCita(citaACancelar.id)
      if (res.success) { 
        setCitas(prev => prev.map(c => c.id === citaACancelar.id ? { ...c, estado: "cancelada" as EstadoCita } : c)); 
        setCitaACancelar(null) 
      }
    } finally { 
      setLoadingCancelar(false) 
    }
  }

  async function handleConfirmarCita() {
    if (!citaAConfirmar) return
    setLoadingConfirmar(true)
    try {
      const res = await confirmarCita(citaAConfirmar.id)
      if (res.success) { 
        setCitas(prev => prev.map(c => c.id === citaAConfirmar.id ? { ...c, estado: "confirmada" as EstadoCita } : c)); 
        setCitaAConfirmar(null) 
      }
    } finally { 
      setLoadingConfirmar(false) 
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
        setCitas(prev => prev.map(c => c.id === citaSeleccionada.id ? { ...c, estado: "completada" as EstadoCita, feedback: textoFeedback, notes: misNotas } : c)); 
        setExitoFeedback(true) 
      }
    } finally { 
      setLoadingFeedback(false) 
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
      setCitas(prev => prev.map(c => c.id === citaSeleccionada.id ? { ...c, feedback: textoFeedback, notes: misNotas } : c))
      setExitoFeedback(true)
    } finally { 
      setLoadingFeedback(false) 
    }
  }

  function abrirModalFeedback(cita: Cita) { 
    setCitaSeleccionada(cita); 
    setTextoFeedback(cita.feedback ?? ""); 
    setMisNotas(cita.notes ?? ""); 
    setExitoFeedback(false) 
  }

  async function handleEliminarTarea(id: number) {
    const r = await Swal.fire({ 
      title: '¿Eliminar?', 
      text: "No se puede deshacer", 
      showCancelButton: true, 
      confirmButtonText: 'Sí, eliminar', 
      cancelButtonText: 'Cancelar', 
      reverseButtons: true, 
      background: '#ffffff', 
      color: '#334155', 
      confirmButtonColor: '#f87171', 
      cancelButtonColor: '#94a3b8', 
      borderRadius: '1.5rem' 
    });
    
    if (r.isConfirmed) {
      try {
        const res = await eliminarTarea(id);
        if (res.success) { 
          setTareas(prev => prev.filter(t => t.id !== id)); 
          Swal.fire({ title: 'Eliminada', icon: 'success', iconColor: '#a3b18a', timer: 1500, showConfirmButton: false, borderRadius: '1.5rem' }); 
        }
      } catch { 
        Swal.fire({ title: 'Error', text: 'No se pudo', icon: 'error', borderRadius: '1.5rem' }); 
      }
    }
  }

  async function handleGuardarTarea(datos: DatosTarea) {
    try {
      const res = await crearTarea({ 
        pacienteId: Number(pacienteId), 
        profesionalId: 0, 
        titulo: datos.titulo, 
        contenido: datos.contenido, 
        fechaLimite: datos.fechaLimite, 
        estado: "pendiente" 
      } as any)
      
      if (res.success) { 
        await cargarTareas(); 
        setModalTareaAbierto(false) 
      } else {
        alert(res.message ?? "Error")
      }
    } catch { 
      alert("Error de conexión") 
    }
  }

  // Renderizados Condicionales
  if (cargando) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !paciente) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex flex-1 flex-col items-center justify-center">
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button 
            onClick={() => navigate("/psicologo/pacientes")} 
            className="text-sm text-primary hover:underline bg-white px-6 py-2 rounded-lg border border-slate-200"
          >
            Volver a pacientes
          </button>
        </div>
      </div>
    )
  }

  const proximaCita = citas.find(c => c.estado === "confirmada" || c.estado === "pendiente");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        
        <button 
          onClick={() => navigate("/psicologo/pacientes")} 
          className="text-sm text-slate-400 hover:text-dark transition-colors mb-4 flex items-center gap-1 font-medium"
        >
          ← Volver a pacientes
        </button>

        {/* Encabezado del Perfil */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl uppercase flex-shrink-0">
              {paciente.nombre[0]}{paciente.apellido[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-dark capitalize">
                {paciente.nombre} {paciente.apellido} {paciente.apellidoMaterno}
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">
                {calcularEdad(paciente.fechaNacimiento)} años · Paciente #{pacienteId}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={() => setModalCitaAbierto(true)} 
              className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg> 
              Agendar Cita
            </button>
            <button 
              onClick={() => navigate(`/psicologo/expedientes/${pacienteId}`)} 
              className="flex-1 md:flex-none bg-primary hover:bg-primary-hover text-white font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              Expediente Clínico
            </button>
          </div>
        </div>

        {/* Columnas Principales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUMNA IZQUIERDA */}
          <div className="flex flex-col gap-6">
            
            {/* Información Personal */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
              <h3 className="font-bold text-dark mb-4 border-b border-slate-100 pb-3">Información Personal</h3>
              <div className="flex flex-col gap-4 text-sm">
                <div>
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">Correo electrónico</p>
                  <p className="text-dark font-medium">{paciente.email}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">Teléfono</p>
                  <p className="text-dark font-medium">{paciente.phone || paciente.telefono || "No registrado"}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">Fecha de Ingreso</p>
                  <p className="text-dark font-medium">
                    {new Date(paciente.fechaRegistro + "T12:00:00").toLocaleDateString("es-MX", { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Contacto de Emergencia */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h3 className="font-bold text-dark">Contacto de Emergencia</h3>
                <button 
                  onClick={abrirModalContacto} 
                  className="text-xs text-primary font-bold hover:underline bg-primary/10 px-2 py-1 rounded-md"
                >
                  {contacto ? "Editar" : "+ Agregar"}
                </button>
              </div>
              
              {contacto ? (
                <div className="flex flex-col gap-1 text-sm text-dark">
                  <p className="font-bold text-base capitalize">{contacto.nombre}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <p className="text-slate-600 font-medium">{contacto.telefono}</p>
                  </div>
                  <p className="text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-500 px-2 py-1 rounded-md w-fit mt-2">
                    {contacto.parentesco}
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-slate-400 italic mb-2">No hay contacto registrado</p>
                </div>
              )}
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Historial de Citas Rápido */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
              <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
                <h3 className="font-bold text-dark">Historial de Citas</h3>
                <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
                  {citas.length} citas totales
                </span>
              </div>
              
              {citas.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl">
                  <p className="text-slate-400 font-medium mb-2">No hay citas registradas</p>
                  <button 
                    onClick={() => setModalCitaAbierto(true)} 
                    className="text-sm text-primary font-bold hover:underline"
                  >
                    Agendar la primera cita
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {citas.slice().reverse().map(cita => (
                    <div key={cita.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors gap-4">
                      
                      <button onClick={() => abrirModalFeedback(cita)} className="flex-1 text-left flex items-start gap-4 focus:outline-none">
                        <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-slate-100 flex flex-col items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-dark leading-none">
                            {new Date(cita.fecha + "T12:00:00").getDate()}
                          </span>
                          <span className="text-[10px] font-bold uppercase text-slate-400">
                            {new Date(cita.fecha + "T12:00:00").toLocaleDateString("es-MX", {month: 'short'}).replace(".","")}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-dark capitalize mb-0.5">
                            {new Date(cita.fecha + "T12:00:00").toLocaleDateString("es-MX", {weekday: 'long', year: 'numeric'})}
                          </p>
                          <div className="flex items-center gap-3">
                            <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {cita.hora.slice(0,5)} hrs
                            </p>
                            {(cita.feedback || cita.notes) && (
                              <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                Con Notas
                              </span>
                            )}
                          </div>
                        </div>
                      </button>

                      <div className="flex items-center justify-end gap-2 sm:border-l sm:border-slate-200 sm:pl-4">
                        <span className={`text-[10px] px-2.5 py-1.5 rounded-md font-bold uppercase tracking-wider ${colorEstadoCita(cita.estado)}`}>
                          {cita.estado}
                        </span>
                        
                        <div className="flex flex-col gap-1 w-24">
                          {/* LÓGICA DE ESTADOS EN LISTA RÁPIDA */}
                          {(() => {
                            const estaPendiente = cita.estado === "pendiente" || cita.estado === "reagendada";
                            const iniciadaPorPsicologo = cita.motivo?.startsWith("[Psicólogo]");
                            
                            if (estaPendiente) {
                              if (iniciadaPorPsicologo) {
                                return (
                                  <span className="text-[9px] text-slate-400 font-bold uppercase text-right leading-tight">
                                    Espera de pac.
                                  </span>
                                );
                              } else {
                                return (
                                  <button 
                                    onClick={() => setCitaAConfirmar(cita)} 
                                    className="text-[10px] bg-white border border-emerald-200 text-emerald-600 font-bold px-2 py-1 rounded hover:bg-emerald-50 transition-colors shadow-sm"
                                  >
                                    Aceptar
                                  </button>
                                );
                              }
                            }
                            return null;
                          })()}
                          
                          {cita.estado !== "cancelada" && cita.estado !== "completada" && (
                            <button 
                              onClick={() => setCitaACancelar(cita)} 
                              className="text-[10px] text-slate-400 font-bold px-2 py-1 rounded hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tareas Asignadas */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
              <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
                <h3 className="font-bold text-dark">Tareas Asignadas</h3>
                <button 
                  onClick={() => setModalTareaAbierto(true)} 
                  className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-md hover:bg-primary hover:text-white transition-colors"
                >
                  + Nueva Tarea
                </button>
              </div>
              
              {tareas.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-400 italic">No hay tareas asignadas a este paciente</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {tareas.map((tarea) => (
                    <div key={tarea.id} className="group flex items-center gap-2">
                      <button 
                        onClick={() => navigate(`/psicologo/pacientes/${pacienteId}/tareas/${tarea.id}`)} 
                        className="flex-1 flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 border border-slate-100 transition-colors text-left"
                      >
                        <div>
                          <p className="text-sm font-bold text-dark mb-1">{tarea.titulo}</p>
                          {tarea.fechaLimite && (
                            <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
                              </svg>
                              Entrega: {new Date(tarea.fechaLimite + "T12:00:00").toLocaleDateString("es-MX", { day: 'numeric', month: 'short' })}
                            </p>
                          )}
                        </div>
                        <span className={`text-[10px] px-2.5 py-1.5 rounded-md font-bold uppercase tracking-wider capitalize ${colorEstadoTarea(tarea.estado)}`}>
                          {tarea.estado}
                        </span>
                      </button>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEliminarTarea(tarea.id); }} 
                        className="p-4 text-red-500 bg-white rounded-xl hover:bg-red-50 transition-colors border border-red-100 flex items-center justify-center opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>

      {/* MODAL REGISTRO DE SESIÓN (Feedback + Notas) */}
      {citaSeleccionada && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={cerrarModalFeedback}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-dark">Registro de Sesión</h2>
              <button onClick={cerrarModalFeedback} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>

            {citaSeleccionada.estado === "cancelada" ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="font-bold text-red-600 mb-1">Cita Cancelada</p>
                <p className="text-sm text-slate-500 px-6">
                  No se puede proporcionar nota ni retroalimentación porque la cita fue cancelada.
                </p>
                <button 
                  onClick={cerrarModalFeedback} 
                  className="mt-6 w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl transition-colors border border-slate-200"
                >
                  Regresar
                </button>
              </div>
            ) : exitoFeedback ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-bold text-dark mb-1">¡Registro actualizado!</p>
                <button 
                  onClick={cerrarModalFeedback} 
                  className="mt-6 w-full bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-xl transition-colors"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* LÓGICA DE ESTADOS EN EL MODAL DEL HISTORIAL */}
                {(() => {
                  const estaPendiente = citaSeleccionada.estado === 'pendiente' || citaSeleccionada.estado === 'reagendada';
                  const iniciadaPorPsicologo = citaSeleccionada.motivo?.startsWith("[Psicólogo]");
                  const motivoLimpio = obtenerMotivoLimpio(citaSeleccionada.motivo || "");

                  if (estaPendiente) {
                    return (
                      <div className="mb-4">
                        {iniciadaPorPsicologo ? (
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                              En espera de confirmación
                            </p>
                            <p className="text-sm text-dark font-medium">
                              El paciente aún no confirma esta solicitud.
                            </p>
                          </div>
                        ) : (
                          <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-center mb-3">
                            <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider mb-1">
                              Acción Requerida
                            </p>
                            <p className="text-sm text-dark font-medium mb-1">
                              El paciente solicita este horario.
                            </p>
                            {motivoLimpio && (
                              <p className="text-xs text-orange-800 italic">"{motivoLimpio}"</p>
                            )}
                          </div>
                        )}
                        
                        {!iniciadaPorPsicologo && (
                          <button 
                            onClick={async () => { await handleConfirmarCita(); cerrarModalFeedback(); }} 
                            disabled={loadingConfirmar} 
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

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
                    Feedback Público (Visible para paciente)
                  </label>
                  <textarea 
                    value={textoFeedback} 
                    onChange={e => setTextoFeedback(e.target.value)} 
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none resize-none bg-slate-50" 
                    rows={3} 
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-blue-500 uppercase mb-1.5 tracking-wider">
                    Notas Privadas (Solo tú las ves)
                  </label>
                  <textarea 
                    value={misNotas} 
                    onChange={e => setMisNotas(e.target.value)} 
                    className="w-full border border-blue-100 bg-blue-50/30 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-400 outline-none resize-none" 
                    rows={3} 
                  />
                </div>
                
                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex gap-3">
                    <button 
                      onClick={cerrarModalFeedback} 
                      className="flex-1 border border-slate-200 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleGuardarTodo} 
                      disabled={loadingFeedback} 
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors border border-slate-200"
                    >
                      {loadingFeedback ? "Guardando..." : "Solo Guardar Notas"}
                    </button>
                  </div>
                  
                  {/* BOTÓN COMPLETAR SESIÓN */}
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
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL CONTACTO DE EMERGENCIA */}
      {modalContactoOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-dark mb-4">Contacto de Emergencia</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={formContacto.nombre} 
                  onChange={e => setFormContacto({...formContacto, nombre: e.target.value})} 
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teléfono</label>
                <input 
                  type="text" 
                  value={formContacto.telefono} 
                  onChange={e => setFormContacto({...formContacto, telefono: e.target.value})} 
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Parentesco</label>
                <input 
                  type="text" 
                  value={formContacto.parentesco} 
                  onChange={e => setFormContacto({...formContacto, parentesco: e.target.value})} 
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" 
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setModalContactoOpen(false)} 
                className="flex-1 py-2 text-sm font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button 
                onClick={handleGuardarContacto} 
                disabled={guardandoContacto} 
                className="flex-1 bg-primary text-white py-2 rounded-xl text-sm font-bold hover:bg-primary-hover"
              >
                {guardandoContacto ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALES PEQUEÑOS DE CONFIRMACIÓN / CANCELACIÓN */}
      {(citaACancelar || citaAConfirmar) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-xl">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${citaACancelar ? 'bg-red-50' : 'bg-emerald-50'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`w-7 h-7 ${citaACancelar ? 'text-red-500' : 'text-emerald-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {citaACancelar ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />}
              </svg>
            </div>
            <h3 className="text-lg font-bold text-dark mb-1">
              {citaACancelar ? "¿Cancelar esta cita?" : "¿Confirmar asistencia?"}
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Esta acción actualizará el estado en el calendario.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => {setCitaACancelar(null); setCitaAConfirmar(null)}} 
                className="flex-1 border border-slate-200 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-50"
              >
                Volver
              </button>
              <button 
                onClick={citaACancelar ? handleCancelarCita : handleConfirmarCita} 
                className={`flex-1 py-2.5 rounded-xl text-white font-bold ${citaACancelar ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
              >
                {loadingCancelar || loadingConfirmar ? "Cargando..." : "Sí, proceder"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALES ADICIONALES (Nueva Cita / Nueva Tarea) */}
      <ModalNuevaCita 
        abierto={modalCitaAbierto} 
        onCerrar={() => setModalCitaAbierto(false)} 
        onGuardar={handleGuardarCita} 
        pacientes={paciente ? [paciente] : []} 
        fechaInicial="" 
      />
      
      <ModalNuevaTarea 
        abierto={modalTareaAbierto} 
        onCerrar={() => setModalTareaAbierto(false)} 
        onGuardar={handleGuardarTarea} 
        nombrePaciente={paciente ? `${paciente.nombre} ${paciente.apellido}` : ""} 
        proximaCitaFecha={proximaCita?.fecha} 
      />
    </div>
  )
}