// ===========================
// src/pages/paciente/PerfilPaciente.tsx
// ===========================

import { useState, useEffect } from "react"
import NavbarPaciente from "../../components/layout/NavbarPaciente"
import { useAuth } from "../../hooks/useAuth"
import { getPaciente, getContactoEmergencia, getCitasPorPaciente } from "../../services/api"
import type { Paciente, Cita } from "../../types"

function calcularEdad(fechaNacimiento: string) {
  if (!fechaNacimiento) return "N/A"
  const hoy = new Date()
  const nacimiento = new Date(fechaNacimiento)
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--
  }
  return edad
}

export default function PerfilPaciente() {
  const { usuario } = useAuth()
  
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [contacto, setContacto] = useState({ nombre: "", telefono: "", parentesco: "" })
  const [citas, setCitas] = useState<Cita[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [usuario])

  async function cargarDatos() {
    if (!usuario?.pacienteId) {
      setCargando(false);
      return; 
    }
    
    try {
      const [resPaciente, resContacto, resCitas] = await Promise.all([
        getPaciente(Number(usuario.pacienteId)),
        getContactoEmergencia(Number(usuario.pacienteId)),
        getCitasPorPaciente(Number(usuario.pacienteId))
      ])
      
      if (resPaciente.success) {
        setPaciente(resPaciente.data)
      }
      
      if (resContacto.success && resContacto.data) {
        setContacto({
          nombre: resContacto.data.nombre || "",
          telefono: resContacto.data.telefono || "",
          parentesco: resContacto.data.parentesco || ""
        })
      }

      if (resCitas.success) {
        setCitas(resCitas.data || [])
      }

    } catch (error) {
      console.error("Error al cargar el perfil:", error)
    } finally {
      setCargando(false)
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <NavbarPaciente />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-primary font-bold text-lg animate-pulse">Cargando tu perfil...</div>
        </div>
      </div>
    )
  }

  if (!paciente) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <NavbarPaciente />
        <div className="flex flex-1 flex-col items-center justify-center">
          <p className="text-red-500 font-bold mb-4">No se pudo cargar la información de tu perfil.</p>
        </div>
      </div>
    )
  }

  // === CÁLCULO DE ESTADÍSTICAS ===
  const totalCitas = citas.length;
  const citasAsistidas = citas.filter(c => c.estado === "completada" || c.estado === "confirmada").length;
  const citasCanceladas = citas.filter(c => c.estado === "cancelada").length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavbarPaciente />
      
      <div className="max-w-4xl mx-auto w-full p-6 mt-6">
        
        <h1 className="text-3xl font-bold text-dark mb-8">Mi Perfil</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA - Resumen */}
          <div className="md:col-span-1 flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white font-bold text-3xl uppercase mb-4 shadow-md">
                {paciente.nombre[0]}{paciente.apellido[0]}
              </div>
              <h2 className="text-xl font-bold text-dark capitalize mb-1">
                {paciente.nombre} {paciente.apellido}
              </h2>
              <p className="text-sm font-medium text-slate-400 mb-4">
                Paciente Activo
              </p>
              <div className="w-full border-t border-slate-100 pt-4 mt-2">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Miembro desde</p>
                <p className="text-sm text-dark font-medium">
                  {new Date(paciente.fechaRegistro + "T12:00:00").toLocaleDateString("es-MX", { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* === TARJETA: ESTADÍSTICAS DEL PACIENTE === */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-bold text-dark mb-4 border-b border-slate-100 pb-3">Mi Actividad</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500 font-medium">Total de Citas</p>
                  <p className="text-base font-bold text-dark">{totalCitas}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500 font-medium">Citas Asistidas</p>
                  <p className="text-base font-bold text-emerald-500">{citasAsistidas}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500 font-medium">Citas Canceladas</p>
                  <p className="text-base font-bold text-red-400">{citasCanceladas}</p>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA - Detalles */}
          <div className="md:col-span-2 flex flex-col gap-6">
            
            {/* Tarjeta de Datos Personales (Solo Lectura) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-dark">Datos Personales</h3>
                <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                  Solo Lectura
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Nombre Completo</p>
                  <p className="text-sm text-dark font-medium capitalize">
                    {paciente.nombre} {paciente.apellido} {paciente.apellidoMaterno}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Edad</p>
                  <p className="text-sm text-dark font-medium">
                    {calcularEdad(paciente.fechaNacimiento)} años
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Correo Electrónico</p>
                  <p className="text-sm text-dark font-medium">
                    {paciente.email}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Teléfono Personal</p>
                  <p className="text-sm text-dark font-medium">
                    {paciente.phone || paciente.telefono || "No registrado"}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-blue-700 font-medium">
                  Si necesitas modificar tus datos personales o correo electrónico, por favor solicítalo directamente a tu psicólogo durante tu próxima sesión.
                </p>
              </div>
            </div>

            {/* Tarjeta de Contacto de Emergencia (Solo Lectura) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-dark">Contacto de Emergencia</h3>
                <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                  Solo Lectura
                </span>
              </div>

              {contacto.nombre ? (
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Nombre del Contacto</p>
                    <p className="text-base text-dark font-bold capitalize">{contacto.nombre}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Teléfono</p>
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {contacto.telefono}
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Parentesco</p>
                      <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                        {contacto.parentesco || "No especificado"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-xl">
                  <p className="text-sm text-slate-400 font-medium">No tienes un contacto de emergencia registrado.</p>
                </div>
              )}

              <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-blue-700 font-medium">
                  Si necesitas agregar o modificar tu contacto de emergencia, por favor solicítalo directamente a tu psicólogo durante tu próxima sesión.
                </p>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  )
}