// src/pages/admin/AdminPatientsPage.tsx
import { useState, useEffect, useCallback } from "react";
import SidebarAdmin from "../../components/layout/SidebarAdmin";
import {
  Search, Plus, Filter, Eye, Edit2, Trash2,
  ChevronDown, ChevronUp, X, Mail, Phone,
  Calendar, User, UserCheck, Clock, Loader2,
  AlertTriangle, Download, RefreshCw, MapPin,
  Activity, FileText, ShieldCheck,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PatientStatus = "active" | "discharged" | "pending" | "on_hold";

export interface Patient {
  id: number;
  fullName: string;
  rut: string;               // Chilean ID
  email: string;
  phone: string;
  birthDate: string;         // ISO
  city: string;
  assignedProfessional: string;
  professionalId: number;
  status: PatientStatus;
  registeredAt: string;      // ISO
  lastAppointment: string | null;
  nextAppointment: string | null;
  totalSessions: number;
  diagnosis: string;
  avatarInitials: string;
  avatarColor: string;
}

interface PatientFilters {
  search:         string;
  status:         PatientStatus | "";
  professionalId: number | "";
  sort:           "name" | "registered" | "lastAppointment" | "sessions";
  dir:            "asc" | "desc";
  page:           number;
}

interface PaginatedPatients {
  items:         Patient[];
  total:         number;
  professionals: { id: number; name: string }[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 8;

const STATUS_CONFIG: Record<PatientStatus, {
  label: string; bg: string; text: string; icon: React.ReactNode;
}> = {
  active:     { label: "Activo",       bg: "bg-green-100",  text: "text-green-700",  icon: <UserCheck size={11} /> },
  discharged: { label: "Alta",         bg: "bg-blue-100",   text: "text-blue-700",   icon: <ShieldCheck size={11} /> },
  pending:    { label: "Pendiente",    bg: "bg-yellow-100", text: "text-yellow-700", icon: <Clock size={11} /> },
  on_hold:    { label: "En pausa",     bg: "bg-slate-100",  text: "text-slate-700",  icon: <Activity size={11} /> },
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PROFESSIONALS = [
  { id: 1, name: "Dra. María Rojas"   },
  { id: 2, name: "Dr. Carlos Gómez"  },
  { id: 3, name: "Ps. Valentina Mora" },
  { id: 6, name: "Dr. Sebastián Ríos" },
  { id: 9, name: "Dra. Patricia Núñez" },
];

const MOCK_PATIENTS: Patient[] = [
  { id: 1,  fullName: "Felipe Araya Soto",       rut: "12.345.678-9", email: "f.araya@email.com",     phone: "+56 9 1111 2222", birthDate: "1990-04-12", city: "Santiago",     assignedProfessional: "Dra. María Rojas",    professionalId: 1, status: "active",     registeredAt: "2024-01-15", lastAppointment: "2026-04-18", nextAppointment: "2026-05-02", totalSessions: 14, diagnosis: "Trastorno de ansiedad",        avatarInitials: "FA", avatarColor: "bg-blue-100" },
  { id: 2,  fullName: "Valentina Torres",        rut: "15.678.901-2", email: "v.torres@email.com",    phone: "+56 9 2222 3333", birthDate: "1985-09-03", city: "Viña del Mar", assignedProfessional: "Dr. Carlos Gómez",   professionalId: 2, status: "active",     registeredAt: "2023-08-22", lastAppointment: "2026-04-15", nextAppointment: "2026-04-29", totalSessions: 31, diagnosis: "Depresión mayor",              avatarInitials: "VT", avatarColor: "bg-green-100" },
  { id: 3,  fullName: "Andrés Muñoz Lagos",      rut: "18.901.234-5", email: "a.munoz@email.com",     phone: "+56 9 3333 4444", birthDate: "1975-12-20", city: "Concepción",   assignedProfessional: "Ps. Valentina Mora",  professionalId: 3, status: "discharged", registeredAt: "2022-03-10", lastAppointment: "2025-11-30", nextAppointment: null,          totalSessions: 52, diagnosis: "Duelo",                        avatarInitials: "AM", avatarColor: "bg-yellow-100" },
  { id: 4,  fullName: "Catalina Fernández",      rut: "20.123.456-7", email: "c.fernandez@email.com", phone: "+56 9 4444 5555", birthDate: "2001-06-08", city: "Santiago",     assignedProfessional: "Dra. Patricia Núñez", professionalId: 9, status: "pending",    registeredAt: "2026-04-01", lastAppointment: null,          nextAppointment: "2026-04-28", totalSessions: 0,  diagnosis: "Por evaluar",                  avatarInitials: "CF", avatarColor: "bg-red-100" },
  { id: 5,  fullName: "Roberto Sánchez Vega",    rut: "9.876.543-2",  email: "r.sanchez@email.com",   phone: "+56 9 5555 6666", birthDate: "1968-02-14", city: "La Serena",    assignedProfessional: "Dra. María Rojas",    professionalId: 1, status: "on_hold",    registeredAt: "2023-11-05", lastAppointment: "2026-02-10", nextAppointment: null,          totalSessions: 8,  diagnosis: "Fobia social",                 avatarInitials: "RS", avatarColor: "bg-slate-200" },
  { id: 6,  fullName: "Isidora Pérez Castro",    rut: "16.234.567-8", email: "i.perez@email.com",     phone: "+56 9 6666 7777", birthDate: "1994-11-29", city: "Santiago",     assignedProfessional: "Dr. Carlos Gómez",   professionalId: 2, status: "active",     registeredAt: "2024-05-17", lastAppointment: "2026-04-20", nextAppointment: "2026-05-04", totalSessions: 22, diagnosis: "TDAH adulto",                  avatarInitials: "IP", avatarColor: "bg-purple-100" },
  { id: 7,  fullName: "Matías Contreras",        rut: "21.345.678-9", email: "m.contreras@email.com", phone: "+56 9 7777 8888", birthDate: "2003-07-15", city: "Temuco",       assignedProfessional: "Ps. Valentina Mora",  professionalId: 3, status: "active",     registeredAt: "2025-02-28", lastAppointment: "2026-04-10", nextAppointment: "2026-04-24", totalSessions: 9,  diagnosis: "Ansiedad adolescente",         avatarInitials: "MC", avatarColor: "bg-blue-100" },
  { id: 8,  fullName: "Francisca Ramos",         rut: "14.567.890-1", email: "f.ramos@email.com",     phone: "+56 9 8888 9999", birthDate: "1988-03-22", city: "Valparaíso",   assignedProfessional: "Dr. Sebastián Ríos",  professionalId: 6, status: "active",     registeredAt: "2023-06-14", lastAppointment: "2026-04-17", nextAppointment: "2026-05-01", totalSessions: 40, diagnosis: "TOC",                          avatarInitials: "FR", avatarColor: "bg-yellow-100" },
  { id: 9,  fullName: "Juan Pablo Díaz",         rut: "10.987.654-3", email: "jp.diaz@email.com",     phone: "+56 9 9999 0000", birthDate: "1972-08-30", city: "Santiago",     assignedProfessional: "Dra. Patricia Núñez", professionalId: 9, status: "discharged", registeredAt: "2021-09-01", lastAppointment: "2025-09-15", nextAppointment: null,          totalSessions: 67, diagnosis: "Trastorno del ánimo",          avatarInitials: "JD", avatarColor: "bg-red-100" },
  { id: 10, fullName: "Sofía Ibáñez Mora",       rut: "22.456.789-0", email: "s.ibanez@email.com",    phone: "+56 9 0000 1111", birthDate: "2000-01-10", city: "Santiago",     assignedProfessional: "Dra. María Rojas",    professionalId: 1, status: "pending",    registeredAt: "2026-04-10", lastAppointment: null,          nextAppointment: "2026-04-25", totalSessions: 0,  diagnosis: "Por evaluar",                  avatarInitials: "SI", avatarColor: "bg-green-100" },
  { id: 11, fullName: "Rodrigo Espinosa",        rut: "17.890.123-4", email: "r.espinosa@email.com",  phone: "+56 9 1122 3344", birthDate: "1983-05-25", city: "Antofagasta",  assignedProfessional: "Dr. Carlos Gómez",   professionalId: 2, status: "active",     registeredAt: "2024-10-03", lastAppointment: "2026-04-19", nextAppointment: "2026-05-03", totalSessions: 17, diagnosis: "Estrés laboral crónico",       avatarInitials: "RE", avatarColor: "bg-blue-100" },
  { id: 12, fullName: "Daniela Lara Fuentes",    rut: "19.234.567-1", email: "d.lara@email.com",      phone: "+56 9 2233 4455", birthDate: "1997-10-18", city: "Rancagua",     assignedProfessional: "Dr. Sebastián Ríos",  professionalId: 6, status: "on_hold",    registeredAt: "2025-07-20", lastAppointment: "2026-01-15", nextAppointment: null,          totalSessions: 5,  diagnosis: "Trauma complejo",              avatarInitials: "DL", avatarColor: "bg-slate-200" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" });
}

function calcAge(iso: string): number {
  const diff = Date.now() - new Date(iso).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

function usePatients(filters: PatientFilters) {
  const [data, setData]       = useState<PaginatedPatients>({ items: [], total: 0, professionals: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetch_ = useCallback(() => {
    setLoading(true);
    setError(null);

    setTimeout(() => {
      try {
        let result = [...MOCK_PATIENTS];

        if (filters.search) {
          const q = filters.search.toLowerCase();
          result = result.filter(p =>
            p.fullName.toLowerCase().includes(q) ||
            p.email.toLowerCase().includes(q) ||
            p.rut.includes(q) ||
            p.city.toLowerCase().includes(q)
          );
        }
        if (filters.status)         result = result.filter(p => p.status         === filters.status);
        if (filters.professionalId) result = result.filter(p => p.professionalId === filters.professionalId);

        result.sort((a, b) => {
          let v = 0;
          if (filters.sort === "name")            v = a.fullName.localeCompare(b.fullName);
          if (filters.sort === "registered")      v = a.registeredAt.localeCompare(b.registeredAt);
          if (filters.sort === "sessions")        v = a.totalSessions - b.totalSessions;
          if (filters.sort === "lastAppointment") v = (a.lastAppointment ?? "").localeCompare(b.lastAppointment ?? "");
          return filters.dir === "asc" ? v : -v;
        });

        const total = result.length;
        const items = result.slice((filters.page - 1) * PAGE_SIZE, filters.page * PAGE_SIZE);
        setData({ items, total, professionals: MOCK_PROFESSIONALS });
      } catch {
        setError("Error al cargar los pacientes.");
      } finally {
        setLoading(false);
      }
    }, 300);

  }, [filters]);

  useEffect(() => { fetch_(); }, [fetch_]);
  return { ...data, loading, error, refetch: fetch_ };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PatientStatus }) {
  const c = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {c.icon}{c.label}
    </span>
  );
}

function SortHeader({
  label, field, current, dir, onSort,
}: {
  label: string;
  field: PatientFilters["sort"] | null;
  current: PatientFilters["sort"];
  dir: PatientFilters["dir"];
  onSort: (f: PatientFilters["sort"]) => void;
}) {
  const active = field === current;
  return (
    <th
      className={`text-left text-[11px] font-semibold uppercase tracking-wide px-5 py-3 border-b border-slate-100 whitespace-nowrap select-none ${
        field ? "cursor-pointer hover:text-primary" : ""
      } ${active ? "text-primary" : "text-slate-400"}`}
      onClick={() => field && onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {field && (
          active
            ? (dir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)
            : <ChevronDown size={12} className="opacity-30" />
        )}
      </span>
    </th>
  );
}

// ─── Patient Detail Drawer ────────────────────────────────────────────────────

function PatientDrawer({
  patient,
  onClose,
  onDelete,
  onEdit,
  onHistory
}: {
  patient: Patient;
  onClose: () => void;
  onDelete: (p: Patient) => void;
  onEdit: (p: Patient) => void;
  onHistory: (p: Patient) => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/20" onClick={onClose} />
      <aside className="w-[420px] bg-white h-full overflow-y-auto shadow-2xl flex flex-col">

        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-sm font-semibold text-dark">Ficha del paciente</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-slate-100 text-slate-400">
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-6 flex items-center gap-4 border-b border-slate-100">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-semibold flex-shrink-0 text-dark ${patient.avatarColor}`}
          >
            {patient.avatarInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-dark truncate">{patient.fullName}</p>
            <p className="text-xs text-slate-500 mt-0.5">{patient.rut} · {calcAge(patient.birthDate)} años</p>
            <div className="mt-2 flex items-center gap-2">
              <StatusBadge status={patient.status} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 px-6 py-4 border-b border-slate-100 bg-background">
          {[
            { label: "Sesiones",       value: String(patient.totalSessions) },
            { label: "Última cita",    value: formatDate(patient.lastAppointment) },
            { label: "Próxima cita",   value: formatDate(patient.nextAppointment) },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-[11px] text-slate-400 uppercase tracking-wide">{s.label}</p>
              <p className="text-sm font-semibold text-dark mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="px-6 py-5 grid gap-4">
          {[
            { icon: <Mail size={14} />,     label: "Email",        value: patient.email },
            { icon: <Phone size={14} />,    label: "Teléfono",     value: patient.phone },
            { icon: <MapPin size={14} />,   label: "Ciudad",       value: patient.city },
            { icon: <User size={14} />,     label: "Profesional",  value: patient.assignedProfessional },
            { icon: <FileText size={14} />, label: "Diagnóstico",  value: patient.diagnosis },
            { icon: <Calendar size={14} />, label: "Registrado",   value: formatDate(patient.registeredAt) },
          ].map(row => (
            <div key={row.label} className="flex items-start gap-3">
              <span className="mt-0.5 text-primary flex-shrink-0">{row.icon}</span>
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-wide">{row.label}</p>
                <p className="text-sm text-dark mt-0.5">{row.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 pb-6 mt-auto flex flex-col gap-2">
          <button 
            onClick={() => onEdit(patient)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            <Edit2 size={14} /> Editar ficha
          </button>
          <button 
            onClick={() => onHistory(patient)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <Eye size={14} /> Ver historial de citas
          </button>
          <button
            onClick={() => { onDelete(patient); onClose(); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} /> Eliminar paciente
          </button>
        </div>
      </aside>
    </div>
  );
}

// ─── Add Patient Modal ────────────────────────────────────────────────────────

function AddPatientModal({ professionals, onClose, pacienteInicial }: {
  professionals: { id: number; name: string }[];
  onClose: () => void;
  pacienteInicial?: Patient | null;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: pacienteInicial?.fullName || "", 
    rut: pacienteInicial?.rut || "", 
    email: pacienteInicial?.email || "", 
    phone: pacienteInicial?.phone || "",
    birthDate: pacienteInicial?.birthDate || "", 
    city: pacienteInicial?.city || "", 
    professionalId: pacienteInicial?.professionalId || "",
    diagnosis: pacienteInicial?.diagnosis || "", 
    status: pacienteInicial?.status || "pending" as PatientStatus,
  });

  const handleSubmit = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    setSaving(false);
    onClose();
  };

  const field = (label: string, key: keyof typeof form, type = "text", placeholder = "") => (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
      <input
        type={type}
        value={form[key] as string}
        placeholder={placeholder}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-dark outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition placeholder:text-slate-300"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/25" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <h2 className="text-sm font-semibold text-dark">
            {pacienteInicial ? "Editar paciente" : "Registrar nuevo paciente"}
          </h2>
          <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-slate-100 text-slate-400">
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">{field("Nombre completo", "fullName", "text", "Ej: Felipe Araya Soto")}</div>
            {field("RUT", "rut", "text", "12.345.678-9")}
            {field("Fecha de nacimiento", "birthDate", "date")}
            <div className="col-span-2">{field("Email", "email", "email", "paciente@email.com")}</div>
            {field("Teléfono", "phone", "tel", "+56 9 XXXX XXXX")}
            {field("Ciudad", "city", "text", "Santiago")}

            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Psicólogo/a asignado/a</label>
              <select
                value={form.professionalId}
                onChange={e => setForm(f => ({ ...f, professionalId: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-dark outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              >
                <option value="">Seleccionar profesional...</option>
                {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div className="col-span-2">{field("Diagnóstico inicial", "diagnosis", "text", "Ej: Trastorno de ansiedad generalizada")}</div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Estado inicial</label>
              <div className="flex items-center gap-2">
                {(["pending", "active"] as PatientStatus[]).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, status: s }))}
                    className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-colors ${
                      form.status === s
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-slate-200 text-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : (pacienteInicial ? <Edit2 size={13}/> : <Plus size={13} />)}
            {saving ? "Guardando..." : (pacienteInicial ? "Guardar cambios" : "Crear paciente")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPatientsPage() {
  const [filters, setFilters] = useState<PatientFilters>({
    search: "", status: "", professionalId: "",
    sort: "name", dir: "asc", page: 1,
  });
  const [selected,      setSelected]      = useState<Patient | null>(null);
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [showFilters,   setShowFilters]   = useState(false);

  // Estados nuevos para modales
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [viewingHistory, setViewingHistory] = useState<Patient | null>(null);

  const { items, total, professionals, loading, error, refetch } = usePatients(filters);
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  const setFilter = <K extends keyof PatientFilters>(key: K, value: PatientFilters[K]) =>
    setFilters(f => ({ ...f, [key]: value, page: 1 }));

  const toggleSort = (field: PatientFilters["sort"]) =>
    setFilters(f => ({
      ...f, sort: field,
      dir: f.sort === field && f.dir === "asc" ? "desc" : "asc",
    }));

  const handleDelete = async (patient: Patient) => {
    if (!confirm(`¿Eliminar a ${patient.fullName}? Esta acción no se puede deshacer.`)) return;
    refetch();
  };

  const exportarCSV = () => {
    const headers = ["Paciente", "RUT", "Email", "Profesional", "Diagnóstico", "Estado"];
    const rows = items.map(i => [i.fullName, i.rut, i.email, i.assignedProfessional, i.diagnosis, i.status]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "pacientes_medtrack.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Summary counts
  const counts = {
    active:     MOCK_PATIENTS.filter(p => p.status === "active").length,
    discharged: MOCK_PATIENTS.filter(p => p.status === "discharged").length,
    pending:    MOCK_PATIENTS.filter(p => p.status === "pending").length,
    on_hold:    MOCK_PATIENTS.filter(p => p.status === "on_hold").length,
  };

  const activeFiltersCount = [filters.status, filters.professionalId].filter(Boolean).length;

  return (
    <div className="flex min-h-screen bg-background">

      <SidebarAdmin />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="sticky top-0 z-10 bg-white border-b border-slate-100 px-7 h-14 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-medium text-dark">Pacientes Globales</h1>
            <p className="text-xs text-slate-500">{total} de {MOCK_PATIENTS.length} pacientes registrados</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refetch}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors"
              title="Actualizar"
            >
              <RefreshCw size={13} />
            </button>
            <button 
              onClick={exportarCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Download size={13} /> Exportar CSV
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-colors"
            >
              <Plus size={13} /> Nuevo Paciente
            </button>
          </div>
        </header>

        <div className="p-7">
          <div className="grid grid-cols-4 gap-3.5 mb-6">
            {(Object.entries(STATUS_CONFIG) as [PatientStatus, typeof STATUS_CONFIG[PatientStatus]][]).map(([key, cfg]) => (
              <div
                key={key}
                className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3 cursor-pointer hover:shadow-sm transition-shadow"
                style={{ borderLeft: `3px solid ${key === "active" ? "#A3BFA8" : key === "discharged" ? "#60a5fa" : key === "pending" ? "#facc15" : "#94a3b8"}` }}
                onClick={() => setFilter("status", filters.status === key ? "" : key)}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}
                >
                  <span className={cfg.text}>{cfg.icon}</span>
                </div>
                <div>
                  <p className="text-xl font-semibold text-dark tracking-tight">{counts[key]}</p>
                  <p className="text-xs text-slate-500">{cfg.label}</p>
                </div>
                {filters.status === key && (
                  <span className="ml-auto w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">✓</span>
                )}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-white flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-2 bg-background border border-slate-200 rounded-lg px-3 py-1.5 flex-1 min-w-48 max-w-sm">
                <Search size={13} className="text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar nombre, RUT, email, ciudad..."
                  value={filters.search}
                  onChange={e => setFilter("search", e.target.value)}
                  className="border-none outline-none text-xs text-dark bg-transparent w-full placeholder:text-slate-400"
                />
                {filters.search && (
                  <button onClick={() => setFilter("search", "")} className="text-slate-300 hover:text-slate-500">
                    <X size={12} />
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowFilters(f => !f)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                  showFilters || activeFiltersCount > 0
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Filter size={12} /> Filtros
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] font-medium flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {filters.status && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                  {STATUS_CONFIG[filters.status as PatientStatus]?.label}
                  <button onClick={() => setFilter("status", "")} className="hover:text-red-500"><X size={10} /></button>
                </span>
              )}
              {filters.professionalId && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                  {professionals.find(p => p.id === filters.professionalId)?.name}
                  <button onClick={() => setFilter("professionalId", "")} className="hover:text-red-500"><X size={10} /></button>
                </span>
              )}
            </div>

            {showFilters && (
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-3 flex-wrap">
                <select
                  value={filters.status}
                  onChange={e => setFilter("status", e.target.value as PatientStatus | "")}
                  className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-dark outline-none focus:border-primary"
                >
                  <option value="">Todos los estados</option>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>

                <select
                  value={String(filters.professionalId)}
                  onChange={e => setFilter("professionalId", e.target.value ? Number(e.target.value) : "")}
                  className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-dark outline-none focus:border-primary"
                >
                  <option value="">Todos los profesionales</option>
                  {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>

                <button
                  onClick={() => setFilters(f => ({ ...f, status: "", professionalId: "", page: 1 }))}
                  className="text-xs text-red-500 hover:underline"
                >
                  Limpiar filtros
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <SortHeader label="Paciente"      field="name"            current={filters.sort} dir={filters.dir} onSort={toggleSort} />
                    <SortHeader label="RUT"           field={null}            current={filters.sort} dir={filters.dir} onSort={toggleSort} />
                    <SortHeader label="Profesional"       field={null}            current={filters.sort} dir={filters.dir} onSort={toggleSort} />
                    <SortHeader label="Diagnóstico"       field={null}            current={filters.sort} dir={filters.dir} onSort={toggleSort} />
                    <SortHeader label="Estado"            field={null}            current={filters.sort} dir={filters.dir} onSort={toggleSort} />
                    <SortHeader label="Últ. Cita"         field="lastAppointment" current={filters.sort} dir={filters.dir} onSort={toggleSort} />
                    <SortHeader label="Sesiones"          field="sessions"        current={filters.sort} dir={filters.dir} onSort={toggleSort} />
                    <SortHeader label="Registro"          field="registered"      current={filters.sort} dir={filters.dir} onSort={toggleSort} />
                    <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-5 py-3 border-b border-slate-100">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={9} className="px-5 py-12 text-center">
                        <Loader2 size={20} className="animate-spin text-primary mx-auto mb-2" />
                        <p className="text-xs text-slate-400">Cargando pacientes...</p>
                      </td>
                    </tr>
                  )}
                  {error && (
                    <tr>
                      <td colSpan={9} className="px-5 py-10 text-center">
                        <AlertTriangle size={18} className="text-yellow-500 mx-auto mb-2" />
                        <p className="text-xs text-slate-500">{error}</p>
                        <button onClick={refetch} className="mt-2 text-xs text-primary hover:underline">Reintentar</button>
                      </td>
                    </tr>
                  )}
                  {!loading && !error && items.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-5 py-12 text-center">
                        <Search size={18} className="text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">No se encontraron pacientes con los filtros aplicados.</p>
                      </td>
                    </tr>
                  )}
                  {!loading && !error && items.map(patient => (
                    <tr
                      key={patient.id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0"
                      onClick={() => setSelected(patient)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 text-dark ${patient.avatarColor}`}
                          >
                            {patient.avatarInitials}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-dark">{patient.fullName}</p>
                            <p className="text-xs text-slate-500">{patient.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-mono text-slate-400">{patient.rut}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-600 max-w-[140px] truncate">{patient.assignedProfessional}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-600 max-w-[160px] truncate">{patient.diagnosis}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={patient.status} /></td>
                      <td className="px-5 py-3.5 text-xs text-slate-400">{formatDate(patient.lastAppointment)}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-medium text-primary">{patient.totalSessions}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">
                        {new Date(patient.registeredAt).toLocaleDateString("es-CL", { year: "numeric", month: "short" })}
                      </td>
                      <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button
                            title="Ver ficha"
                            onClick={() => setSelected(patient)}
                            className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-400 hover:border-primary hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            <Eye size={12} />
                          </button>
                          <button
                            title="Editar"
                            onClick={() => setEditingPatient(patient)}
                            className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-400 hover:border-primary hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            title="Eliminar"
                            onClick={() => handleDelete(patient)}
                            className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-white flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Mostrando {((filters.page - 1) * PAGE_SIZE) + 1}–{Math.min(filters.page * PAGE_SIZE, total)} de {total} resultados
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={filters.page === 1}
                  onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                  className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronDown size={12} className="rotate-90" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setFilters(f => ({ ...f, page: p }))}
                    className={`w-7 h-7 rounded-md text-xs font-medium transition-colors ${
                      filters.page === p
                        ? "bg-primary text-white"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={filters.page === totalPages || totalPages === 0}
                  onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                  className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronDown size={12} className="-rotate-90" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {selected && (
        <PatientDrawer
          patient={selected}
          onClose={() => setSelected(null)}
          onDelete={handleDelete}
          onEdit={(p) => { setSelected(null); setEditingPatient(p); }}
          onHistory={(p) => { setSelected(null); setViewingHistory(p); }}
        />
      )}

      {/* Modal Añadir / Editar */}
      {(showAddModal || editingPatient) && (
        <AddPatientModal
          professionals={professionals}
          onClose={() => { setShowAddModal(false); setEditingPatient(null); }}
          pacienteInicial={editingPatient}
        />
      )}

      {/* Modal Ver Historial Citas */}
      {viewingHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-dark">Historial: {viewingHistory.fullName}</h2>
              <button onClick={() => setViewingHistory(null)} className="text-slate-400 hover:text-slate-600"><X size={15} /></button>
            </div>
            <div className="p-6 bg-slate-50 max-h-80 overflow-y-auto">
              {[
                { fecha: "15 Abr 2026", tipo: "Terapia Individual", status: "Completada" },
                { fecha: "01 Abr 2026", tipo: "Terapia Individual", status: "Completada" },
                { fecha: "15 Mar 2026", tipo: "Evaluación Inicial", status: "Completada" },
              ].map((cita, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 mb-3 flex justify-between items-center shadow-sm">
                  <div>
                    <p className="text-sm font-semibold text-dark">{cita.fecha}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{cita.tipo}</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] rounded-lg font-medium">{cita.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}