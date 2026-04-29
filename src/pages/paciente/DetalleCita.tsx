// ===========================
// src/pages/paciente/DetalleCita.tsx
// ===========================
// Página de detalle de una cita específica vista por el paciente.
// Se accede desde el dashboard al picarle a cualquier cita.
// Ruta: /paciente/citas/:citaId
//
// El paciente puede:
//   - Ver la fecha, hora y estado de la cita
//   - Ver la retroalimentación del psicólogo (si existe)
//   - Cancelar la cita (solo si está confirmada o pendiente)
//   - Reagendar la cita (solo si está confirmada o pendiente)
//
// Cuando PHP esté listo:
//   - getCita(citaId) → reemplaza CITAS_MOCK
//   - cancelarCita(citaId) → llama al endpoint real
//   - solicitarCita(datos) → para reagendar (crea nueva solicitud)
// ===========================

//Parte que se va a reemplazar por la conexión a PHP, sugerida por gemini
//import { useState } from "react"
//import { useParams, useNavigate } from "react-router-dom"
//import type { Cita, EstadoCita } from "../../types"
//import NavbarPaciente from "../../components/layout/NavbarPaciente"

import { useState, useEffect } from "react" // Agregamos useEffect
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth" // Para saber quién está logueado
import { getCitasPorPaciente, cancelarCita, confirmarCita, reagendarCita } from "../../services/api" // Conexión a PHP
import type { Cita, EstadoCita } from "../../types"
import NavbarPaciente from "../../components/layout/NavbarPaciente"


// ===========================
// DATOS MOCK
// Reemplazar con getCita(citaId) cuando PHP esté listo

//Pondre como comentario esto, porque ya tengo citas reales
// ===========================
//const CITAS_MOCK: Cita[] = [
//  {
//    id: 1,
//    pacienteId: 1,
//    profesionalId: 1,
//    fecha: "2026-04-01",
//    hora: "10:00",
//    estado: "confirmada",
//    feedback: undefined,
//  },
//  {
//    id: 2,
//    pacienteId: 1,
//    profesionalId: 1,
//    fecha: "2026-03-20",
//    hora: "10:00",
//    estado: "completada",
//    feedback: "Buen progreso esta sesión. Continúa con los ejercicios de respiración diafragmática que practicamos. Para la próxima sesión trae el diario de emociones completo.",
//  },
//  {
//    id: 3,
//    pacienteId: 1,
//    profesionalId: 1,
//    fecha: "2026-03-13",
//    hora: "10:00",
//    estado: "completada",
//    feedback: undefined,
//  },
//  {
//    id: 4,
//    pacienteId: 1,
//    profesionalId: 1,
//    fecha: "2026-03-05",
//    hora: "09:00",
//    estado: "cancelada",
//    feedback: undefined,
//  },
//]

// ===========================
// HELPERS
// ===========================

// Color del badge según el estado de la cita
function colorEstado(estado: EstadoCita) {
  switch (estado) {
    case "confirmada":  return "bg-green-50 text-green-600 border-green-100"
    case "pendiente":   return "bg-yellow-50 text-yellow-600 border-yellow-100"
    case "cancelada":   return "bg-red-50 text-red-500 border-red-100"
    case "completada":  return "bg-slate-100 text-slate-500 border-slate-200"
  }
}

// Etiqueta legible del estado
function etiquetaEstado(estado: EstadoCita) {
  switch (estado) {
    case "confirmada":  return "Confirmada"
    case "pendiente":   return "Por confirmar"
    case "cancelada":   return "Cancelada"
    case "completada":  return "Completada"
  }
}

