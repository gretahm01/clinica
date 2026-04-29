// ===========================
// src/pages/paciente/PerfilPaciente.tsx
// ===========================

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import NavbarPaciente from "../../components/layout/NavbarPaciente"
import { getPaciente, getContactoEmergencia, getCitasPorPaciente } from "../../services/api"
import type { Cita, EstadoCita } from "../../types"

interface PerfilPacienteData {
  nombre: string
  apellido: string
  apellidoMaterno?: string
  email: string
  telefono: string
  fechaNacimiento: string
  fechaRegistro: string
  citasAtendidas: number 
}

interface ContactoEmergenciaData {
  nombre: string
  telefono: string
  parentesco: string
}

// ===========================
// HELPERS & COMPONENTES UI
// ===========================

function colorEstadoCita(estado: EstadoCita) {
  switch (estado) {
    case "confirmada": return "bg-emerald-50 text-emerald-600 border border-emerald-100"
    case "pendiente":  return "bg-rose-50 text-rose-500 border border-rose-100"
    case "cancelada":  return "bg-slate-100 text-slate-500 border border-slate-200"
    case "completada": return "bg-blue-50 text-blue-600 border border-blue-100"
    case "reagendada": return "bg-orange-50 text-orange-500 border border-orange-100"
    default:           return "bg-slate-50 text-slate-500 border border-slate-100"
  }
}

function etiquetaEstadoCita(estado: EstadoCita) {
  switch (estado) {
    case "confirmada": return "Confirmada"
    case "pendiente":  return "Por confirmar"
    case "cancelada":  return "Cancelada"
    case "completada": return "Completada"
    case "reagendada": return "Reagendada"
    default:           return estado
  }
}

function calcularEdad(fechaNacimiento: string): number {
  if (!fechaNacimiento) return 0
  const hoy = new Date()
  const nac = new Date(fechaNacimiento)
  let edad  = hoy.getFullYear() - nac.getFullYear()
  const mes = hoy.getMonth() - nac.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--
  return edad
}

function formatearFecha(fecha: string): string {
  if (!fecha) return ""
  return new Date(fecha + "T12:00:00").toLocaleDateString("es-MX", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  })
}

function FilaDato({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm text-dark font-medium">{valor}</p>
    </div>
  )
}

