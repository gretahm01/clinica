// src/pages/admin/AdminSettingsPage.tsx
import { useState } from "react";
import SidebarAdmin from "../../components/layout/SidebarAdmin";
import { Building2, Save, Globe, Shield, Database, Download } from "lucide-react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("clinica");

  const handleSave = () => {
    alert("¡Configuración guardada exitosamente!");
  };

  const tabs = [
    { id: "clinica", label: "Clínica", icon: <Building2 size={16} /> },
    { id: "regionalizacion", label: "Regionalización", icon: <Globe size={16} /> },
    { id: "seguridad", label: "Seguridad", icon: <Shield size={16} /> },
    { id: "respaldos", label: "Respaldos", icon: <Database size={16} /> },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarAdmin />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="sticky top-0 z-10 bg-white border-b border-slate-100 px-7 h-14 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-medium text-dark">Configuración del Sistema</h1>
            <p className="text-xs text-slate-500">Administra los parámetros generales de MedTrack</p>
          </div>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-colors"
          >
            <Save size={14} /> Guardar Cambios
          </button>
        </header>

        <div className="p-7 max-w-5xl">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex min-h-[600px]">
            
            {/* Menú lateral de pestañas */}
            <div className="w-64 border-r border-slate-100 bg-slate-50 p-4 flex flex-col gap-1">
              {tabs.map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id 
                      ? "bg-white border border-slate-200 text-primary shadow-sm" 
                      : "text-slate-500 hover:bg-slate-200/50"
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Contenido Dinámico */}
            <div className="flex-1 p-8">
              
              {/* TAB: CLÍNICA */}
              {activeTab === "clinica" && (
                <div className="animate-fade-in">
                  <h2 className="text-lg font-bold text-dark mb-6">Datos de la Clínica</h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Nombre de la Clínica</label>
                        <input type="text" defaultValue="MedTrack Centro Psicológico" className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm text-dark outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Teléfono Principal</label>
                        <input type="text" defaultValue="+56 9 1111 2222" className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm text-dark outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">Dirección Física</label>
                      <input type="text" defaultValue="Av. Providencia 1234, Oficina 501, Santiago" className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm text-dark outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">Correo de Soporte Técnico</label>
                      <input type="email" defaultValue="soporte@medtrack.cl" className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm text-dark outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: REGIONALIZACIÓN */}
              {activeTab === "regionalizacion" && (
                <div className="animate-fade-in">
                  <h2 className="text-lg font-bold text-dark mb-6">Regionalización e Idioma</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">Zona Horaria</label>
                      <select className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm text-dark outline-none focus:border-primary">
                        <option>America/Santiago (GMT-4)</option>
                        <option>America/Mexico_City (GMT-6)</option>
                        <option>America/Bogota (GMT-6)</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Formato de Fecha</label>
                        <select className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm text-dark outline-none focus:border-primary">
                          <option>DD/MM/YYYY</option>
                          <option>MM/DD/YYYY</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Moneda (Pagos)</label>
                        <select className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm text-dark outline-none focus:border-primary">
                          <option>CLP - Peso Chileno</option>
                          <option>MXN - Peso Mexicano</option>
                          <option>USD - Dólar</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: SEGURIDAD */}
              {activeTab === "seguridad" && (
                <div className="animate-fade-in">
                  <h2 className="text-lg font-bold text-dark mb-6">Políticas de Seguridad</h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-dark">Autenticación de 2 Factores (2FA)</p>
                        <p className="text-xs text-slate-500">Exigir a todo el personal usar 2FA para iniciar sesión.</p>
                      </div>
                      <input type="checkbox" className="w-4 h-4 text-primary focus:ring-primary border-slate-300 rounded" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">Cierre de sesión automático por inactividad</label>
                      <select className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm text-dark outline-none focus:border-primary">
                        <option>15 minutos</option>
                        <option>30 minutos</option>
                        <option>1 hora</option>
                        <option>Nunca (No recomendado)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: RESPALDOS */}
              {activeTab === "respaldos" && (
                <div className="animate-fade-in">
                  <h2 className="text-lg font-bold text-dark mb-6">Respaldos de Base de Datos</h2>
                  <div className="space-y-6">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-dark">Último respaldo automático</p>
                        <p className="text-xs text-slate-500 mt-1">Hoy a las 03:00 AM (24 MB)</p>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-dark text-xs font-medium hover:bg-slate-100 transition-colors">
                        <Download size={14} /> Descargar .SQL
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">Frecuencia de respaldo automático</label>
                      <select className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm text-dark outline-none focus:border-primary">
                        <option>Diario (Madrugada)</option>
                        <option>Semanal (Domingos)</option>
                        <option>Mensual</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}