// Formatea fecha "2026-04-01" en texto completo legible
function formatearFecha(fecha: string) {
  return new Date(fecha + "T12:00:00").toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// ===========================
// COMPONENTE PRINCIPAL
// ===========================
export default function DetalleCita() {

const { citaId } = useParams()
  const navigate   = useNavigate()
  const { usuario } = useAuth() // Sacamos el usuario

  // 1. Estados reales
  const [cita, setCita] = useState<Cita | null>(null)
  const [cargando, setCargando] = useState(true) // Pantalla de carga

  // Estados de los modales
  const [modalCancelar, setModalCancelar] = useState(false)
  const [modalReagendar, setModalReagendar] = useState(false)
  const [fechaNueva, setFechaNueva] = useState("")
  const [horaNueva, setHoraNueva] = useState("")
  const [motivoReagendar, setMotivoReagendar] = useState("")
  
  const [loadingCancelar, setLoadingCancelar]   = useState(false)
  const [loadingReagendar, setLoadingReagendar] = useState(false)
  const [loadingConfirmar, setLoadingConfirmar] = useState(false)
  const [reagendado, setReagendado]             = useState(false)
  const [errorReagendar, setErrorReagendar]     = useState("")

  const hoy = new Date().toISOString().split("T")[0]

  // 2. Traer los datos de PHP al abrir la pantalla
  useEffect(() => {
    async function obtenerDetalle() {
      if (!usuario) return;
      try {
        // Traemos todas las citas de este paciente
        const respuesta = await getCitasPorPaciente(usuario.userId);
        if (respuesta.success) {
          // Buscamos específicamente la cita que coincida con el ID de la URL (ej. 22)
          const citaEncontrada = respuesta.data.find(c => c.id === Number(citaId));
          setCita(citaEncontrada || null);
        }
      } catch (error) {
        console.error("Error al cargar la cita:", error);
      } finally {
        setCargando(false);
      }
    }
    obtenerDetalle();
  }, [usuario, citaId]);

  // 3. Modificamos handleCancelar para que llame a PHP de verdad
  async function handleCancelar() {
    if (!cita) return;
    setLoadingCancelar(true)
    try {
      await cancelarCita(cita.id); // Llama al endpoint PUT /citas/:id/cancelar
      setCita(prev => prev ? { ...prev, estado: "cancelada" } : null)
      setModalCancelar(false)
    } catch {
      alert("Error al cancelar la cita. Intenta de nuevo.")
    } finally {
      setLoadingCancelar(false)
    }
  }



  // Agregamos función para confirmar la cita (cuando el paciente la confirma desde el dashboard)
  async function handleConfirmar() {
    if (!cita) return;
    setLoadingConfirmar(true)
    try {
      await confirmarCita(cita.id); 
      setCita(prev => prev ? { ...prev, estado: "confirmada" } : null)
    } catch {
      alert("Error al confirmar la cita. Intenta de nuevo.")
    } finally {
      setLoadingConfirmar(false)
    }
  }

  // HandleReagendar lo dejamos como simulacro por ahora hasta crear esa tabla
  async function handleReagendar() {
    if (!fechaNueva) return setErrorReagendar("Selecciona una fecha")
    if (!horaNueva)  return setErrorReagendar("Selecciona una hora")
    
    setLoadingReagendar(true)
    try {
      // 1. Mandamos los datos a PHP
      await reagendarCita(cita!.id, fechaNueva, horaNueva, motivoReagendar); 
      
      // 2. Mostramos éxito
      setReagendado(true)
      
      // 3. Actualizamos la pantalla para el paciente
      setCita(prev => prev ? { ...prev, fecha: fechaNueva, hora: horaNueva, estado: "reagendada" } : null)
    } catch {
      setErrorReagendar("Error al enviar la solicitud. Intenta de nuevo.")
    } finally {
      setLoadingReagendar(false)
    }
  }

  // 4. Pantalla de carga visual
  if (cargando) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
        <p className="text-slate-500 font-medium">Buscando detalles de tu cita...</p>
      </div>
    )
  }

  // Si después de cargar no se encontró la cita (ej. alguien escribió un ID falso en la URL)
  if (!cita) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-dark font-medium mb-2">Cita no encontrada</p>
          <button
            onClick={() => navigate("/paciente/dashboard")}
            className="text-sm text-primary hover:text-primary-hover"
          >
            Volver al dashboard
          </button>
        </div>
      </div>
    )
  }

  const puedeCancelarOReagendar = cita.estado === "confirmada" || cita.estado === "pendiente"

//  const { citaId } = useParams()
//  const navigate   = useNavigate()

  // Busca la cita en el mock por su ID
  // TODO: reemplazar con getCita(Number(citaId)) cuando PHP esté listo
//  const citaEncontrada = CITAS_MOCK.find(c => c.id === Number(citaId))

  // Estado local de la cita — se actualiza cuando el paciente cancela
//  const [cita, setCita] = useState<Cita | null>(citaEncontrada ?? null)

  // Controla si el modal de cancelar está abierto
//  const [modalCancelar, setModalCancelar] = useState(false)

  // Controla si el modal de reagendar está abierto
//  const [modalReagendar, setModalReagendar] = useState(false)

  // Campos del formulario de reagendar
//  const [fechaNueva, setFechaNueva]               = useState("")
//  const [horaNueva, setHoraNueva]                 = useState("")
//  const [motivoReagendar, setMotivoReagendar]     = useState("")

  // Estados de carga y confirmación
