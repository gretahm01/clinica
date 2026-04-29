// ===========================
// src/components/ui/ModalNuevaCita.tsx
// ===========================

import { useState, useEffect } from "react"

export interface DatosCita {
  pacienteId: number
  fecha: string
  hora: string
  duracion: number
  motivo?: string
}

interface ModalNuevaCitaProps {
  abierto: boolean
  onCerrar: () => void
  onGuardar: (datos: DatosCita) => void
  pacientes: any[]
  fechaInicial?: string
}

export default function ModalNuevaCita({
  abierto,
  onCerrar,
  onGuardar,
  pacientes,
  fechaInicial = "",
}: ModalNuevaCitaProps) {
  
  const [pacienteId, setPacienteId] = useState<string>("")
  const [fecha, setFecha] = useState(fechaInicial)
  const [hora, setHora] = useState("")
  const [duracion, setDuracion] = useState("60") // Por defecto 60 mins
  const [error, setError] = useState("")

  // Generador de horas (8:00 a 20:00)
  const generarHorarios = () => {
    const horas = [];
    for (let h = 8; h <= 20; h++) {
      const horaPad = h.toString().padStart(2, '0');
      horas.push(`${horaPad}:00`);
      if (h < 20) horas.push(`${horaPad}:30`);
    }
    return horas;
  };
  const opcionesHoras = generarHorarios();

  // EFECTO 1: Si hay una fecha inicial (clic en calendario), la pone por defecto
  useEffect(() => {
    if (fechaInicial) setFecha(fechaInicial.split("T")[0]);
  }, [fechaInicial, abierto]);

  // EFECTO 2 (MAGIA): Si solo hay 1 paciente en la lista (ej. desde el Perfil), lo selecciona automático
  useEffect(() => {
    if (pacientes.length === 1) {
      setPacienteId(String(pacientes[0].id));
    }
  }, [pacientes, abierto]);

  if (!abierto) return null

  function handleGuardar() {
    if (!pacienteId) return setError("Selecciona un paciente")
    if (!fecha) return setError("Selecciona una fecha")
    if (!hora) return setError("Selecciona una hora")

    onGuardar({
      pacienteId: Number(pacienteId),
      fecha,
      hora,
      duracion: Number(duracion)
    })

    // Limpiamos (solo si no es paciente único, para no borrar el estado bloqueado)
    if (pacientes.length > 1) setPacienteId("")
    setFecha("")
    setHora("")
    setDuracion("60")
    setError("")
  }

  function handleCerrar() {
    setError("")
    if (pacientes.length > 1) setPacienteId("")
    setFecha("")
    setHora("")
    onCerrar()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4" onClick={handleCerrar}>
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-dark">Agendar Nueva Cita</h2>
          <button onClick={handleCerrar} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-4 font-medium">{error}</div>}

        <div className="space-y-4">
          
          {/* SELECTOR DE PACIENTE INTELIGENTE */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1">Paciente</label>
            {pacientes.length === 1 ? (
              // Si solo hay uno, mostramos su nombre bloqueado
              <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-dark font-medium capitalize">
                {pacientes[0].nombre} {pacientes[0].apellido}
              </div>
            ) : (
              // Si hay muchos, mostramos el selector normal
              <select 
                value={pacienteId} 
                onChange={(e) => setPacienteId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark focus:ring-2 focus:ring-primary outline-none bg-white capitalize"
              >
                <option value="">Seleccionar paciente...</option>
                {pacientes.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Fecha</label>
              <input 
                type="date" 
                value={fecha} 
                onChange={(e) => setFecha(e.target.value)} 
                min={new Date().toISOString().split("T")[0]}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark focus:ring-2 focus:ring-primary outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Hora</label>
              <select 
                value={hora} 
                onChange={(e) => setHora(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark focus:ring-2 focus:ring-primary outline-none bg-white"
              >
                <option value="">Hora...</option>
                {opcionesHoras.map(h => (
                  <option key={h} value={h}>{h} hrs</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1">Duración estimada</label>
            <select 
              value={duracion} 
              onChange={(e) => setDuracion(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark focus:ring-2 focus:ring-primary outline-none bg-white"
            >
              <option value="30">30 minutos</option>
              <option value="60">60 minutos (1 hora)</option>
              <option value="90">90 minutos (1 hora y media)</option>
              <option value="120">120 minutos (2 horas)</option>
            </select>
          </div>

        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={handleCerrar} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-lg hover:bg-slate-50 transition-colors font-medium">Cancelar</button>
          <button onClick={handleGuardar} className="flex-1 bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg transition-colors font-medium">Agendar</button>
        </div>

      </div>
    </div>
  )
}