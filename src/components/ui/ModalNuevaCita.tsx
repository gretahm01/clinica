// ===========================
// src/components/ui/ModalNuevaCita.tsx
// ===========================
// Formulario modal para agendar una cita nueva.
// Se abre cuando el psicólogo presiona "+ Nueva Cita"
// o hace clic en un espacio vacío del calendario.
//
// Recibe "fechaInicial" porque si el psicólogo hizo clic
// en el calendario, ya sabemos qué fecha seleccionó.
// ===========================

import { useState } from "react"
import type { Paciente } from "../../types"

interface ModalNuevaCitaProps {
    abierto: boolean
    onCerrar: () => void
    onGuardar: (datosCita: DatosCita) => void
  pacientes: Paciente[]         // lista de pacientes registrados
  fechaInicial?: string         // fecha preseleccionada si vino del calendario
}

// Forma de los datos que este modal produce al guardar
export interface DatosCita {
    pacienteId: number
    fecha: string
    hora: string
    duracion: number
    tipo: string
    notas: string
}

const TIPOS_CITA = [
    "Terapia individual",
    "Consulta inicial",
    "Seguimiento",
    "Evaluación",
    "Crisis",
]

const DURACIONES = [
    { label: "30 minutos", valor: 30 },
    { label: "45 minutos", valor: 45 },
    { label: "1 hora", valor: 60 },
    { label: "1.5 horas", valor: 90 },
]

export default function ModalNuevaCita({
    abierto,
    onCerrar,
    onGuardar,
    pacientes,
    fechaInicial = "",
}: ModalNuevaCitaProps) {

    const [pacienteId, setPacienteId] = useState<number | "">("")
    const [fecha, setFecha] = useState(fechaInicial)
    const [hora, setHora] = useState("")
    const [duracion, setDuracion] = useState(60)
    const [tipo, setTipo] = useState(TIPOS_CITA[0])
    const [notas, setNotas] = useState("")
    const [error, setError] = useState("")

  // Si el modal no está abierto, no renderiza nada
    if (!abierto) return null

    function handleGuardar() {
    // Validación básica antes de guardar
    if (!pacienteId) return setError("Selecciona un paciente")
    if (!fecha) return setError("Selecciona una fecha")
    if (!hora) return setError("Selecciona una hora")

    onGuardar({
        pacienteId: pacienteId as number,
        fecha,
        hora,
        duracion,
        tipo,
        notas,
    })

    // Limpia el formulario al guardar
    setPacienteId("")
    setFecha("")
    setHora("")
    setDuracion(60)
    setTipo(TIPOS_CITA[0])
    setNotas("")
    setError("")
    }

    function handleCerrar() {
    setError("")
    onCerrar()
    }

    return (
    // Fondo oscuro detrás del modal
    // Al hacer clic fuera del modal, se cierra
    <div
    className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    onClick={handleCerrar}
    >
    {/* Contenido del modal — stopPropagation evita que el clic
          dentro del modal cierre el modal */}
    <div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
    >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-dark">Nueva Cita</h2>
        <button
            onClick={handleCerrar}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
        >
            ×
        </button>
        </div>

        {/* Error */}
        {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">
            {error}
        </div>
        )}

        <div className="space-y-4">

          {/* Paciente */}
        <div>
            <label className="block text-sm font-medium text-dark mb-1">
            Paciente
            </label>
            <select
            value={pacienteId}
            onChange={(e) => setPacienteId(Number(e.target.value))}
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark focus:outline-none focus:ring-2 focus:ring-primary"
            >
            <option value="">Seleccionar paciente...</option>
            {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                {p.nombre} {p.apellido}
                </option>
            ))}
            </select>
        </div>

          {/* Fecha y hora en la misma fila */}
        <div className="grid grid-cols-2 gap-3">
            <div>
            <label className="block text-sm font-medium text-dark mb-1">
                Fecha
            </label>
            <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark focus:outline-none focus:ring-2 focus:ring-primary"
            />
            </div>
            <div>
            <label className="block text-sm font-medium text-dark mb-1">
                Hora
            </label>
            <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark focus:outline-none focus:ring-2 focus:ring-primary"
            />
            </div>
        </div>

          {/* Tipo y duración en la misma fila */}
        <div className="grid grid-cols-2 gap-3">
            <div>
            <label className="block text-sm font-medium text-dark mb-1">
                Tipo de cita
            </label>
            <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark focus:outline-none focus:ring-2 focus:ring-primary"
            >
                {TIPOS_CITA.map((t) => (
                <option key={t} value={t}>{t}</option>
                ))}
            </select>
            </div>
            <div>
            <label className="block text-sm font-medium text-dark mb-1">
                Duración
            </label>
            <select
                value={duracion}
                onChange={(e) => setDuracion(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark focus:outline-none focus:ring-2 focus:ring-primary"
            >
                {DURACIONES.map((d) => (
                <option key={d.valor} value={d.valor}>{d.label}</option>
                ))}
            </select>
            </div>
        </div>

          {/* Notas */}
        <div>
            <label className="block text-sm font-medium text-dark mb-1">
            Notas <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Motivo de la cita, indicaciones especiales..."
            rows={3}
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
        </div>

        </div>

        {/* Botones */}
        <div className="flex gap-3 mt-6">
        <button
            onClick={handleCerrar}
            className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-lg hover:bg-slate-50 transition-colors font-medium"
        >
            Cancelar
        </button>
        <button
            onClick={handleGuardar}
            className="flex-1 bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg transition-colors font-medium"
        >
            Agendar cita
        </button>
        </div>

    </div>
    </div>
    )
}