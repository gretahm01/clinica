// src/pages/admin/AdminDashboard.tsx
import { useState, useEffect } from "react";
import { Bell, Plus, Search, Edit2, ArrowLeftRight, Ban } from "lucide-react";
import SidebarAdmin from "../../components/layout/SidebarAdmin";

// ─── Types ───────────────────────────────────────────────────────────────────

type StaffStatus = "active" | "inactive" | "vacation";
type StaffRole   = "psychologist" | "secretary" | "admin";

interface StaffMember {
  id: number;
  name: string;
  email: string;
  specialty: string;
  licenseNumber: string;
  status: StaffStatus;
  role: StaffRole;
  avatarInitials: string;
}

interface AdminStats {
  activePsychologists: number;
  totalPatients: number;
  monthlyAppointments: number;
  pendingTasks: number;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats.php", {
      credentials: "include",
      headers: { "Accept": "application/json" },
    })
      .then(r => r.json())
      .then(setStats)
      .catch(() => {}) // Silenciamos errores si no hay backend aún
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}

function useStaff(filters: StaffFilters) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({
      page:      String(filters.page),
      search:    filters.search,
      status:    filters.status,
      specialty: filters.specialty,
    });

    fetch(`/api/admin/staff.php?${params}`, { credentials: "include" })
      .then(r => r.json())
      .then(data => { setStaff(data.items || []); setTotal(data.total || 0); })
      .catch(() => {}) // Silenciamos errores si no hay backend aún
      .finally(() => setLoading(false));
  }, [filters]);

  return { staff, total, loading };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface StaffFilters {
  search:    string;
  status:    string;
  specialty: string;
  page:      number;
}

const STATUS_CONFIG: Record<StaffStatus, { label: string; className: string }> = {
  active:   { label: "Activo",     className: "bg-green-100 text-green-700" },
  inactive: { label: "Inactivo",   className: "bg-red-100 text-red-700"   },
  vacation: { label: "Vacaciones", className: "bg-yellow-100 text-yellow-700" },
};

function StatusBadge({ status }: { status: StaffStatus }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.inactive;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {cfg.label}
    </span>
  );
}

function StaffRow({
  member,
  onEdit,
  onChangeRole,
  onDeactivate,
}: {
  member: StaffMember;
  onEdit:         (m: StaffMember) => void;
  onChangeRole:   (m: StaffMember) => void;
  onDeactivate:   (m: StaffMember) => void;
}) {
  return (
    <tr className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 text-dark flex items-center justify-center text-xs font-semibold flex-shrink-0">
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
      <td className="px-5 py-3.5"><StatusBadge status={member.status} /></td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1">
          <ActionButton icon={<Edit2 size={13} />} title="Editar perfil"    onClick={() => onEdit(member)} />
          <ActionButton icon={<ArrowLeftRight size={13} />} title="Cambiar rol" onClick={() => onChangeRole(member)} />
          <ActionButton icon={<Ban size={13} />}  title="Desactivar"        onClick={() => onDeactivate(member)} danger />
        </div>
      </td>
    </tr>
  );
}

function ActionButton({
  icon, title, onClick, danger = false,
}: {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`w-7 h-7 rounded-md border flex items-center justify-center transition-colors
        ${danger
          ? "border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          : "border-slate-200 text-slate-400 hover:border-primary hover:bg-primary/10 hover:text-primary"
        }`}
    >
      {icon}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [filters, setFilters] = useState<StaffFilters>({
    search: "", status: "", specialty: "", page: 1,
  });

  const { stats }        = useAdminStats();
  const { staff, total } = useStaff(filters);
  const pageSize         = 10;
  const totalPages       = Math.ceil(total / pageSize) || 1;

  const handleDeactivate = async (member: StaffMember) => {
    if (!confirm(`¿Desactivar a ${member.name}?`)) return;
    await fetch(`/api/admin/staff.php/${member.id}/deactivate`, {
      method: "PATCH",
      credentials: "include",
    });
    setFilters(f => ({ ...f }));
  };

  return (
    <div className="flex min-h-screen bg-background">
      
      <SidebarAdmin />

      {/* Estructura Flex correcta, sin ml-64 */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        <header className="sticky top-0 z-10 bg-white border-b border-slate-100 px-7 h-14 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-medium text-dark">Panel de Administración</h1>
            <p className="text-xs text-slate-500">Gestión global del sistema MedTrack</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors">
              <Bell size={13} /> Alertas
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-colors">
              <Plus size={13} /> Añadir Personal
            </button>
          </div>
        </header>

        <div className="p-7">
          <div className="grid grid-cols-4 gap-3.5 mb-6">
            {[
              { label: "Psicólogos Activos", value: stats?.activePsychologists ?? "—", sub: "+2 incorporados este mes", accent: "border-primary" },
              { label: "Total Pacientes",    value: stats?.totalPatients ?? "—",       sub: "+18 desde el mes pasado", accent: "border-blue-400" },
              { label: "Citas del Mes",      value: stats?.monthlyAppointments ?? "—", sub: "Excluye canceladas",      accent: "border-yellow-400" },
              { label: "Tareas Pendientes",  value: stats?.pendingTasks ?? "—",        sub: "3 urgentes",              accent: "border-red-400" },
            ].map((card) => (
              <div
                key={card.label}
                className={`bg-white rounded-xl border border-slate-100 p-5 relative overflow-hidden hover:shadow-sm transition-shadow border-t-4 ${card.accent}`}
              >
                <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">
                  {card.label}
                </p>
                <p className="text-3xl font-semibold text-dark tracking-tight leading-none">
                  {card.value}
                </p>
                <p className="text-xs text-slate-500 mt-2">{card.sub}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-dark">Gestión de Personal Rápida</h2>
              <span className="text-xs text-slate-500">{total} registrados</span>
            </div>

            <div className="px-5 py-3 border-b border-slate-100 bg-white flex items-center gap-2.5">
              <div className="flex items-center gap-2 bg-background border border-slate-200 rounded-lg px-3 py-1.5 flex-1 max-w-xs">
                <Search size={13} className="text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={filters.search}
                  onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
                  className="border-none outline-none text-xs text-dark bg-transparent w-full placeholder:text-slate-400"
                />
              </div>
              <select
                value={filters.status}
                onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-600 outline-none focus:border-primary"
              >
                <option value="">Todo los estados</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="vacation">Vacaciones</option>
              </select>
            </div>

            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  {["Profesional", "Especialidad", "N° Licencia", "Estado", "Acciones"].map(h => (
                    <th key={h} className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-5 py-2.5 border-b border-slate-100">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staff.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-400">
                      No hay datos disponibles para mostrar.
                    </td>
                  </tr>
                ) : (
                  staff.map(member => (
                    <StaffRow
                      key={member.id}
                      member={member}
                      onEdit={m => console.log("edit", m)}
                      onChangeRole={m => console.log("role", m)}
                      onDeactivate={handleDeactivate}
                    />
                  ))
                )}
              </tbody>
            </table>

            <div className="px-5 py-3 border-t border-slate-100 bg-white flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Mostrando {staff.length} de {total} resultados
              </span>
              <div className="flex items-center gap-1">
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
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}