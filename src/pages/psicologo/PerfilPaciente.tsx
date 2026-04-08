// ===========================
// src/pages/psicologo/PerfilPaciente.tsx
// ===========================

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../../components/layout/Navbar"
import type { Paciente, Cita, Tarea, EstadoCita } from "../../types"
import ModalNuevaTarea, { type DatosTarea } from "../../components/ui/ModalNuevaTarea"
import { getPaciente } from "../../services/api"

function calcularEdad(fechaNacimiento: string) {
  const hoy = new Date()
  const nacimiento = new Date(fechaNacimiento)
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--
  return edad
}

function colorEstadoCita(estado: EstadoCita) {
  switch (estado) {
    case "confirmada": return "bg-green-50 text-green-600"
    case "cancelada":  return "bg-red-50 text-red-500"
    case "pendiente":  return "bg-yellow-50 text-yellow-600"
  }
}

function colorEstadoTarea(estado: string) {
  switch (estado) {
    case "revisada":  return "bg-green-50 text-green-600"
    case "entregada": return "bg-blue-50 text-blue-600"
    default:          return "bg-yellow-50 text-yellow-600"
  }
}

export default function PerfilPaciente() {
  const { pacienteId } = useParams()
  const navigate = useNavigate()

  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState("")

  // Citas y tareas siguen en mock por ahora — se conectarán cuando PHP tenga esas rutas
  const [citas, setCitas] = useState<Cita[]>([])
  const tareas: Tarea[] = []

  const [modalTareaAbierto, setModalTareaAbierto] = useState(false)
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null)
  const [textoFeedback, setTextoFeedback] = useState("")
  const [loadingFeedback, setLoadingFeedback] = useState(false)
  const [exitoFeedback, setExitoFeedback] = useState(false)

  const proximaCita = citas.find(c => c.estado === "confirmada")

  useEffect(() => {
    if (!pacienteId) return
    cargarPaciente()
  }, [pacienteId])

  async function cargarPaciente() {
    try {
      setCargando(true)
      setError("")
      const respuesta = await getPaciente(Number(pacienteId))
      console.log("Respuesta del backend:", respuesta)
      if (respuesta.success) {
        setPaciente(respuesta.data)
      } else {
        setError("No se pudo cargar el perfil del paciente")
      }
    } catch {
      setError("Error de conexión con el servidor")
    } finally {
      setCargando(false)
    }
  }

  function abrirModalFeedback(cita: Cita) {
    setCitaSeleccionada(cita)
    setTextoFeedback(cita.feedback ?? "")
    setExitoFeedback(false)
  }

  function cerrarModalFeedback() {
    setCitaSeleccionada(null)
    setTextoFeedback("")
    setExitoFeedback(false)
  }

  async function handleGuardarFeedback() {
    if (!textoFeedback.trim() || !citaSeleccionada) return
    setLoadingFeedback(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      setCitas(prev => prev.map(c =>
        c.id === citaSeleccionada.id ? { ...c, feedback: textoFeedback } : c
      ))
      setExitoFeedback(true)
    } catch {
      alert("Error al guardar. Intenta de nuevo.")
    } finally {
      setLoadingFeedback(false)
    }
  }

  // Estados de carga / error
  if (cargando) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !paciente) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center py-32">
          <p className="text-red-500 font-medium">{error || "Paciente no encontrado"}</p>
          <button onClick={() => navigate("/psicologo/pacientes")} className="mt-3 text-sm text-primary hover:underline">
            Volver a pacientes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-5xl mx-auto p-6">

        <button
          onClick={() => navigate("/psicologo/pacientes")}
          className="text-sm text-slate-400 hover:text-dark transition-colors mb-4 flex items-center gap-1"
        >
          ← Volver a pacientes
        </button>

        {/* Header del perfil */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
                {paciente.nombre[0]}{paciente.apellido[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-dark">
                  {paciente.nombre} {paciente.apellido}
                  {paciente.apellidoMaterno && ` ${paciente.apellidoMaterno}`}
                </h1>
                <p className="text-slate-500 text-sm">
                  {calcularEdad(paciente.fechaNacimiento)} años · Paciente #{pacienteId}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Registrado el {new Date(paciente.fechaRegistro + "T12:00:00").toLocaleDateString("es-MX")}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/psicologo/expedientes/${pacienteId}`)}
              className="bg-primary hover:bg-primary-hover text-white font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              Ver expediente clínico
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Columna izquierda */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-semibold text-dark mb-4">Información personal</h3>
              <div className="flex flex-col gap-3 text-sm">
                <div>
                  <p className="text-slate-400 text-xs mb-1">Correo electrónico</p>
                  <p className="text-dark">{paciente.email}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Teléfono</p>
                  <p className="text-dark">{paciente.telefono}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Fecha de nacimiento</p>
                  <p className="text-dark">
                    {new Date(paciente.fechaNacimiento + "T12:00:00").toLocaleDateString("es-MX")}
                  </p>
                </div>
              </div>
            </div>

            {/* Contacto de emergencia — mock por ahora */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-semibold text-dark mb-4">Contacto de emergencia</h3>
              <p className="text-xs text-slate-400">Por conectar con PHP</p>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* CITAS */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-dark">Citas</h3>
                <span className="text-xs text-slate-400">{citas.length} en total</span>
              </div>
              {citas.length === 0 ? (
                <p className="text-sm text-slate-400">No hay citas registradas</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {citas.map((cita) => (
                    <button
                      key={cita.id}
                      onClick={() => abrirModalFeedback(cita)}
                      className="flex items-center justify-between p-3 bg-background rounded-xl hover:bg-slate-100 transition-colors text-left w-full group"
                    >
                      <div>
                        <p className="text-sm font-medium text-dark">
                          {new Date(cita.fecha + "T12:00:00").toLocaleDateString("es-MX", {
                            weekday: "long", year: "numeric", month: "long", day: "numeric"
                          })}
                        </p>
                        <p className="text-xs text-slate-400">{cita.hora} hrs</p>
                        {cita.feedback && (
                          <p className="text-xs text-primary mt-1 truncate max-w-xs">💬 {cita.feedback}</p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${colorEstadoCita(cita.estado)}`}>
                        {cita.estado}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* TAREAS */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-dark">Tareas asignadas</h3>
                <button
                  onClick={() => setModalTareaAbierto(true)}
                  className="text-xs text-primary hover:text-primary-hover font-medium"
                >
                  + Nueva tarea
                </button>
              </div>
              {tareas.length === 0 ? (
                <p className="text-sm text-slate-400">No hay tareas asignadas</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {tareas.map((tarea) => (
                    <button
                      key={tarea.id}
                      onClick={() => navigate(`/psicologo/pacientes/${pacienteId}/tareas/${tarea.id}`)}
                      className="flex items-center justify-between p-3 bg-background rounded-xl hover:bg-slate-100 transition-colors text-left w-full"
                    >
                      <div>
                        <p className="text-sm font-medium text-dark">{tarea.titulo}</p>
                        {tarea.fechaLimite && (
                          <p className="text-xs text-slate-400">
                            Entrega: {new Date(tarea.fechaLimite + "T12:00:00").toLocaleDateString("es-MX")}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${colorEstadoTarea(tarea.estado)}`}>
                        {tarea.estado}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <ModalNuevaTarea
        abierto={modalTareaAbierto}
        onCerrar={() => setModalTareaAbierto(false)}
        onGuardar={(datos: DatosTarea) => {
          console.log("Guardar tarea:", datos)
          setModalTareaAbierto(false)
        }}
        nombrePaciente={paciente ? `${paciente.nombre} ${paciente.apellido}` : ""}
        proximaCitaFecha={proximaCita?.fecha}
      />

      {citaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={cerrarModalFeedback}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-dark">Retroalimentación</h2>
              <button onClick={cerrarModalFeedback} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
            </div>
            <div className="bg-background rounded-xl px-4 py-3 mb-5">
              <p className="text-sm font-medium text-dark">
                {new Date(citaSeleccionada.fecha + "T12:00:00").toLocaleDateString("es-MX", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric"
                })}
              </p>
              <p className="text-xs text-slate-400 mt-1">{citaSeleccionada.hora} hrs</p>
            </div>
            {exitoFeedback ? (
              <div className="text-center py-4">
                <p className="font-semibold text-dark mb-1">¡Retroalimentación guardada!</p>
                <button onClick={cerrarModalFeedback} className="mt-4 w-full bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-xl transition-colors">
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                <textarea
                  value={textoFeedback}
                  onChange={e => setTextoFeedback(e.target.value)}
                  placeholder="Escribe observaciones para el paciente..."
                  rows={5}
                  autoFocus
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                />
                <div className="flex gap-3 mt-4">
                  <button onClick={cerrarModalFeedback} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm">
                    Cancelar
                  </button>
                  <button
                    onClick={handleGuardarFeedback}
                    disabled={loadingFeedback || !textoFeedback.trim()}
                    className="flex-1 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-2.5 rounded-xl transition-colors font-medium text-sm"
                  >
                    {loadingFeedback ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}