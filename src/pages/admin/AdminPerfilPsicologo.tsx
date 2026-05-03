import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../../components/layout/Navbar"
import SidebarAdmin from "../../components/layout/SidebarAdmin"
import { getPerfilPsicologoAdmin, actualizarPsicologoAdmin } from "../../services/api"
import type { Profesional, Paciente } from "../../types"

export default function AdminPerfilPsicologo() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [psicologo, setPsicologo] = useState<Profesional | null>(null)
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState("")

  // Estados para el Modal de Edición
  const [modalEditar, setModalEditar] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState({ nombre: "", apellido: "", email: "", telefono: "", cedula: "" })

  useEffect(() => {
    cargarPerfil()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function cargarPerfil() {
    if (!id) return
    setCargando(true)
    try {
      const res = await getPerfilPsicologoAdmin(Number(id))
      if (res.success && res.data) {
        setPsicologo(res.data.profesional)
        setPacientes(res.data.pacientes || [])
        // Precargar el formulario con los datos actuales
        setForm({
          nombre: res.data.profesional.nombre || "",
          apellido: res.data.profesional.apellido || "",
          email: res.data.profesional.email || "",
          telefono: res.data.profesional.telefono || "",
          cedula: res.data.profesional.cedula || ""
        })
      } else {
        setError(res.message || "No se pudo cargar el perfil.")
      }
    } catch {
      setError("Error de conexión al cargar el perfil.")
    } finally {
      setCargando(false)
    }
  }

  async function handleActualizar(e: React.FormEvent) {
    e.preventDefault()
    if (!psicologo) return

    setGuardando(true)
    try {
      const res = await actualizarPsicologoAdmin(psicologo.id, form)
      if (res.success) {
        setModalEditar(false)
        await cargarPerfil() // Recargamos para ver los cambios reflejados
      } else {
        alert(res.message || "Error al actualizar los datos")
      }
    } catch {
      alert("Error de conexión con el servidor")
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
            onClick={() => navigate("/admin/psicologos")}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-dark transition-colors mb-6 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Psicólogos
          </button>

          {cargando ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : error || !psicologo ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium text-center">
              {error || "Psicólogo no encontrado."}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* TARJETA DE INFORMACIÓN DEL PSICÓLOGO */}
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-8 items-start relative">
                
                {/* BOTÓN EDITAR */}
                <button 
                  onClick={() => setModalEditar(true)}
                  className="absolute top-6 right-6 flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-hover bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-xl transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar Perfil
                </button>

                <div className="w-24 h-24 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-3xl uppercase flex-shrink-0 shadow-inner mt-2 sm:mt-0">
                  {psicologo.nombre?.[0] || ""}{psicologo.apellido?.[0] || ""}
                </div>
                
                <div className="flex-1 min-w-0 pr-24">
                  <div className="flex items-center gap-3 mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-dark capitalize">{psicologo.nombre} {psicologo.apellido}</h1>
                      <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mt-1">Psicólogo Clínico</p>
                    </div>
                    <span className="bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-lg text-xs font-bold uppercase self-start">
                      ID: #{psicologo.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mt-6">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Correo Electrónico</p>
                      <p className="text-dark font-medium">{psicologo.email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Teléfono</p>
                      <p className="text-dark font-medium">{psicologo.telefono || "No registrado"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cédula Profesional</p>
                      <p className="text-dark font-medium">{psicologo.cedula || "No registrada"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN DE PACIENTES ASIGNADOS */}
              <div>
                <div className="flex items-center justify-between mb-4 mt-10">
                  <h2 className="text-xl font-bold text-dark flex items-center gap-2">
                    Pacientes Asignados
                    <span className="bg-emerald-100 text-emerald-600 text-xs px-2 py-0.5 rounded-full font-bold">
                      {pacientes.length}
                    </span>
                  </h2>
                </div>

                {pacientes.length === 0 ? (
                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center">
                    <p className="text-slate-500 font-medium">Este psicólogo aún no tiene pacientes asignados.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pacientes.map(p => (
                      <div key={p.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4 hover:border-emerald-200 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm uppercase flex-shrink-0">
                          {p.nombre?.[0] || ""}{p.apellido?.[0] || ""}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-dark truncate capitalize leading-tight">{p.nombre} {p.apellido}</p>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{p.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </main>
      </div>

      {/* MODAL PARA EDITAR PSICÓLOGO */}
      {modalEditar && psicologo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-dark">Editar Psicólogo</h2>
              <button onClick={() => setModalEditar(false)} className="text-slate-400 hover:text-dark text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleActualizar} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nombre</label>
                  <input required type="text" value={form.nombre} onChange={e=>setForm({...form, nombre: e.target.value})} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Apellidos</label>
                  <input required type="text" value={form.apellido} onChange={e=>setForm({...form, apellido: e.target.value})} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-primary outline-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Email</label>
                <input required type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-primary outline-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Teléfono</label>
                  <input required type="tel" value={form.telefono} onChange={e=>setForm({...form, telefono: e.target.value})} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Cédula Prof.</label>
                  <input required type="text" value={form.cedula} onChange={e=>setForm({...form, cedula: e.target.value})} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-primary outline-none" />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setModalEditar(false)} className="flex-1 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 border border-slate-200 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} className="flex-1 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-primary-hover transition-colors disabled:opacity-50">
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