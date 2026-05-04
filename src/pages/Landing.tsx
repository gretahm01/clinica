// ===========================
// src/pages/Landing.tsx
// ===========================

import { useNavigate } from "react-router-dom"

// IMPORTACIÓN DE IMÁGENES (Vite necesita esto si están en src/assets)
import imgHero from "../assets/undraw_schedule-cleanup_1xs7.svg"
import imgAgenda from "../assets/undraw_question-answered_ezyn.svg"
import imgExpediente from "../assets/undraw_doctors-orders_a8sv.svg"
import imgTareas from "../assets/undraw_reading-notes_dg9z.svg"

const FEATURES = [
  {
    titulo: "Agenda inteligente",
    descripcion: "Gestiona citas con un calendario visual. Evita conflictos de horario y recibe recordatorios.",
    colorIcon: "text-emerald-600",
    colorBg: "bg-emerald-50",
    colorBorder: "border-emerald-100",
    imagen: imgAgenda,
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    titulo: "Expedientes clínicos",
    descripcion: "Historial completo: diagnósticos, notas de sesión, metas terapéuticas y seguimiento detallado.",
    colorIcon: "text-blue-600",
    colorBg: "bg-blue-50",
    colorBorder: "border-blue-100",
    imagen: imgExpediente,
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    titulo: "Tareas terapéuticas",
    descripcion: "Asigna actividades, adjunta material de apoyo y revisa las entregas de tus pacientes.",
    colorIcon: "text-indigo-600",
    colorBg: "bg-indigo-50",
    colorBorder: "border-indigo-100",
    imagen: imgTareas,
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
]

const ROLES = [
  {
    rol: "Psicólogo",
    descripcion: "Control total de la consulta: agenda, expedientes clínicos privados y asignación de tareas terapéuticas.",
    iconoColor: "bg-emerald-500",
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    rol: "Paciente",
    descripcion: "Acceso personal para revisar citas agendadas, realizar tareas asignadas y ver su propio progreso.",
    iconoColor: "bg-blue-500",
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white font-medium text-slate-700 selection:bg-emerald-100 tracking-tight">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-slate-900 text-xl tracking-tighter">MedTrack</span>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="text-sm font-bold text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="bg-emerald-100/80 pt-24 pb-32 border-b border-emerald-200/50">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-medium text-slate-900 leading-tight mb-8">
              Toda tu práctica clínica en <br/>
              <span className="text-emerald-600 font-bold">un solo lugar.</span>
            </h1>
            <p className="text-slate-600 text-lg md:text-2xl mb-12 leading-relaxed font-light max-w-xl">
              La plataforma segura y eficiente para psicólogos que buscan elevar el nivel de atención y seguimiento de sus pacientes.
            </p>
            <div className="flex justify-center md:justify-start">
              <button
                onClick={() => navigate("/login")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-12 py-4 rounded-full transition-all text-lg shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Iniciar Sesión
              </button>
            </div>
          </div>

          <div className="flex-1 hidden md:block">
            <img 
              src={imgHero}
              alt="Organización Médica" 
              className="w-full max-w-md mx-auto drop-shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="funciones" className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {FEATURES.map((feature) => (
              <div 
                key={feature.titulo} 
                className={`flex flex-col p-8 rounded-[2.5rem] border-2 ${feature.colorBorder} bg-white transition-all duration-300 hover:shadow-xl group`}
              >
                <div className="mb-8 h-48 flex items-center justify-center">
                   <img src={feature.imagen} alt={feature.titulo} className="max-h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 mx-auto sm:mx-0 ${feature.colorBg} ${feature.colorIcon} border ${feature.colorBorder} shadow-sm`}>
                  {feature.icono}
                </div>
                <h3 className="font-bold text-slate-900 text-xl mb-4 text-center sm:text-left">{feature.titulo}</h3>
                <p className="text-slate-500 text-sm md:text-base leading-relaxed font-light text-center sm:text-left">{feature.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES SECTION */}
      <section id="roles" className="py-28 bg-emerald-50/80 border-y border-emerald-100/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-medium text-slate-900 mb-3 tracking-tight">
              Diseñado para la colaboración
            </h2>
            <div className="h-1 w-16 bg-emerald-300 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {ROLES.map((item) => (
              <div 
                key={item.rol} 
                className="p-10 rounded-[2.5rem] border border-white bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className={`${item.iconoColor} w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-sm`}>
                  {item.icono}
                </div>
                <h3 className="font-bold text-2xl text-slate-900 mb-4">{item.rol}</h3>
                <p className="text-slate-600 text-lg leading-relaxed font-light">
                  {item.descripcion}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white py-20 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-8">
          <div className="flex items-center gap-3 grayscale opacity-70">
            <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">M</span>
            </div>
            <span className="font-bold text-slate-900 text-lg">MedTrack</span>
          </div>
          
          <div className="text-center space-y-3">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">
              Desarrollado por
            </p>
            <p className="text-slate-600 text-base md:text-lg font-medium">
              Camila Martinez · Greta Hernandez · Jorge Martinez · Valeria Almanza
            </p>
          </div>

          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest pt-4">
            © 2026 MedTrack · Todos los derechos reservados
          </p>
        </div>
      </footer>

    </div>
  )
}