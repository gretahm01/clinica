// ===========================
// src/pages/psicologo/Paciente.tsx
// ===========================

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../../components/layout/Navbar"
import type { Paciente } from "../../types"
import ModalNuevoPaciente from "../../components/ui/ModalNuevoPaciente"
import { getPacientes } from "../../services/api"

function TarjetaPaciente({
  paciente,
  onClick
}: {
  paciente: Paciente
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:border-primary hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-center gap-3 mb-3">

        {/* Avatar con iniciales del paciente */}
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {paciente.nombre[0]}{paciente.apellido[0]}
        </div>

        <div>
          <p className="font-semibold text-dark">
            {paciente.nombre} {paciente.apellido}
            {paciente.apellidoMaterno && ` ${paciente.apellidoMaterno}`}
          </p>
          <p className="text-xs text-slate-400">{paciente.email}</p>
        </div>

        <span className="ml-auto text-xs px-2 py-1 rounded-full font-medium bg-green-50 text-green-600">
          Activo
        </span>

      </div>

      <div className="flex gap-4 text-xs text-slate-500">
        <span>📞 {paciente.telefono}</span>
        <span>📅 {paciente.totalCitas ?? 0} citas</span>
      </div>
    </div>
  )
}

export default function Pacientes() {
  const navigate = useNavigate()

  // Estados
  const [pacientes, setPacientes]     = useState<Paciente[]>([])
  const [busqueda, setBusqueda]       = useState("")
  const [modalAbierto, setModalAbierto] = useState(false)
  const [cargando, setCargando]       = useState(true)
  const [error, setError]             = useState("")

  // Carga los pacientes del backend al entrar a la pantalla
  useEffect(() => {
    async function cargarPacientes() {
      try {
        const respuesta = await getPacientes()
        if (respuesta.success) {
          setPacientes(respuesta.data)
        } else {
          setError("No se pudieron cargar los pacientes")
        }
      } catch {
        setError("Error de conexión. Verifica que el servidor esté corriendo.")
      } finally {
        setCargando(false)
      }
    }

    cargarPacientes()
  }, []) // [] = solo se ejecuta una vez al cargar la pantalla

  // Filtra pacientes según búsqueda
  const pacientesFiltrados = pacientes.filter((p) => {
    const texto = busqueda.toLowerCase()
    return (
      p.nombre.toLowerCase().includes(texto) ||
      p.apellido.toLowerCase().includes(texto) ||
      p.email.toLowerCase().includes(texto)
    )
  })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-dark">Pacientes</h1>
            <p className="text-slate-500 text-sm mt-1">
              {pacientes.length} paciente{pacientes.length !== 1 ? "s" : ""} registrado{pacientes.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setModalAbierto(true)}
            className="bg-primary hover:bg-primary-hover text-white font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            + Nuevo paciente
          </button>
        </div>

        {/* Buscador */}
        <div className="relative mb-6">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, apellido o correo..."
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Estado de carga */}
        {cargando && (
          <div className="text-center py-16">
            <p className="text-slate-400">Cargando pacientes...</p>
          </div>
        )}

        {/* Error */}
        {!cargando && error && (
          <div className="text-center py-16">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Lista de pacientes o mensaje vacío */}
        {!cargando && !error && (
          pacientesFiltrados.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                👥
              </div>
              <p className="text-dark font-medium">
                {busqueda ? "No se encontraron pacientes" : "No hay pacientes registrados"}
              </p>
              <p className="text-slate-400 text-sm mt-1">
                {busqueda
                  ? "Intenta con otro término de búsqueda"
                  : "Agrega tu primer paciente con el botón de arriba"
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pacientesFiltrados.map((paciente) => (
                <TarjetaPaciente
                  key={paciente.id}
                  paciente={paciente}
                  onClick={() => navigate(`/psicologo/pacientes/${paciente.id}`)}
                />
              ))}
            </div>
          )
        )}

      </div>

      <ModalNuevoPaciente
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onGuardar={(datos) => {
          console.log("Guardar paciente:", datos)
          // TODO: llamar a crearPaciente(datos) de src/services/api.ts
          setModalAbierto(false)
        }}
      />
    </div>
  )
}