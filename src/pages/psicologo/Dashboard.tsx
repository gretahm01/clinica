// ===========================
// src/pages/psicologo/Dashboard.tsx
// ===========================
// Pantalla principal del psicólogo.
// Une el Navbar, Sidebar y Calendario en una sola vista.
//
// Por ahora usamos datos vacíos porque PHP todavía no está
// listo. Cuando tu compañero termine su API, reemplazas
// las llamadas mock por llamadas reales a src/services/api.ts
//
// NOTA PARA CUANDO PHP ESTÉ LISTO:
// 1. import { getCitas, getPacientes } from "../../services/api"
// 2. import type { Cita, Paciente } from "../../types"
// 3. Reemplaza mockCitas por: citas.map(c => citaAEvento(c, nombrePaciente))
// 4. Pega la función citaAEvento con los colores:
//      confirmada → azul apagado  #6B9FD4
//      pendiente  → naranja tenue #E8A87C
//      cancelada  → rosa suave    #C4A0A0
// ===========================

import { useState } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import esLocale from "@fullcalendar/core/locales/es"
import Navbar from "../../components/layout/Navbar"
import Sidebar from "../../components/layout/Sidebar"
import ModalNuevaCita, { type DatosCita } from "../../components/ui/ModalNuevaCita"

// Datos vacíos temporales — se reemplazarán cuando PHP esté listo
const mockCitas: never[] = []
const mockProximasCitas: never[] = []

export default function Dashboard() {

  // Controla si el modal de nueva cita está abierto o cerrado
  const [modalAbierto, setModalAbierto] = useState(false)

  // Guarda la fecha que el psicólogo seleccionó en el calendario
  // para precargarla en el formulario de nueva cita
  const [fechaSeleccionada, setFechaSeleccionada] = useState("")

  // Se ejecuta cuando el psicólogo presiona "+ Nueva Cita" en el sidebar
  function handleNuevaCita() {
    setFechaSeleccionada("")
    setModalAbierto(true)
  }

  // Se ejecuta cuando el psicólogo hace clic en una cita existente
  function handleClickCita(info: { event: { id: string; title: string } }) {
    console.log("Cita seleccionada:", info.event.title)
  }

  // Se ejecuta cuando el psicólogo hace clic en un espacio vacío del calendario
  // Abre el modal con la fecha preseleccionada
  function handleClickFecha(info: { dateStr: string }) {
    setFechaSeleccionada(info.dateStr)
    setModalAbierto(true)
  }

  // Se ejecuta cuando el psicólogo guarda una nueva cita
  // TODO: llamar a crearCita(datos) de src/services/api.ts
  function handleGuardarCita(datos: DatosCita) {
    console.log("Guardar cita:", datos)
    setModalAbierto(false)
  }

  return (
    <div className="min-h-screen bg-background">

      <Navbar />

      <div className="flex">

        <Sidebar
          citasHoy={0}
          citasSemana={0}
          citasPendientes={0}
          proximasCitas={mockProximasCitas}
          onNuevaCita={handleNuevaCita}
        />

        <main className="flex-1 p-6">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              locale={esLocale}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay"
              }}
              events={mockCitas}
              eventClick={handleClickCita}
              dateClick={handleClickFecha}
              slotMinTime="08:00:00"
              slotMaxTime="20:00:00"
              allDaySlot={false}
              height="auto"
            />
          </div>
        </main>

      </div>

      <ModalNuevaCita
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onGuardar={handleGuardarCita}
        pacientes={[]}
        fechaInicial={fechaSeleccionada}
      />

    </div>
  )
}