//  const [loadingCancelar, setLoadingCancelar]   = useState(false)
//  const [loadingReagendar, setLoadingReagendar] = useState(false)
//  const [reagendado, setReagendado]             = useState(false)
//  const [errorReagendar, setErrorReagendar]     = useState("")

  // Fecha mínima para reagendar = hoy
//  const hoy = new Date().toISOString().split("T")[0]

  // Si no se encontró la cita, muestra mensaje de error
//  if (!cita) {
//    return (
//      <div className="min-h-screen bg-background flex items-center justify-center">
//        <div className="text-center">
//          <p className="text-dark font-medium mb-2">Cita no encontrada</p>
//          <button
//            onClick={() => navigate("/paciente/dashboard")}
//            className="text-sm text-primary hover:text-primary-hover"
//          >
//            Volver al dashboard
//          </button>
//        </div>
//      </div>
//    )
//  }

  // El paciente solo puede cancelar o reagendar si la cita es confirmada o pendiente
//  const puedeCancelarOReagendar =
//    cita.estado === "confirmada" || cita.estado === "pendiente"

  // Cancela la cita — TODO: llamar a cancelarCita(cita.id) cuando PHP esté listo
//  async function handleCancelar() {
//    setLoadingCancelar(true)
//    try {
//      await new Promise(resolve => setTimeout(resolve, 800))
//      setCita(prev => prev ? { ...prev, estado: "cancelada" } : null)
//      setModalCancelar(false)
//    } catch {
//      alert("Error al cancelar la cita. Intenta de nuevo.")
//    } finally {
//      setLoadingCancelar(false)
//    }
//  }

  // Envía solicitud de reagendar — TODO: llamar a solicitarCita() cuando PHP esté listo
//  async function handleReagendar() {
//    if (!fechaNueva) return setErrorReagendar("Selecciona una fecha")
//    if (!horaNueva)  return setErrorReagendar("Selecciona una hora")