function Seccion({ titulo, icono, color = "bg-slate-100", iconColor = "text-slate-500", children, accion }: {
  titulo: string; icono: React.ReactNode; color?: string; iconColor?: string
  children: React.ReactNode; accion?: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center ${iconColor}`}>{icono}</div>
          <h3 className="font-semibold text-dark">{titulo}</h3>
        </div>
        {accion}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  )
}

// ===========================
// COMPONENTE PRINCIPAL
// ===========================

export default function PerfilPaciente() {
  const navigate = useNavigate()
  const { usuario } = useAuth()

  const [perfil, setPerfil] = useState<PerfilPacienteData | null>(null)
  const [contacto, setContacto] = useState<ContactoEmergenciaData | null>(null)
  const [citas, setCitas] = useState<Cita[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargarDatos() {
      if (!usuario?.pacienteId) return
      try {
        const [resPerfil, resContacto, resCitas] = await Promise.all([
          getPaciente(usuario.pacienteId),
          getContactoEmergencia(usuario.pacienteId),
          getCitasPorPaciente(usuario.pacienteId)
        ])

        if (resPerfil.success) setPerfil(resPerfil.data)
        if (resContacto.success && resContacto.data) setContacto(resContacto.data)
        if (resCitas.success) setCitas(resCitas.data)
      } catch (err) {
        console.error("Error al cargar datos del paciente")
      } finally {
        setCargando(false)
      }
    }
    cargarDatos()
  }, [usuario])

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!perfil) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-red-500">No se pudo cargar el perfil</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NavbarPaciente />

      <main className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full">
        <button onClick={() => navigate("/paciente/dashboard")} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-dark transition-colors mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al dashboard
        </button>

        {/* HEADER */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
          <div className="flex items-start gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-bold text-3xl shadow-lg uppercase">
                {perfil.nombre[0]}{perfil.apellido[0]}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white"></div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-dark capitalize">
                    {perfil.nombre} {perfil.apellido} {perfil.apellidoMaterno}
                  </h1>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs bg-primary bg-opacity-10 text-primary font-semibold px-3 py-1 rounded-full border border-primary border-opacity-20">
                      Paciente
                    </span>
                    <span className="text-xs bg-blue-50 text-blue-600 font-medium px-3 py-1 rounded-full border border-blue-100">
                      ID: #{usuario?.pacienteId}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {calcularEdad(perfil.fechaNacimiento)} años
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-dark">{perfil.citasAtendidas}</p>
              <p className="text-xs text-slate-400 mt-0.5">Citas Atendidas</p>
            </div>
            <div className="text-center border-x border-slate-100">
              <p className="text-2xl font-bold text-blue-500">{citas.length}</p>
              <p className="text-xs text-slate-400 mt-0.5">Citas en Historial</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-rose-500">0</p>
              <p className="text-xs text-slate-400 mt-0.5">Tareas Realizadas</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* COLUMNA IZQUIERDA */}
          <div className="flex flex-col gap-5">
            {/* Datos Personales */}
            <Seccion 
              titulo="Datos personales" 
              color="bg-emerald-100" 
              iconColor="text-emerald-600"
              icono={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
            >
              <FilaDato label="Nombre completo" valor={`${perfil.nombre} ${perfil.apellido} ${perfil.apellidoMaterno || ""}`} />
              <FilaDato label="Correo electrónico" valor={perfil.email} />
              <FilaDato label="Teléfono" valor={perfil.telefono} />
              <FilaDato label="Fecha de nacimiento" valor={`${new Date(perfil.fechaNacimiento + "T12:00:00").toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })} (${calcularEdad(perfil.fechaNacimiento)} años)`} />
            </Seccion>

            {/* Contacto de Emergencia */}
            <Seccion 
              titulo="Contacto de emergencia" 
              color="bg-rose-100" 
              iconColor="text-rose-500"
              icono={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
            >
              {contacto ? (
                <>
                  <FilaDato label="Nombre del responsable" valor={contacto.nombre} />
                  <FilaDato label="Teléfono de contacto" valor={contacto.telefono} />
                  <FilaDato label="Vínculo / Parentesco" valor={contacto.parentesco} />
                </>
              ) : (
                <p className="text-sm text-slate-400 font-medium italic">No se ha registrado un contacto.</p>
              )}
            </Seccion>

            {/* NUEVA TARJETA DE AVISO (Modificar datos) */}
            <div className="bg-slate-100/60 border border-slate-200 border-dashed rounded-2xl p-5 flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-dark">¿Necesitas cambiar tu información?</p>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Para modificar tus datos personales o de contacto de emergencia, por favor comunícaselo directamente a tu psicólogo.
                </p>
              </div>
            </div>

          </div>

          {/* COLUMNA DERECHA: HISTORIAL DE CITAS */}
          <div className="lg:col-span-1">
            <Seccion 
              titulo="Mi Historial de Citas" 
              color="bg-blue-100" 
              iconColor="text-blue-500"
              icono={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            >
              {citas.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-slate-400 font-medium italic">Aún no tienes citas registradas.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {citas.map((cita) => (
                    <div key={cita.id} className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-dark capitalize">
                            {formatearFecha(cita.fecha)}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{cita.hora.slice(0, 5)} hrs</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${colorEstadoCita(cita.estado)}`}>
                            {etiquetaEstadoCita(cita.estado)}
                          </span>
                        </div>
                      </div>

                      {/* Mostrar Feedback si existe */}
                      {cita.feedback && (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                          <p className="text-[10px] text-blue-500 font-bold uppercase mb-1">Nota de tu Psicólogo</p>
                          <p className="text-xs text-slate-600 italic">"{cita.feedback}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Seccion>
          </div>

        </div>
      </main>
    </div>
  )
}