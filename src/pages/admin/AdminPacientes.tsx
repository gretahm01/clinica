import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../../components/layout/Navbar"
import SidebarAdmin from "../../components/layout/SidebarAdmin"
import { getTodosPacientesAdmin, getTodosPsicologos, crearPacienteAdmin } from "../../services/api"
import type { Paciente, Profesional } from "../../types"

export default function AdminPacientes() {
  const navigate = useNavigate()
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [psicologos, setPsicologos] = useState<Profesional[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [cargando, setCargando] = useState(true)
  
  const [modalAbierto, setModalAbierto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState({ nombre: "", apellido: "", email: "", telefono: "", fechaNacimiento: "", psicologoId: 0 })

  useEffect(() => { 
    cargarDatos() 
  }, [])

  async function cargarDatos() {
    setCargando(true)
    try {
      const [resPac, resPsi] = await Promise.all([ getTodosPacientesAdmin(), getTodosPsicologos() ])
      if (resPac.success) setPacientes(resPac.data)
      if (resPsi.success) setPsicologos(resPsi.data)
    } catch {
      console.error("Error de conexión")
    } finally {
      setCargando(false)
    }
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault()
    if (!form.psicologoId) return alert("Selecciona un psicólogo")
    
    setGuardando(true)
    try {
      const res = await crearPacienteAdmin(form as any)
      if (res.success) {
        setModalAbierto(false)
        setForm({ nombre: "", apellido: "", email: "", telefono: "", fechaNacimiento: "", psicologoId: 0 })
        await cargarDatos()
      } else {
        alert(res.message || "Error al registrar")
      }
    } catch {
      alert("Error de conexión al registrar")
    } finally {
      setGuardando(false)
    }
  }

  const filtrados = pacientes.filter(p => 
    (p.nombre?.toLowerCase() || "").includes(busqueda.toLowerCase()) ||
    (p.email?.toLowerCase() || "").includes(busqueda.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <SidebarAdmin />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-dark">Pacientes</h1>
              <p className="text-slate-400 text-sm mt-0.5">Directorio general de pacientes</p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar paciente..."
                className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm w-64 focus:ring-2 focus:ring-primary outline-none"
              />
              <button
                onClick={() => setModalAbierto(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm flex items-center gap-2"
              >
                + Nuevo Paciente
              </button>
            </div>
          </div>

          {cargando ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <p className="text-slate-400 font-medium">No hay pacientes registrados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtrados.map(p => (
                <div key={p.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg uppercase flex-shrink-0">
                    {p.nombre?.[0] || ""}{p.apellido?.[0] || ""}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-dark truncate capitalize">{p.nombre} {p.apellido}</p>
                    <p className="text-xs text-slate-400 truncate">{p.email}</p>
                    <p className="text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded uppercase font-bold w-fit mt-1 border border-slate-100 truncate max-w-full">
                      Asignado a: Ps. ID #{p.profesionalId || "?"}
                    </p>
                  </div>
                  
                  {/* 👇 AQUÍ ESTÁ EL BOTÓN QUE FALTABA 👇 */}
                  <button 
                    onClick={() => navigate(`/admin/pacientes/${p.id}`)} 
                    className="text-xs text-emerald-600 font-bold hover:underline whitespace-nowrap"
                  >
                    Ver Perfil
                  </button>

                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-dark">Alta de Paciente</h2>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-dark text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleGuardar} className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-2">
                <label className="block text-[11px] font-bold text-emerald-600 uppercase mb-1.5 tracking-wider">Asignar a Psicólogo</label>
                <select 
                  required
                  value={form.psicologoId}
                  onChange={e => setForm({...form, psicologoId: Number(e.target.value)})}
                  className="w-full border border-emerald-200 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-dark"
                >
                  <option value={0}>Selecciona un profesional...</option>
                  {psicologos.map(psi => (
                    <option key={psi.id} value={psi.id}>Ps. {psi.nombre} {psi.apellido}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nombre</label><input required type="text" value={form.nombre} onChange={e=>setForm({...form, nombre: e.target.value})} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm" /></div>
                <div><label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Apellidos</label><input required type="text" value={form.apellido} onChange={e=>setForm({...form, apellido: e.target.value})} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm" /></div>
              </div>
              <div><label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Email</label><input required type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Teléfono</label><input required type="tel" value={form.telefono} onChange={e=>setForm({...form, telefono: e.target.value})} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm" /></div>
                <div><label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nacimiento</label><input required type="date" value={form.fechaNacimiento} onChange={e=>setForm({...form, fechaNacimiento: e.target.value})} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm text-slate-600" /></div>
              </div>
              
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center mt-2">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Contraseña por defecto</p>
                <p className="text-sm font-bold text-dark mt-0.5">password123</p>
              </div>

              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setModalAbierto(false)} className="flex-1 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 border border-slate-200 transition-colors">Cancelar</button>
                <button type="submit" disabled={guardando} className="flex-1 py-2.5 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors disabled:opacity-50">{guardando ? 'Guardando...' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}