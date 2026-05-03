// ===========================
// src/pages/psicologo/ListaTareasPsicologo.tsx
// ===========================

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../../components/layout/Navbar"
import Sidebar from "../../components/layout/Sidebar"
import ModalNuevaCita from "../../components/ui/ModalNuevaCita"
import ModalNuevaTarea from "../../components/ui/ModalNuevaTarea"
import type { Tarea, Paciente } from "../../types"
import { getTodasLasTareas, getPacientes, crearTarea } from "../../services/api"

export default function ListaTareasPsicologo() {
  const navigate = useNavigate()
  
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState("")

  // Modales
  const [modalCitaAbierto, setModalCitaAbierto] = useState(false)
  const [modalTareaAbierto, setModalTareaAbierto] = useState(false)
  const [guardandoTarea, setGuardandoTarea] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    setCargando(true)
    setError("")
    try {
      const [resTareas, resPacientes] = await Promise.all([
        getTodasLasTareas(),
        getPacientes()
      ])
      
      if (resTareas.success) setTareas(Array.isArray(resTareas.data) ? resTareas.data : [])
      if (resPacientes.success) setPacientes(resPacientes.data)
      
    } catch (e) {
      setError("Error de conexión al cargar datos.")
    } finally {
      setCargando(false)
    }
  }

  // Agrupar tareas por estado
  const pendientes = tareas.filter(t => (t.estado || "").toLowerCase().trim() === "pendiente")
  const porRevisar = tareas.filter(t => (t.estado || "").toLowerCase().trim() === "entregada")
  const revisadas  = tareas.filter(t => (t.estado || "").toLowerCase().trim() === "revisada")

  // Función para obtener el nombre del paciente
  // Función para obtener el nombre del paciente
  const getNombrePaciente = (id: number | string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = pacientes.find(pac => Number(pac.id) === Number(id) || Number((pac as any).pacienteId) === Number(id) || Number((pac as any).patient_id) === Number(id));
    return p ? `${p.nombre} ${p.apellido}` : `Paciente #${id}`;
  }

  // Guardar nueva tarea global
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleGuardarTarea = async (datosTarea: any) => {
    setGuardandoTarea(true)
    try {
      const res = await crearTarea({
        pacienteId: datosTarea.pacienteId,
        titulo: datosTarea.titulo,
        contenido: datosTarea.contenido,
        fechaLimite: datosTarea.fechaLimite,
        estado: "pendiente",
        archivo: datosTarea.archivo // <-- AQUÍ PASAMOS EL ARCHIVO
      })
      
      if (res.success) {
        setModalTareaAbierto(false)
        await cargarDatos()
        alert("Tarea asignada con éxito")
      } else {
        alert(res.message || "Error al asignar la tarea")
      }
    } catch (error) {
      alert("Error de conexión al asignar tarea")
    } finally {
      setGuardandoTarea(false)
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar citasHoy={0} citasSemana={0} citasPendientes={0} proximasCitas={[]} onNuevaCita={() => {}} />
          <main className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          citasHoy={0} citasSemana={0} citasPendientes={0} proximasCitas={[]} 
          onNuevaCita={() => setModalCitaAbierto(true)} 
        />

        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-dark">Gestión de Tareas</h1>
              <p className="text-slate-500 font-medium mt-1">Supervisa todas las tareas asignadas a tus pacientes.</p>
            </div>
            <button
              onClick={() => setModalTareaAbierto(true)}
              className="bg-primary hover:bg-primary-hover text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              Crear Tarea
            </button>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 font-medium">{error}</div>}

          {/* CONTENEDOR DE LAS 3 COLUMNAS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* 1. ASIGNADAS (PENDIENTES) */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                  <h2 className="font-bold text-dark uppercase tracking-wider text-xs">Asignadas</h2>
                </div>
                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                  {pendientes.length}
                </span>
              </div>
              <div className="space-y-3">
                {pendientes.length === 0 ? <EmptyState mensaje="Sin tareas asignadas" color="amber" /> : 
                  pendientes.map(t => <CardTareaPsi key={t.id} tarea={t} nombrePaciente={getNombrePaciente(t.pacienteId)} navigate={navigate} colorBorder="amber" />)
                }
              </div>
            </section>

            {/* 2. POR REVISAR (ENTREGADAS) */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div>
                  <h2 className="font-bold text-dark uppercase tracking-wider text-xs">Por Revisar</h2>
                </div>
                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                  {porRevisar.length}
                </span>
              </div>
              <div className="space-y-3">
                {porRevisar.length === 0 ? <EmptyState mensaje="Sin tareas por revisar" color="blue" /> : 
                  porRevisar.map(t => <CardTareaPsi key={t.id} tarea={t} nombrePaciente={getNombrePaciente(t.pacienteId)} navigate={navigate} colorBorder="blue" />)
                }
              </div>
            </section>

            {/* 3. REVISADAS */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                  <h2 className="font-bold text-dark uppercase tracking-wider text-xs">Revisadas</h2>
                </div>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  {revisadas.length}
                </span>
              </div>
              <div className="space-y-3">
                {revisadas.length === 0 ? <EmptyState mensaje="Sin historial reciente" color="emerald" /> : 
                  revisadas.map(t => <CardTareaPsi key={t.id} tarea={t} nombrePaciente={getNombrePaciente(t.pacienteId)} navigate={navigate} colorBorder="emerald" />)
                }
              </div>
            </section>

          </div>
        </main>
      </div>

      <ModalNuevaCita abierto={modalCitaAbierto} onCerrar={() => setModalCitaAbierto(false)} onGuardar={() => {}} pacientes={pacientes} />
      
      {/* Modal Nueva Tarea */}
      <ModalNuevaTarea
        abierto={modalTareaAbierto}
        onCerrar={() => setModalTareaAbierto(false)}
        onGuardar={handleGuardarTarea}
        guardando={guardandoTarea}
        pacientes={pacientes}
      />
    </div>
  )
}

// Sub-componente para la tarjeta de cada tarea (Versión Psicólogo)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CardTareaPsi({ tarea, nombrePaciente, navigate, colorBorder }: { tarea: Tarea, nombrePaciente: string, navigate: any, colorBorder: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const borderColors: any = {
    amber: "hover:border-amber-300",
    blue: "hover:border-blue-300",
    emerald: "hover:border-emerald-300"
  };

  return (
    <div 
      onClick={() => navigate(`/psicologo/pacientes/${tarea.pacienteId}/tareas/${tarea.id}`)}
      className={`bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer ${borderColors[colorBorder]}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-bold text-dark text-sm line-clamp-2 leading-tight">{tarea.titulo}</h3>
      </div>
      <p className="text-xs text-slate-500 font-medium mb-3 flex items-center gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        <span className="truncate">{nombrePaciente}</span>
      </p>
      
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {tarea.estado === 'pendiente' && tarea.fechaLimite ? `Vence: ${new Date(tarea.fechaLimite + "T12:00:00").toLocaleDateString("es-MX", {day:'numeric', month:'short'})}` : ''}
          {tarea.estado === 'entregada' && tarea.fechaEntrega ? `Entregado el: ${new Date(tarea.fechaEntrega).toLocaleDateString("es-MX", {day:'numeric', month:'short'})}` : ''}
          {tarea.estado === 'revisada' ? 'Completado' : ''}
        </span>
        <span className="text-primary text-xs font-bold hover:underline">Ver →</span>
      </div>
    </div>
  )
}

function EmptyState({ mensaje, color }: { mensaje: string, color: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const colors: any = {
    amber: "bg-amber-50 text-amber-500 border-amber-100",
    blue: "bg-blue-50 text-blue-500 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-500 border-emerald-100"
  }
  return (
    <div className={`rounded-xl border border-dashed p-6 text-center ${colors[color]}`}>
      <p className="text-xs font-bold uppercase tracking-wider">{mensaje}</p>
    </div>
  )
}