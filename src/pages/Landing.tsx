// ===========================
// src/pages/Landing.tsx
// ===========================

import { useState } from "react"
import { useNavigate } from "react-router-dom"

const FEATURES = [
  {
    titulo: "Agenda inteligente",
    descripcion: "Gestiona citas con un calendario visual. Evita conflictos de horario y recibe recordatorios automáticos.",
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    titulo: "Expedientes clínicos",
    descripcion: "Historial completo por paciente: diagnósticos, notas de sesión, metas terapéuticas y más.",
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    titulo: "Tareas terapéuticas",
    descripcion: "Asigna tareas entre sesiones, adjunta archivos y da seguimiento al progreso del paciente.",
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    titulo: "Gestión de pacientes",
    descripcion: "Registra y administra tu lista de pacientes con búsqueda rápida y acceso a su perfil completo.",
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    titulo: "Seguridad y privacidad",
    descripcion: "Acceso por roles: psicólogo, secretaria y paciente. Cada uno ve solo lo que le corresponde.",
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    titulo: "Estadísticas rápidas",
    descripcion: "Visualiza citas del día, semana y pendientes desde el dashboard principal.",
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

const ROLES = [
  {
    rol: "Psicólogo",
    descripcion: "Gestiona tu agenda, expedientes clínicos, notas de sesión y tareas para pacientes.",
    color: "bg-primary",
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    rol: "Secretaria",
    descripcion: "Agenda citas, registra pacientes y administra los espacios disponibles del consultorio.",
    color: "bg-dark",
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    rol: "Paciente",
    descripcion: "Consulta tus citas, revisa las tareas asignadas y comunícate con tu psicólogo.",
    color: "bg-slate-500",
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
]

const PLANES = [
  {
    nombre: "Básico",
    precioMensual: 299,
    precioAnual: 239,
    descripcion: "Ideal para consultorios pequeños o psicólogos independientes.",
    incluye: [
      "Hasta 30 pacientes activos",
      "Agenda y calendario",
      "Expedientes clínicos",
      "1 usuario (psicólogo)",
    ],
    destacado: false,
  },
  {
    nombre: "Profesional",
    precioMensual: 599,
    precioAnual: 479,
    descripcion: "Para clínicas en crecimiento con equipo de trabajo.",
    incluye: [
      "Pacientes ilimitados",
      "Agenda y calendario",
      "Expedientes clínicos",
      "Tareas terapéuticas",
      "Hasta 3 usuarios (psicólogos + secretaria)",
      "Archivos adjuntos",
    ],
    destacado: true,
  },
  {
    nombre: "Clínica",
    precioMensual: 999,
    precioAnual: 799,
    descripcion: "Para clínicas grandes con múltiples profesionales.",
    incluye: [
      "Todo lo del plan Profesional",
      "Usuarios ilimitados",
      "Panel de administración",
      "Soporte prioritario",
      "Reportes avanzados",
    ],
    destacado: false,
  },
]

function IconoCheck() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const [esAnual, setEsAnual] = useState(false)

  return (
    <div className="min-h-screen bg-white">

      {/* NAVBAR */}
      <nav className="sticky top-0 bg-white border-b border-slate-100 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="font-bold text-dark text-lg">MedTrack</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-500">
            <a href="#funciones" className="hover:text-dark transition-colors">Funciones</a>
            <a href="#roles" className="hover:text-dark transition-colors">¿Para quién?</a>
            <a href="#precios" className="hover:text-dark transition-colors">Precios</a>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="bg-primary hover:bg-primary-hover text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
          >
            Iniciar sesión
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-background">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 text-center">
          <span className="inline-block bg-white border border-slate-200 text-primary text-xs font-medium px-4 py-1.5 rounded-full mb-6">
            Sistema de gestión psicológica
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-dark leading-tight mb-6">
            La clínica psicológica,{" "}
            <span className="text-primary">organizada</span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            MedTrack centraliza la agenda, expedientes clínicos y seguimiento
            de pacientes en un solo lugar. Más tiempo para lo que importa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/registro")}
              className="bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
            >
              Prueba gratis
            </button>
            <a
              href="#funciones"
              className="border border-slate-200 text-dark hover:bg-slate-50 font-medium px-8 py-3.5 rounded-xl transition-colors text-base inline-block"
            >
              Ver funciones →
            </a>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="funciones" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              Todo lo que necesita tu clínica
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Herramientas diseñadas para el flujo real de trabajo de una clínica psicológica.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div key={feature.titulo} className="bg-background rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  {feature.icono}
                </div>
                <h3 className="font-semibold text-dark text-lg mb-2">{feature.titulo}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              Un sistema, tres roles
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Cada usuario accede solo a lo que necesita según su rol en la clínica.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ROLES.map((item) => (
              <div key={item.rol} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center mb-4`}>
                  {item.icono}
                </div>
                <h3 className="font-bold text-dark text-xl mb-2">{item.rol}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRECIOS */}
      <section id="precios" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              Planes simples y transparentes
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto mb-8">
              Elige el plan que mejor se adapte a tu clínica. Sin costos ocultos.
            </p>
            {/* Toggle mensual / anual */}
            <div className="inline-flex items-center gap-3 bg-background rounded-full p-1">
              <button
                onClick={() => setEsAnual(false)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  !esAnual ? "bg-white text-dark shadow-sm" : "text-slate-500"
                }`}
              >
                Mensual
              </button>
              <button
                onClick={() => setEsAnual(true)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  esAnual ? "bg-white text-dark shadow-sm" : "text-slate-500"
                }`}
              >
                Anual
                <span className="ml-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                  −20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {PLANES.map((plan) => (
              <div
                key={plan.nombre}
                className={`rounded-2xl p-6 ${
                  plan.destacado
                    ? "bg-dark text-white shadow-xl scale-105"
                    : "bg-background shadow-sm"
                }`}
              >
                {plan.destacado && (
                  <span className="inline-block bg-primary text-white text-xs font-medium px-3 py-1 rounded-full mb-4">
                    Recomendado
                  </span>
                )}
                <h3 className={`font-bold text-xl mb-1 ${plan.destacado ? "text-white" : "text-dark"}`}>
                  {plan.nombre}
                </h3>
                <p className={`text-sm mb-4 ${plan.destacado ? "text-slate-300" : "text-slate-500"}`}>
                  {plan.descripcion}
                </p>
                <div className="mb-6">
                  <span className={`text-4xl font-bold ${plan.destacado ? "text-white" : "text-dark"}`}>
                    ${esAnual ? plan.precioAnual : plan.precioMensual}
                  </span>
                  <span className={`text-sm ml-1 ${plan.destacado ? "text-slate-300" : "text-slate-500"}`}>
                    /mes
                  </span>
                  {esAnual && (
                    <p className="text-xs mt-1 text-slate-400">
                      Facturado anualmente (${plan.precioAnual * 12}/año)
                    </p>
                  )}
                </div>

                {/* Botón "Prueba gratis" → navega a /registro */}
                <button
                  onClick={() => navigate("/registro")}
                  className={`w-full py-2.5 rounded-xl font-medium text-sm transition-colors mb-6 ${
                    plan.destacado
                      ? "bg-primary hover:bg-primary-hover text-white"
                      : "bg-white hover:bg-slate-50 text-dark border border-slate-200"
                  }`}
                >
                  Prueba gratis
                </button>

                <ul className="flex flex-col gap-2.5">
                  {plan.incluye.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <IconoCheck />
                      <span className={plan.destacado ? "text-slate-300" : "text-slate-600"}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">¿Listo para empezar?</h2>
          <p className="text-slate-500 text-lg mb-8">Accede al sistema con tus credenciales asignadas.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/registro")}
              className="bg-primary hover:bg-primary-hover text-white font-semibold px-10 py-4 rounded-xl transition-colors text-base"
            >
              Prueba gratis →
            </button>
            <button
              onClick={() => navigate("/login")}
              className="border border-slate-200 text-dark hover:bg-white font-medium px-10 py-4 rounded-xl transition-colors text-base"
            >
              Ya tengo cuenta
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-dark text-white py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="font-bold text-lg">MedTrack</span>
          </div>
          <p className="text-slate-400 text-sm">© 2026 MedTrack · Instituto de Estudios Superiores de Tamaulipas</p>
        </div>
      </footer>

    </div>
  )
}