//    setLoadingReagendar(true)
//    try {
//      await new Promise(resolve => setTimeout(resolve, 800))
//      setReagendado(true)
//    } catch {
//      setErrorReagendar("Error al enviar la solicitud. Intenta de nuevo.")
//    } finally {
//      setLoadingReagendar(false)
//    }
//  }

  return (
    <>
      <div className="min-h-screen bg-background">

        {/* NavbarPaciente reutilizable — mismo en todas las páginas del paciente */}
        <NavbarPaciente />

        <div className="max-w-2xl mx-auto p-6">

          {/* Botón volver al dashboard */}
          <button
            onClick={() => navigate("/paciente/dashboard")}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-dark transition-colors mb-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al inicio
          </button>

          {/* ===========================
              HEADER DE LA CITA
              =========================== */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-2">
                  Detalle de cita
                </p>
                <h1 className="text-2xl font-bold text-dark mb-1">
                  {formatearFecha(cita.fecha)}
                </h1>
                <p className="text-slate-500 text-sm">{cita.hora} hrs · Psicología clínica</p>
              </div>
              <span className={`text-sm px-3 py-1.5 rounded-full font-medium border flex-shrink-0 ${colorEstado(cita.estado)}`}>
                {etiquetaEstado(cita.estado)}
              </span>
            </div>
          </div>

          {/* ===========================
              RETROALIMENTACIÓN DEL PSICÓLOGO
              Solo se muestra si la cita tiene feedback guardado
              =========================== */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
            <h3 className="font-semibold text-dark mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Retroalimentación de tu psicólogo
            </h3>
            {cita.feedback ? (
              <div className="bg-background rounded-xl p-4 border-l-4 border-primary">
                <p className="text-sm text-dark leading-relaxed">{cita.feedback}</p>
              </div>
            ) : (
              <div className="bg-background rounded-xl p-4 text-center">
                <p className="text-sm text-slate-400">
                  {cita.estado === "completada"
                    ? "Tu psicólogo no dejó retroalimentación para esta sesión."
                    : "La retroalimentación estará disponible después de la cita."
                  }
                </p>
              </div>
            )}
          </div>

          {/* ===========================
              ACCIONES — solo si la cita es confirmada o pendiente
              =========================== */}
          {puedeCancelarOReagendar && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-dark mb-4">Opciones</h3>
              <div className="flex flex-col gap-3">

                {/* BOTÓN CONFIRMAR */}
                {cita.estado === "pendiente" && (
                  <button
                    onClick={handleConfirmar}
                    disabled={loadingConfirmar}
                    className="w-full flex items-center gap-3 px-4 py-3 border border-emerald-100 rounded-xl hover:bg-emerald-50 transition-colors text-left"
                  >
                    <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-emerald-600">
                        {loadingConfirmar ? "Confirmando..." : "Confirmar mi asistencia"}
                      </p>
                      <p className="text-xs text-slate-400">Asegura tu lugar para esta sesión</p>
                    </div>
                  </button>
                )}

                {/* BOTÓN REAGENDAR */}
                <button
                  onClick={() => setModalReagendar(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-xl hover:bg-background transition-colors text-left"
                >
                  <div className="w-9 h-9 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-dark">Solicitar reagendar</p>
                    <p className="text-xs text-slate-400">Propón una nueva fecha y hora</p>
                  </div>
                </button>

                {/* BOTÓN CANCELAR */}
                <button
                  onClick={() => setModalCancelar(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-red-100 rounded-xl hover:bg-red-50 transition-colors text-left"
                >
                  <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-500">Cancelar cita</p>
                    <p className="text-xs text-slate-400">Esta acción no se puede deshacer</p>
                  </div>
                </button>

              </div>
            </div>
          )}

          {/* Mensaje si ya fue cancelada */}
          {cita.estado === "cancelada" && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center">
              <p className="text-red-500 font-medium text-sm">Esta cita fue cancelada.</p>
              <button
                onClick={() => setModalReagendar(true)}
                className="text-xs text-primary hover:text-primary-hover font-medium mt-2"
              >
                ¿Quieres solicitar una nueva cita? →
              </button>
            </div>
          )}

        </div>
      </div>

      {/* MODAL CANCELAR */}
      {modalCancelar && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-dark text-center mb-1">¿Cancelar esta cita?</h3>
            <p className="text-slate-500 text-sm text-center mb-2">
              {formatearFecha(cita.fecha)} a las {cita.hora} hrs
            </p>
            <p className="text-xs text-slate-400 text-center mb-6">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModalCancelar(false)}
                className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm"
              >
                No cancelar
              </button>
              <button
                onClick={handleCancelar}
                disabled={loadingCancelar}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-2.5 rounded-xl transition-colors font-medium text-sm"
              >
                {loadingCancelar ? "Cancelando..." : "Sí, cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REAGENDAR */}
      {modalReagendar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={() => { if (!reagendado) setModalReagendar(false) }}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            {reagendado ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-dark mb-2">¡Solicitud enviada!</h3>
                <p className="text-sm text-slate-500 mb-6">
                  Tu psicólogo la revisará y recibirás confirmación pronto.
                </p>
                <button
                  onClick={() => { setModalReagendar(false); setReagendado(false); navigate("/paciente/dashboard") }}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-xl transition-colors"
                >
                  Volver al inicio
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-dark">Solicitar reagendar</h2>
                  <button onClick={() => setModalReagendar(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
                </div>
                <p className="text-sm text-slate-400 mb-5">
                  Propón una nueva fecha y hora. Tu psicólogo confirmará o te sugerirá otro horario.
                </p>
                {errorReagendar && (
                  <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">{errorReagendar}</div>
                )}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-dark mb-1">Nueva fecha</label>
                      <input type="date" value={fechaNueva} min={hoy}
                        onChange={(e) => { setFechaNueva(e.target.value); setErrorReagendar("") }}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark mb-1">Nueva hora</label>
                      <input type="time" value={horaNueva}
                        onChange={(e) => { setHoraNueva(e.target.value); setErrorReagendar("") }}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">
                      Motivo <span className="text-slate-400 font-normal">(opcional)</span>
                    </label>
                    <textarea value={motivoReagendar} onChange={(e) => setMotivoReagendar(e.target.value)}
                      placeholder="¿Por qué necesitas cambiar la fecha?"
                      rows={3}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                    />
                  </div>
                  <div className="bg-background rounded-lg px-4 py-3 text-sm text-slate-500">
                    📅 Tu solicitud quedará como <span className="font-medium text-dark">"Por confirmar"</span> hasta que tu psicólogo la revise.
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setModalReagendar(false)}
                    className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm"
                  >
                    Cancelar
                  </button>
                  <button onClick={handleReagendar} disabled={loadingReagendar}
                    className="flex-1 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-2.5 rounded-xl transition-colors font-medium text-sm"
                  >
                    {loadingReagendar ? "Enviando..." : "Enviar solicitud"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}