// src/pages/admin/AdminStaffPage.tsx
import { useState, useEffect, useCallback } from "react";
import SidebarAdmin from "../../components/layout/SidebarAdmin";
import {
  Search, Plus, Filter, Edit2, ArrowLeftRight, Ban,
  CheckCircle, XCircle, ChevronDown, ChevronUp, X,
  Mail, Phone, Award, Calendar, Loader2, AlertTriangle,
  Download, RefreshCw, UserCheck, UserX, Clock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StaffStatus = "active" | "inactive" | "vacation";
export type StaffRole   = "psychologist" | "secretary" | "admin";

export interface StaffMember {
  id: number;
  name: string;
  email: string;
  phone?: string;
  specialty: string;
  licenseNumber: string;
  status: StaffStatus;
  role: StaffRole;
  joinedAt: string;          // ISO date string
  appointmentsThisMonth: number;
  avatarInitials: string;
  avatarColor: string;       // Tailwind class for background
}

interface StaffFilters {
  search:    string;
  status:    StaffStatus | "";
  role:      StaffRole | "";
  specialty: string;
  sort:      "name" | "joined" | "appointments";
  dir:       "asc" | "desc";
  page:      number;
}

interface PaginatedStaff {
  items: StaffMember[];
  total: number;
  specialties: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 8;

const STATUS_CONFIG: Record<StaffStatus, {
  label: string;
  bg: string;
  text: string;
  icon: React.ReactNode;
}> = {
  active:   { label: "Activo",     bg: "bg-green-100",  text: "text-green-700",  icon: <CheckCircle size={11} /> },
  inactive: { label: "Inactivo",   bg: "bg-red-100",    text: "text-red-700",    icon: <XCircle size={11} />    },
  vacation: { label: "Vacaciones", bg: "bg-yellow-100", text: "text-yellow-700", icon: <Clock size={11} />      },
};

const ROLE_LABELS: Record<StaffRole, string> = {
  psychologist: "Psicólogo/a",
  secretary:    "Secretaria",
  admin:        "Administrador/a",
};

// ─── Mock data (replace fetch in production) ─────────────────────────────────

const MOCK_STAFF: StaffMember[] = [
  { id: 1,  name: "Dra. María Rojas",      email: "m.rojas@medtrack.cl",    phone: "+56 9 1234 5678", specialty: "Psicología Clínica",   licenseNumber: "#PS-4421", status: "active",   role: "psychologist", joinedAt: "2021-03-15", appointmentsThisMonth: 24, avatarInitials: "MR", avatarColor: "bg-blue-100" },
  { id: 2,  name: "Dr. Carlos Gómez",      email: "c.gomez@medtrack.cl",    phone: "+56 9 2345 6789", specialty: "Neuropsicología",      licenseNumber: "#PS-3890", status: "active",   role: "psychologist", joinedAt: "2020-07-01", appointmentsThisMonth: 18, avatarInitials: "CG", avatarColor: "bg-green-100" },
  { id: 3,  name: "Dra. Ana Leal",         email: "a.leal@medtrack.cl",     phone: "+56 9 3456 7890", specialty: "Psicología Infantil",  licenseNumber: "#PS-5102", status: "vacation", role: "psychologist", joinedAt: "2022-01-10", appointmentsThisMonth: 0,  avatarInitials: "AL", avatarColor: "bg-yellow-100" },
  { id: 4,  name: "Dr. Jorge Pinto",       email: "j.pinto@medtrack.cl",    phone: "+56 9 4567 8901", specialty: "Psicoterapia",         licenseNumber: "#PS-2277", status: "inactive", role: "psychologist", joinedAt: "2019-11-20", appointmentsThisMonth: 0,  avatarInitials: "JP", avatarColor: "bg-red-100" },
  { id: 5,  name: "Ps. Valentina Mora",    email: "v.mora@medtrack.cl",     phone: "+56 9 5678 9012", specialty: "Psicología Clínica",   licenseNumber: "#PS-6340", status: "active",   role: "psychologist", joinedAt: "2023-02-28", appointmentsThisMonth: 31, avatarInitials: "VM", avatarColor: "bg-purple-100" },
  { id: 6,  name: "Dr. Sebastián Ríos",   email: "s.rios@medtrack.cl",     phone: "+56 9 6789 0123", specialty: "Psicoanálisis",        licenseNumber: "#PS-1998", status: "active",   role: "psychologist", joinedAt: "2018-06-05", appointmentsThisMonth: 21, avatarInitials: "SR", avatarColor: "bg-blue-100" },
  { id: 7,  name: "Camila Fuentes",        email: "c.fuentes@medtrack.cl",  phone: "+56 9 7890 1234", specialty: "Recepción",            licenseNumber: "—",        status: "active",   role: "secretary",    joinedAt: "2022-09-01", appointmentsThisMonth: 0,  avatarInitials: "CF", avatarColor: "bg-gray-200" },
  { id: 8,  name: "Sofía Vargas",          email: "s.vargas@medtrack.cl",   phone: "+56 9 8901 2345", specialty: "Recepción",            licenseNumber: "—",        status: "active",   role: "secretary",    joinedAt: "2023-05-15", appointmentsThisMonth: 0,  avatarInitials: "SV", avatarColor: "bg-green-100" },
  { id: 9,  name: "Dra. Patricia Núñez",  email: "p.nunez@medtrack.cl",    phone: "+56 9 9012 3456", specialty: "Psicología Forense",   licenseNumber: "#PS-7821", status: "active",   role: "psychologist", joinedAt: "2021-08-22", appointmentsThisMonth: 14, avatarInitials: "PN", avatarColor: "bg-yellow-100" },
  { id: 10, name: "Dr. Matías Herrera",    email: "m.herrera@medtrack.cl",  phone: "+56 9 0123 4567", specialty: "Terapia Cognitiva",    licenseNumber: "#PS-4455", status: "active",   role: "psychologist", joinedAt: "2020-03-10", appointmentsThisMonth: 27, avatarInitials: "MH", avatarColor: "bg-blue-100" },
  { id: 11, name: "Dra. Isidora Campos",   email: "i.campos@medtrack.cl",   phone: "+56 9 1111 2222", specialty: "Neuropsicología",      licenseNumber: "#PS-8833", status: "inactive", role: "psychologist", joinedAt: "2019-04-18", appointmentsThisMonth: 0,  avatarInitials: "IC", avatarColor: "bg-red-100" },
  { id: 12, name: "Rodrigo Espinoza",      email: "r.espinoza@medtrack.cl", phone: "+56 9 2222 3333", specialty: "Administración",       licenseNumber: "—",        status: "active",   role: "admin",        joinedAt: "2017-01-03", appointmentsThisMonth: 0,  avatarInitials: "RE", avatarColor: "bg-gray-200" },
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useStaff(filters: StaffFilters) {
  const [data, setData]       = useState<PaginatedStaff>({ items: [], total: 0, specialties: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetch_ = useCallback(() => {
    setLoading(true);
    setError(null);

    setTimeout(() => {
      try {
        let result = [...MOCK_STAFF];

        if (filters.search) {
          const q = filters.search.toLowerCase();
          result = result.filter(m =>
            m.name.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q) ||
            m.licenseNumber.toLowerCase().includes(q)
          );
        }
        if (filters.status)    result = result.filter(m => m.status    === filters.status);
        if (filters.role)      result = result.filter(m => m.role      === filters.role);
        if (filters.specialty) result = result.filter(m => m.specialty === filters.specialty);

        result.sort((a, b) => {
          let v = 0;
          if (filters.sort === "name")         v = a.name.localeCompare(b.name);
          if (filters.sort === "joined")       v = a.joinedAt.localeCompare(b.joinedAt);
          if (filters.sort === "appointments") v = a.appointmentsThisMonth - b.appointmentsThisMonth;
          return filters.dir === "asc" ? v : -v;
        });

        const specialties = [...new Set(MOCK_STAFF.map(m => m.specialty))].sort();
        const total        = result.length;
        const items        = result.slice((filters.page - 1) * PAGE_SIZE, filters.page * PAGE_SIZE);
        setData({ items, total, specialties });
      } catch {
        setError("No se pudo cargar el personal.");
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [filters]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { ...data, loading, error, refetch: fetch_ };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: StaffStatus }) {
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
  field: StaffFilters["sort"] | null;
  current: StaffFilters["sort"];
  dir: StaffFilters["dir"];
  onSort: (f: StaffFilters["sort"]) => void;
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

// ─── Detail Drawer ────────────────────────────────────────────────────────────

function StaffDrawer({
  member,
  onClose,
  onDeactivate,
  onChangeRole,
  onEdit
}: {
  member: StaffMember;
  onClose: () => void;
  onDeactivate: (m: StaffMember) => void;
  onChangeRole: (m: StaffMember) => void;
  onEdit: (m: StaffMember) => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/20" onClick={onClose} />

      {/* Panel */}
      <aside className="w-96 bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-dark">Detalle del profesional</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-slate-100 text-slate-400">
            <X size={15} />
          </button>
        </div>

        {/* Avatar + name */}
        <div className="px-6 py-6 flex items-center gap-4 border-b border-slate-100">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-semibold flex-shrink-0 text-dark ${member.avatarColor}`}
          >
            {member.avatarInitials}
          </div>
          <div>
            <p className="text-base font-semibold text-dark">{member.name}</p>
            <p className="text-sm text-slate-500 mt-0.5">{ROLE_LABELS[member.role]}</p>
            <div className="mt-2"><StatusBadge status={member.status} /></div>
          </div>
        </div>

        {/* Info grid */}
        <div className="px-6 py-5 grid gap-4">
          {[
            { icon: <Mail size={14} />,     label: "Email",        value: member.email },
            { icon: <Phone size={14} />,    label: "Teléfono",     value: member.phone ?? "—" },
            { icon: <Award size={14} />,    label: "Especialidad", value: member.specialty },
            { icon: <Award size={14} />,    label: "N° Licencia",  value: member.licenseNumber },
            { icon: <Calendar size={14} />, label: "Ingreso",      value: new Date(member.joinedAt).toLocaleDateString("es-CL", { year: "numeric", month: "long", day: "numeric" }) },
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

        {/* Stats strip */}
        {member.role === "psychologist" && (
          <div className="mx-6 mb-5 bg-background rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/30 flex items-center justify-center">
              <Calendar size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wide">Citas este mes</p>
              <p className="text-xl font-semibold text-dark">{member.appointmentsThisMonth}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-6 pb-6 mt-auto flex flex-col gap-2">
          <button 
            onClick={() => onEdit(member)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            <Edit2 size={14} /> Editar perfil
          </button>
          <button
            onClick={() => onChangeRole(member)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <ArrowLeftRight size={14} /> Cambiar rol
          </button>
          <button
            onClick={() => { onDeactivate(member); onClose(); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
          >
            <Ban size={14} />
            {member.status === "inactive" ? "Reactivar cuenta" : "Desactivar cuenta"}
          </button>
        </div>
      </aside>
    </div>
  );
}

// ─── Add/Edit Staff Modal ──────────────────────────────────────────────────────────

function AddStaffModal({ onClose, miembroInicial }: { onClose: () => void, miembroInicial?: StaffMember | null }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: miembroInicial?.name || "", 
    email: miembroInicial?.email || "", 
    phone: miembroInicial?.phone || "", 
    specialty: miembroInicial?.specialty || "",
    licenseNumber: miembroInicial?.licenseNumber || "", 
    role: miembroInicial?.role || "psychologist" as StaffRole,
  });

  const handleSubmit = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
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
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-dark">
            {miembroInicial ? "Editar profesional" : "Añadir nuevo profesional"}
          </h2>
          <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-slate-100 text-slate-400">
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-5 grid gap-4">
          {field("Nombre completo", "name", "text", "Ej: Dra. María González")}
          {field("Email institucional", "email", "email", "nombre@medtrack.cl")}
          {field("Teléfono", "phone", "tel", "+56 9 XXXX XXXX")}

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Rol</label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value as StaffRole }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-dark outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            >
              <option value="psychologist">Psicólogo/a</option>
              <option value="secretary">Secretaria</option>
              <option value="admin">Administrador/a</option>
            </select>
          </div>

          {form.role === "psychologist" && (
            <>
              {field("Especialidad", "specialty", "text", "Ej: Psicología Clínica")}
              {field("N° de Licencia", "licenseNumber", "text", "#PS-XXXX")}
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : (miembroInicial ? <Edit2 size={13} /> : <Plus size={13} />)}
            {saving ? "Guardando..." : (miembroInicial ? "Guardar cambios" : "Crear profesional")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminStaffPage() {
  const [filters, setFilters] = useState<StaffFilters>({
    search: "", status: "", role: "", specialty: "",
    sort: "name", dir: "asc", page: 1,
  });
  
  const [selected,    setSelected]    = useState<StaffMember | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters,  setShowFilters]  = useState(false);

  // Estados nuevos para modales dinámicos
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [changingRoleStaff, setChangingRoleStaff] = useState<StaffMember | null>(null);

  const { items, total, specialties, loading, error, refetch } = useStaff(filters);
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  const setFilter = <K extends keyof StaffFilters>(key: K, value: StaffFilters[K]) =>
    setFilters(f => ({ ...f, [key]: value, page: 1 }));

  const toggleSort = (field: StaffFilters["sort"]) =>
    setFilters(f => ({
      ...f,
      sort: field,
      dir:  f.sort === field && f.dir === "asc" ? "desc" : "asc",
    }));

  const handleDeactivate = async (member: StaffMember) => {
    if (!confirm(`¿${member.status === "inactive" ? "Reactivar" : "Desactivar"} a ${member.name}?`)) return;
    refetch();
  };

  const exportarCSV = () => {
    const headers = ["Nombre", "Email", "Especialidad", "Rol", "Estado"];
    const rows = items.map(i => [i.name, i.email, i.specialty, i.role, i.status]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "personal_medtrack.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeFiltersCount = [filters.status, filters.role, filters.specialty].filter(Boolean).length;

  // ── Summary counts ──
  const activeCount   = MOCK_STAFF.filter(m => m.status === "active").length;
  const inactiveCount = MOCK_STAFF.filter(m => m.status === "inactive").length;
  const vacationCount = MOCK_STAFF.filter(m => m.status === "vacation").length;

  return (
    <div className="flex min-h-screen bg-background">
      
      {/* ── Sidebar Nuevo Centralizado ── */}
      <SidebarAdmin />

      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Topbar */}
        <header className="sticky top-0 z-10 bg-white border-b border-slate-100 px-7 h-14 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-medium text-dark">Gestión de Personal</h1>
            <p className="text-xs text-slate-500">{total} profesionales en el sistema</p>
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
              <Download size={13} /> Exportar
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-colors"
            >
              <Plus size={13} /> Añadir Personal
            </button>
          </div>
        </header>

        <div className="p-7">
          {/* Summary strips */}
          <div className="grid grid-cols-3 gap-3.5 mb-6">
            {[
              { label: "Activos",    count: activeCount,   icon: <UserCheck size={16} />, accent: "border-primary", bg: "bg-green-100",  textColor: "text-primary" },
              { label: "Inactivos",  count: inactiveCount, icon: <UserX size={16} />,     accent: "border-red-400", bg: "bg-red-100",    textColor: "text-red-600" },
              { label: "Vacaciones", count: vacationCount, icon: <Clock size={16} />,     accent: "border-yellow-400", bg: "bg-yellow-100", textColor: "text-yellow-600" },
            ].map(s => (
              <div
                key={s.label}
                className={`bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3 cursor-pointer hover:shadow-sm transition-shadow border-l-4 ${s.accent}`}
                onClick={() => setFilter("status", s.label === "Activos" ? "active" : s.label === "Inactivos" ? "inactive" : "vacation")}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${s.bg} ${s.textColor}`}>
                  {s.icon}
                </div>
                <div>
                  <p className={`text-2xl font-semibold tracking-tight ${s.textColor}`}>{s.count}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Table card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="px-5 py-3 border-b border-slate-100 bg-white flex items-center gap-2.5 flex-wrap">
              {/* Search */}
              <div className="flex items-center gap-2 bg-background border border-slate-200 rounded-lg px-3 py-1.5 flex-1 min-w-48 max-w-sm">
                <Search size={13} className="text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar nombre, email, licencia..."
                  value={filters.search}
                  onChange={e => setFilter("search", e.target.value)}
                  className="border-none outline-none text-xs text-dark bg-transparent w-full placeholder:text-slate-400"
                />
                {filters.search && (
                  <button onClick={() => setFilter("search", "")} className="text-slate-400 hover:text-slate-600">
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters(f => !f)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                  showFilters || activeFiltersCount > 0
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Filter size={12} />
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] font-medium flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Active filter chips */}
              {filters.status && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                  {STATUS_CONFIG[filters.status as StaffStatus]?.label}
                  <button onClick={() => setFilter("status", "")} className="hover:text-red-500"><X size={10} /></button>
                </span>
              )}
              {filters.role && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                  {ROLE_LABELS[filters.role as StaffRole]}
                  <button onClick={() => setFilter("role", "")} className="hover:text-red-500"><X size={10} /></button>
                </span>
              )}
            </div>

            {/* Expanded filters */}
            {showFilters && (
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-3 flex-wrap">
                <select
                  value={filters.status}
                  onChange={e => setFilter("status", e.target.value as StaffStatus | "")}
                  className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-dark outline-none focus:border-primary"
                >
                  <option value="">Todos los estados</option>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="vacation">Vacaciones</option>
                </select>

                <select
                  value={filters.role}
                  onChange={e => setFilter("role", e.target.value as StaffRole | "")}
                  className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-dark outline-none focus:border-primary"
                >
                  <option value="">Todos los roles</option>
                  <option value="psychologist">Psicólogo/a</option>
                  <option value="secretary">Secretaria</option>
                  <option value="admin">Administrador/a</option>
                </select>

                <select
                  value={filters.specialty}
                  onChange={e => setFilter("specialty", e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-dark outline-none focus:border-primary"
                >
                  <option value="">Todas las especialidades</option>
                  {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <button
                  onClick={() => setFilters(f => ({ ...f, status: "", role: "", specialty: "", page: 1 }))}
                  className="text-xs text-red-500 hover:underline"
                >
                  Limpiar filtros
                </button>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <SortHeader label="Profesional"   field="name"         current={filters.sort} dir={filters.dir} onSort={toggleSort} />
                    <SortHeader label="Especialidad"  field={null}         current={filters.sort} dir={filters.dir} onSort={toggleSort} />
                    <SortHeader label="N° Licencia"   field={null}         current={filters.sort} dir={filters.dir} onSort={toggleSort} />
                    <SortHeader label="Rol"           field={null}         current={filters.sort} dir={filters.dir} onSort={toggleSort} />
                    <SortHeader label="Estado"        field={null}         current={filters.sort} dir={filters.dir} onSort={toggleSort} />
                    <SortHeader label="Citas / Mes"   field="appointments" current={filters.sort} dir={filters.dir} onSort={toggleSort} />
                    <SortHeader label="Ingreso"       field="joined"       current={filters.sort} dir={filters.dir} onSort={toggleSort} />
                    <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-5 py-3 border-b border-slate-100">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center">
                        <Loader2 size={20} className="animate-spin text-primary mx-auto mb-2" />
                        <p className="text-xs text-slate-400">Cargando personal...</p>
                      </td>
                    </tr>
                  )}
                  {error && (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center">
                        <AlertTriangle size={18} className="text-yellow-500 mx-auto mb-2" />
                        <p className="text-xs text-slate-500">{error}</p>
                        <button onClick={refetch} className="mt-2 text-xs text-primary hover:underline">Reintentar</button>
                      </td>
                    </tr>
                  )}
                  {!loading && !error && items.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center">
                        <Search size={18} className="text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">No se encontraron resultados para los filtros aplicados.</p>
                      </td>
                    </tr>
                  )}
                  {!loading && !error && items.map(member => (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0"
                      onClick={() => setSelected(member)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 text-dark ${member.avatarColor}`}
                          >
                            {member.avatarInitials}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-dark">{member.name}</p>
                            <p className="text-xs text-slate-500">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{member.specialty}</td>
                      <td className="px-5 py-3.5 text-xs font-mono text-slate-400">{member.licenseNumber}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-slate-500">{ROLE_LABELS[member.role]}</span>
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={member.status} /></td>
                      <td className="px-5 py-3.5">
                        {member.role === "psychologist"
                          ? <span className="text-sm font-medium text-primary">{member.appointmentsThisMonth}</span>
                          : <span className="text-xs text-slate-300">—</span>
                        }
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">
                        {new Date(member.joinedAt).toLocaleDateString("es-CL", { year: "numeric", month: "short" })}
                      </td>
                      <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button
                            title="Editar"
                            onClick={() => setEditingStaff(member)}
                            className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-400 hover:border-primary hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            title="Cambiar rol"
                            onClick={() => setChangingRoleStaff(member)}
                            className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-400 hover:border-primary hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            <ArrowLeftRight size={12} />
                          </button>
                          <button
                            title={member.status === "inactive" ? "Reactivar" : "Desactivar"}
                            onClick={() => handleDeactivate(member)}
                            className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Ban size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-5 py-3 border-t border-slate-100 bg-white flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Mostrando {((filters.page - 1) * PAGE_SIZE) + 1}–{Math.min(filters.page * PAGE_SIZE, total)} de {total} resultados
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={filters.page === 1}
                  onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                  className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
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
                  className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronDown size={12} className="-rotate-90" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Detail drawer */}
      {selected && (
        <StaffDrawer
          member={selected}
          onClose={() => setSelected(null)}
          onDeactivate={handleDeactivate}
          onEdit={(m) => { setSelected(null); setEditingStaff(m); }}
          onChangeRole={(m) => { setSelected(null); setChangingRoleStaff(m); }}
        />
      )}

      {/* Modal Añadir / Editar */}
      {(showAddModal || editingStaff) && (
        <AddStaffModal 
          onClose={() => { setShowAddModal(false); setEditingStaff(null); }} 
          miembroInicial={editingStaff}
        />
      )}

      {/* Modal Cambiar Rol */}
      {changingRoleStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden p-6">
            <h2 className="text-lg font-bold text-dark mb-2">Cambiar Rol</h2>
            <p className="text-sm text-slate-500 mb-4">Selecciona el nuevo rol para {changingRoleStaff.name}</p>
            <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-dark outline-none focus:border-primary mb-6">
              <option value="psychologist">Psicólogo/a</option>
              <option value="secretary">Secretaria</option>
              <option value="admin">Administrador/a</option>
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setChangingRoleStaff(null)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">Cancelar</button>
              <button onClick={() => { alert("Rol actualizado"); setChangingRoleStaff(null); }} className="px-4 py-2 text-sm bg-primary text-white hover:bg-primary-hover rounded-lg">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}