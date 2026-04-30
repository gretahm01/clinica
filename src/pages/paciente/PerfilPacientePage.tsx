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
    const idCorrecto = (usuario as any)?.pacienteId || (usuario as any)?.id || usuario?.userId;
    
    if (!idCorrecto) {
      setCargando(false);
      return; 
    }
    
    try {
      const [resPaciente, resContacto, resCitas] = await Promise.all([
        getPaciente(Number(idCorrecto)),
        getContactoEmergencia(Number(idCorrecto)),
        getCitasPorPaciente(Number(idCorrecto))
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
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <NavbarPaciente />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm font-medium">Cargando tu perfil...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!paciente) {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
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
    // Utilizamos h-screen en desktop para evitar el scroll, pero permitimos scroll en móviles
    <div className="min-h-screen lg:h-screen bg-background flex flex-col lg:overflow-hidden">
      <NavbarPaciente />
      
      {/* Contenedor principal que ocupa el espacio restante */}
      <div className="max-w-5xl mx-auto w-full p-4 md:p-6 flex flex-col flex-1 min-h-0">
        
        {/* ENCABEZADO OPTIMIZADO (Menos margen inferior) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 mb-4 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-dark mb-0.5">Mi Perfil</h1>
            <p className="text-sm text-slate-500 font-medium">Gestiona tu información personal y actividad.</p>
          </div>
        </div>

        {/* BANNER INFORMATIVO GLOBAL OPTIMIZADO */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start sm:items-center gap-3 mb-4 shadow-sm flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5 sm:mt-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-blue-700 font-medium leading-relaxed">
            Por seguridad, tu perfil es de <span className="font-bold uppercase tracking-wider text-[10px] bg-blue-100/50 px-1.5 py-0.5 rounded mx-1">Solo Lectura</span>. 
            Si necesitas modificar algún dato personal o de emergencia, por favor solicítalo a tu psicólogo en tu próxima sesión.
          </p>
        </div>

        {/* === CUADRÍCULA DE 4 TARJETAS === */}
        {/* El flex-1 min-h-0 asegura que la cuadrícula absorba el alto restante sin desbordar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 flex-1 min-h-0 pb-4 lg:pb-0 overflow-y-auto lg:overflow-visible">
          
          {/* TARJETA 1: IDENTIDAD / RESUMEN */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col items-center justify-center text-center h-full">
            {/* Avatar ligeramente más pequeño para ahorrar espacio */}
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white font-bold text-2xl uppercase mb-3 shadow-sm">
              {paciente.nombre[0]}{paciente.apellido[0]}
            </div>
            <h2 className="text-lg font-bold text-dark capitalize mb-1">
              {paciente.nombre} {paciente.apellido} {paciente.apellidoMaterno}
            </h2>
            <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-widest mb-4">
              Paciente Activo
            </span>
            <div className="w-full border-t border-slate-100 pt-3 mt-auto">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Miembro desde</p>
              <p className="text-sm text-dark font-medium">
                {new Date(paciente.fechaRegistro + "T12:00:00").toLocaleDateString("es-MX", { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* TARJETA 2: DATOS PERSONALES */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col h-full justify-between">
            <div>
              <h3 className="text-base font-bold text-dark mb-3 border-b border-slate-100 pb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Datos Personales
              </h3>
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Correo Electrónico</p>
                  <p className="text-sm text-dark font-medium">{paciente.email}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Teléfono</p>
                    <p className="text-sm text-dark font-medium">{paciente.phone || paciente.telefono || "No registrado"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Edad</p>
                    <p className="text-sm text-dark font-medium">{calcularEdad(paciente.fechaNacimiento)} años</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Fecha de Nacimiento</p>
                  <p className="text-sm text-dark font-medium">
                    {paciente.fechaNacimiento ? new Date(paciente.fechaNacimiento + "T12:00:00").toLocaleDateString("es-MX", { day: 'numeric', month: 'long', year: 'numeric' }) : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* TARJETA 3: MI ACTIVIDAD */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col h-full justify-center">
            <h3 className="text-base font-bold text-dark mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Actividad Clínica
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  <p className="text-sm">Total de Citas</p>
                </div>
                <p className="text-lg font-bold text-dark">{totalCitas}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  <p className="text-sm">Citas Asistidas</p>
                </div>
                <p className="text-lg font-bold text-emerald-600">{citasAsistidas}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                  <p className="text-sm">Citas Canceladas</p>
                </div>
                <p className="text-lg font-bold text-red-500">{citasCanceladas}</p>
              </div>
            </div>
          </div>

          {/* TARJETA 4: CONTACTO DE EMERGENCIA */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col h-full justify-between">
            <div>
              <h3 className="text-base font-bold text-dark mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                Contacto de Emergencia
              </h3>
              
              {contacto.nombre ? (
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Nombre Completo</p>
                    <p className="text-sm text-dark font-bold capitalize">{contacto.nombre}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Teléfono</p>
                      <p className="text-sm text-dark font-medium">{contacto.telefono}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Parentesco</p>
                      <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        {contacto.parentesco || "No especificado"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-4 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <p className="text-[11px] text-slate-400 font-medium px-4">No tienes un contacto de emergencia registrado en tu expediente.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}