// ===========================
// src/pages/psicologo/PerfilPsicologo.tsx
// ===========================

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../../components/layout/Navbar"
import Sidebar from "../../components/layout/Sidebar"
import { useAuth } from "../../hooks/useAuth"
import { getPerfilPsicologo, actualizarPerfilPsicologo, cambiarContrasena, getCitas, getPacientes } from "../../services/api"


interface PsicologoPerfil {
  userId: number
  nombre: string
  apellido: string
  apellidoMaterno: string
  email: string
  telefono: string
  fechaNacimiento: string
  profesionalId: number
  numerolicencia: string
  especialidad: string
  rol: string
  bio: string
}

function calcularEdad(fechaNacimiento: string): number {
  const hoy = new Date()
  const nac = new Date(fechaNacimiento)
  let edad  = hoy.getFullYear() - nac.getFullYear()
  const mes = hoy.getMonth() - nac.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--
  return edad
}

function formatearFecha(fecha: string): string {
  return new Date(fecha + "T12:00:00").toLocaleDateString("es-MX", {
    year: "numeric", month: "long", day: "numeric",
  })
}

function FilaDato({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-dark font-medium">{valor}</p>
    </div>
  )
}

function CampoEditable({ label, value, onChange, type = "text", placeholder = "", disabled = false }: {
  label: string; value: string; onChange?: (val: string) => void
  type?: string; placeholder?: string; disabled?: boolean
}) {
  return (
    <div>
      <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full border rounded-lg px-3 py-2 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
          disabled ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed" : "border-slate-200 bg-white hover:border-slate-300"
        }`}
      />
    </div>
  )
}

function Seccion({ titulo, icono, color = "bg-slate-100", iconColor = "text-slate-500", children, accion }: {
  titulo: string; icono: React.ReactNode; color?: string; iconColor?: string
  children: React.ReactNode; accion?: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col h-full shadow-sm">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
        <h3 className="text-base font-bold text-dark flex items-center gap-2">
          <div className={`w-6 h-6 ${color} rounded-md flex items-center justify-center ${iconColor}`}>
            {icono}
          </div>
          {titulo}
        </h3>
        {accion}
      </div>
      <div className="flex flex-col gap-3 flex-1">{children}</div>
    </div>
  )
}

function CampoContrasena({ label, value, onChange, mostrar, onToggleMostrar, placeholder = "••••••••" }: {
  label: string; value: string; onChange: (v: string) => void
  mostrar: boolean; onToggleMostrar: () => void; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-dark mb-1">{label}</label>
      <div className="relative">
        <input
          type={mostrar ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 pr-12 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button type="button" onClick={onToggleMostrar} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
          {mostrar ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

export default function PerfilPsicologo() {
  const navigate    = useNavigate()
  const { usuario } = useAuth()

  const [psicologo, setPsicologo]     = useState<PsicologoPerfil | null>(null)
  const [edicion, setEdicion]         = useState<PsicologoPerfil | null>(null)
  const [cargando, setCargando]       = useState(true)
  const [modoEdicion, setModoEdicion] = useState(false)

  const [modalContrasena, setModalContrasena]         = useState(false)
  const [contrasenaActual, setContrasenaActual]       = useState("")
  const [contrasenaNueva, setContrasenaNueva]         = useState("")
  const [contrasenaConfirmar, setContrasenaConfirmar] = useState("")
  const [mostrarActual, setMostrarActual]             = useState(false)
  const [mostrarNueva, setMostrarNueva]               = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar]       = useState(false)
  const [errorContrasena, setErrorContrasena]         = useState("")
  const [exitoContrasena, setExitoContrasena]         = useState(false)
  const [loadingContrasena, setLoadingContrasena]     = useState(false)
  const [totalPacientes, setTotalPacientes] = useState(0)
  const [totalCitas, setTotalCitas]         = useState(0)

  useEffect(() => {
    async function cargar() {
      try {
        const [resPacientes, resCitas, resPerfil] = await Promise.all([
          getPacientes(),
          getCitas(),
          getPerfilPsicologo()
        ]);

        if (resPacientes.success) {
          setTotalPacientes(resPacientes.data.length);
        }

        if (resCitas.success) {
          const citasValidas = resCitas.data.filter(
            (cita: any) => cita.status !== 'cancelada'
          );
          setTotalCitas(citasValidas.length);
        }

        if (resPerfil.success) {
          const datos = { 
            ...(resPerfil.data as any), 
            bio: (resPerfil.data as any).bio ?? "" 
          };
          setPsicologo(datos);
          setEdicion(datos);
        }
      } catch (error) {
        console.error("Error al cargar datos del perfil:", error);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);
  
  function handleIniciarEdicion() {
    if (psicologo) setEdicion({ ...psicologo })
    setModoEdicion(true)
  }

  function handleCancelarEdicion() {
    if (psicologo) setEdicion({ ...psicologo })
    setModoEdicion(false)
  }

  async function handleGuardarEdicion() {
    if (!edicion) return
    if (!edicion.nombre.trim())   return alert("El nombre es requerido")
    if (!edicion.apellido.trim()) return alert("El apellido es requerido")
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await actualizarPerfilPsicologo({ nombre: edicion.nombre, apellido: edicion.apellido, apellidoMaterno: edicion.apellidoMaterno, telefono: edicion.telefono } as any)
      if (res.success) {
        setPsicologo({ ...edicion })
        setModoEdicion(false)
      } else {
        alert(res.message ?? "Error al guardar")
      }
    } catch {
      alert("Error de conexión")
    }
  }

  function cerrarModalContrasena() {
    setModalContrasena(false)
    setContrasenaActual(""); setContrasenaNueva(""); setContrasenaConfirmar("")
    setMostrarActual(false); setMostrarNueva(false); setMostrarConfirmar(false)
    setErrorContrasena(""); setExitoContrasena(false)
  }

  async function handleCambiarContrasena() {
    setErrorContrasena("")
    if (!contrasenaActual)                       return setErrorContrasena("Escribe tu contraseña actual")
    if (!contrasenaNueva)                        return setErrorContrasena("Escribe tu nueva contraseña")
    if (contrasenaNueva.length < 8)              return setErrorContrasena("Mínimo 8 caracteres")
    if (contrasenaNueva !== contrasenaConfirmar) return setErrorContrasena("Las contraseñas no coinciden")
    if (contrasenaActual === contrasenaNueva)    return setErrorContrasena("La nueva contraseña debe ser diferente")
    setLoadingContrasena(true)
    try {
      const res = await cambiarContrasena(contrasenaActual, contrasenaNueva)
      if (res.success) {
        setExitoContrasena(true)
      } else {
        setErrorContrasena(res.message ?? "Error al cambiar la contraseña")
      }
    } catch {
      setErrorContrasena("Error de conexión")
    } finally {
      setLoadingContrasena(false)
    }
  }

  if (cargando) {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm font-medium">Cargando tu perfil...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!psicologo) {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex flex-1 flex-col items-center justify-center">
          <p className="text-red-500 font-bold mb-4">No se pudo cargar la información de tu perfil.</p>
        </div>
      </div>
    )
  }

  return (
    // Altura bloqueada en Desktop para evitar scroll 
    <div className="min-h-screen lg:h-screen bg-slate-50 flex flex-col lg:overflow-hidden">
      <Navbar />

      <div className="flex flex-1 overflow-hidden min-h-0">
        <Sidebar citasHoy={0} citasSemana={0} citasPendientes={0} proximasCitas={[]} onNuevaCita={() => {}} />

        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto lg:overflow-hidden p-4 md:p-6 w-full max-w-5xl mx-auto">

          {/* ENCABEZADO OPTIMIZADO */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 mb-4 flex-shrink-0">
            <div>
              <button onClick={() => navigate("/psicologo/dashboard")} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-dark transition-colors mb-1 font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                Volver al dashboard
              </button>
              <h1 className="text-2xl font-bold text-dark mb-0.5">Mi Perfil Profesional</h1>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {modoEdicion ? (
                <>
                  <button onClick={handleCancelarEdicion} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 transition-colors font-bold">
                    Cancelar
                  </button>
                  <button onClick={handleGuardarEdicion} className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold transition-colors">
                    Guardar
                  </button>
                </>
              ) : (
                <button onClick={handleIniciarEdicion} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 transition-colors font-bold">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar perfil
                </button>
              )}
            </div>
          </div>

          {modoEdicion && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-600 flex items-center gap-2 mb-4 flex-shrink-0 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Estás en modo edición. No olvides guardar tus cambios al terminar.
            </div>
          )}

          {/* CUADRÍCULA PRINCIPAL */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 min-h-0 pb-4 lg:pb-0 overflow-y-auto lg:overflow-visible items-stretch">
            
            {/* COLUMNA 1: Tarjeta Principal de Identidad */}
            <div className="md:col-span-2 lg:col-span-1 flex flex-col gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col items-center justify-center text-center h-full">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white font-bold text-2xl uppercase mb-3 shadow-sm relative">
                  {psicologo.nombre[0]}{psicologo.apellido[0]}
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white"></div>
                </div>
                <h2 className="text-lg font-bold text-dark capitalize mb-1">
                  {psicologo.nombre} {psicologo.apellido} {psicologo.apellidoMaterno}
                </h2>
                <div className="flex flex-wrap items-center justify-center gap-1.5 mb-4">
                  <span className="text-[9px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded border border-primary/20">
                    {psicologo.especialidad}
                  </span>
                  <span className="text-[9px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded border border-blue-100 uppercase tracking-widest">
                    {psicologo.rol}
                  </span>
                </div>
                
                {/* Minicuadrícula de métricas dentro del perfil */}
                <div className="w-full grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-slate-100">
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-xl font-bold text-dark">{totalPacientes}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pacientes</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-xl font-bold text-blue-500">{totalCitas}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Citas (Mes)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMNA 2: Datos Personales */}
            <div className="lg:col-span-1 h-full">
              <Seccion titulo="Datos personales" color="bg-emerald-100" iconColor="text-emerald-600"
                icono={<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
              >
                {modoEdicion && edicion ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <CampoEditable label="Nombre" value={edicion.nombre} onChange={v => setEdicion(p => p ? { ...p, nombre: v } : p)} />
                      <CampoEditable label="Ap. Paterno" value={edicion.apellido} onChange={v => setEdicion(p => p ? { ...p, apellido: v } : p)} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <CampoEditable label="Ap. Materno" value={edicion.apellidoMaterno ?? ""} onChange={v => setEdicion(p => p ? { ...p, apellidoMaterno: v } : p)} />
                      <CampoEditable label="Teléfono" value={edicion.telefono ?? ""} onChange={v => setEdicion(p => p ? { ...p, telefono: v } : p)} type="tel" />
                    </div>
                    <CampoEditable label="Fecha de nacimiento" value={edicion.fechaNacimiento ?? ""} onChange={v => setEdicion(p => p ? { ...p, fechaNacimiento: v } : p)} type="date" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <FilaDato label="Nombre completo" valor={`${psicologo.nombre} ${psicologo.apellido}${psicologo.apellidoMaterno ? ` ${psicologo.apellidoMaterno}` : ""}`} />
                    <FilaDato label="Teléfono" valor={psicologo.telefono ?? "—"} />
                    <FilaDato label="Fecha de nacimiento" valor={psicologo.fechaNacimiento ? `${formatearFecha(psicologo.fechaNacimiento)} (${calcularEdad(psicologo.fechaNacimiento)} años)` : "—"} />
                  </div>
                )}
              </Seccion>
            </div>

            {/* COLUMNA 3: Datos Profesionales y Seguridad (Apilados) */}
            <div className="lg:col-span-1 flex flex-col gap-4 h-full">
              <Seccion titulo="Datos profesionales" color="bg-blue-100" iconColor="text-blue-500"
                icono={<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
              >
                <div className="grid grid-cols-2 gap-3">
                  <FilaDato label="ID Profesional" valor={`#${psicologo.profesionalId}`} />
                  <FilaDato label="Num. Licencia" valor={psicologo.numerolicencia ?? "—"} />
                </div>
              </Seccion>

              <Seccion titulo="Seguridad" color="bg-rose-100" iconColor="text-rose-500"
                icono={<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
              >
                <FilaDato label="Correo de acceso" valor={psicologo.email} />
                <button onClick={() => setModalContrasena(true)} className="w-full flex items-center gap-2 mt-auto pt-2 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors text-left group">
                  <div className="w-6 h-6 bg-rose-50 rounded flex items-center justify-center flex-shrink-0 group-hover:bg-rose-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-dark">Cambiar contraseña</span>
                </button>
              </Seccion>
            </div>

          </div>
        </main>
      </div>

      {/* Modal cambiar contraseña */}
      {modalContrasena && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4" onClick={cerrarModalContrasena}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-dark">Cambiar contraseña</h2>
              <button onClick={cerrarModalContrasena} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
            </div>
            <p className="text-sm text-slate-400 mb-6 font-medium">Tu nueva contraseña debe tener al menos 8 caracteres.</p>

            {exitoContrasena ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-bold text-dark mb-1">¡Contraseña actualizada!</p>
                <p className="text-sm text-slate-500 font-medium mb-6">Tu contraseña ha sido cambiada exitosamente.</p>
                <button onClick={cerrarModalContrasena} className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-xl transition-colors">Cerrar</button>
              </div>
            ) : (
              <div className="space-y-4">
                {errorContrasena && (
                  <div className="bg-red-50 text-red-600 font-medium text-sm px-4 py-3 rounded-xl border border-red-100">{errorContrasena}</div>
                )}
                <CampoContrasena label="Contraseña actual" value={contrasenaActual} onChange={setContrasenaActual} mostrar={mostrarActual} onToggleMostrar={() => setMostrarActual(!mostrarActual)} />
                <div className="border-t border-slate-100 pt-2" />
                <CampoContrasena label="Nueva contraseña" value={contrasenaNueva} onChange={setContrasenaNueva} mostrar={mostrarNueva} onToggleMostrar={() => setMostrarNueva(!mostrarNueva)} placeholder="Mínimo 8 caracteres" />
                <CampoContrasena label="Confirmar nueva contraseña" value={contrasenaConfirmar} onChange={setContrasenaConfirmar} mostrar={mostrarConfirmar} onToggleMostrar={() => setMostrarConfirmar(!mostrarConfirmar)} />
                {contrasenaNueva && contrasenaConfirmar && (
                  <p className={`text-xs font-bold ${contrasenaNueva === contrasenaConfirmar ? "text-emerald-500" : "text-red-400"}`}>
                    {contrasenaNueva === contrasenaConfirmar ? "✓ Las contraseñas coinciden" : "✗ Las contraseñas no coinciden"}
                  </p>
                )}
                <div className="flex gap-3 pt-2">
                  <button onClick={cerrarModalContrasena} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl hover:bg-slate-50 transition-colors font-bold text-sm">Cancelar</button>
                  <button onClick={handleCambiarContrasena} disabled={loadingContrasena} className="flex-1 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-2.5 rounded-xl transition-colors font-bold text-sm shadow-sm">
                    {loadingContrasena ? "Guardando..." : "Cambiar contraseña"}
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