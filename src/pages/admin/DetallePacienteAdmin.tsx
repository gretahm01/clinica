import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../../components/layout/Navbar"
import SidebarAdmin from "../../components/layout/SidebarAdmin"
import { getPerfilPacienteAdmin, actualizarPacienteAdmin, getTodosPsicologos } from "../../services/api"
import type { Paciente, Profesional } from "../../types"

export default function DetallePacienteAdmin() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [psicologos, setPsicologos] = useState<Profesional[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState("")

  // Modal State
  const [modalEditar, setModalEditar] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState({ nombre: "", apellido: "", email: "", telefono: "", fechaNacimiento: "", psicologoId: 0 })

  useEffect(() => {
    cargarDatos()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function cargarDatos() {
    if (!id) return
    setCargando(true)
    try {
      const [resPac, resPsi] = await Promise.all([
        getPerfilPacienteAdmin(Number(id)),
        getTodosPsicologos()
      ])
      
      if (resPac.success && resPac.data) {
        setPaciente(resPac.data)
        setForm({
          nombre: resPac.data.nombre || "",
          apellido: resPac.data.apellido || "",
          email: resPac.data.email || "",
          telefono: resPac.data.telefono || "",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fechaNacimiento: (resPac.data as any).fechaNacimiento || "",
          psicologoId: resPac.data.profesionalId || 0
        })
      } else {
        setError("No se pudo cargar el perfil.")
      }

      if (resPsi.success) {
        setPsicologos(resPsi.data)
      }
    } catch {
      setError("Error de conexión al cargar el perfil.")
    } finally {
      setCargando(false)
    }
  }

  async function handleActualizar(e: React.FormEvent) {
    e.preventDefault()
    if (!paciente) return
    if (!form.psicologoId) return alert("Selecciona un psicólogo")

    setGuardando(true)
    try {
      const res = await actualizarPacienteAdmin(paciente.id, form as any)
      if (res.success) {
        setModalEditar(false)
        await cargarDatos()
      } else {
        alert(res.message || "Error al actualizar")
      }
    } catch {
      alert("Error de conexión al actualizar")
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <SidebarAdmin />
        
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          
          <button
            onClick={() => navigate("/admin/pacientes")}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-dark transition-colors mb-6 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Pacientes
          </button>

          {cargando ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : error || !paciente ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium text-center">
              {error || "Paciente no encontrado."}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-8 items-start relative">
                
                {/* BOTÓN EDITAR */}
                <button 
                  onClick={() => setModalEditar(true)}
                  className="absolute top-6 right-6 flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar Perfil
                </button>

                <div className="w-24 h-24 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-3xl uppercase flex-shrink-0 shadow-inner mt-2 sm:mt-0">
                  {paciente.nombre?.[0] || ""}{paciente.apellido?.[0] || ""}
                </div>
                
                <div className="flex-1 min-w-0 pr-24">
                  <div className="flex items-center gap-3 mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-dark capitalize">{paciente.nombre} {paciente.apellido}</h1>
                      <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mt-1">Paciente Activo</p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-lg text-xs font-bold uppercase self-start">
                      ID: #{paciente.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mt-6">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Psicólogo Asignado</p>
                      <p className="text-dark font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 inline-block">
                        ID Profesional #{paciente.profesionalId || "No asignado"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Correo Electrónico</p>
                      <p className="text-dark font-medium">{paciente.email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Teléfono</p>
                      <p className="text-dark font-medium">{paciente.telefono || "No registrado"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Fecha de Nacimiento</p>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <p className="text-dark font-medium">{(paciente as any).fechaNacimiento || "No registrada"}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>

      {/* MODAL PARA EDITAR PACIENTE */}
      {modalEditar && paciente && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-dark">Editar Paciente</h2>
              <button onClick={() => setModalEditar(false)} className="text-slate-400 hover:text-dark text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleActualizar} className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-2">
                <label className="block text-[11px] font-bold text-emerald-600 uppercase mb-1.5 tracking-wider">Asignar a Psicólogo</label>
                <select 
                  required
                  value={form.psicologoId}
                  onChange={e => setForm({...form, psicologoId: Number(e.target.value)})}
                  className="w-full border border-emerald-200 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-dark"
                >
                  <option value={0}>Selecciona un profesional...</option>
                  {psicologos.map(psi => (
                    <option key={psi.id} value={psi.id}>Ps. {psi.nombre} {psi.apellido}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nombre</label>
                  <input required type="text" value={form.nombre} onChange={e=>setForm({...form, nombre: e.target.value})} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Apellidos</label>
                  <input required type="text" value={form.apellido} onChange={e=>setForm({...form, apellido: e.target.value})} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-emerald-500 outline-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Email</label>
                <input required type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-emerald-500 outline-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Teléfono</label>
                  <input required type="tel" value={form.telefono} onChange={e=>setForm({...form, telefono: e.target.value})} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nacimiento</label>
                  <input required type="date" value={form.fechaNacimiento} onChange={e=>setForm({...form, fechaNacimiento: e.target.value})} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-emerald-500 outline-none" />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setModalEditar(false)} className="flex-1 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 border border-slate-200 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} className="flex-1 py-2.5 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors disabled:opacity-50">
                  {guardando ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}