import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import { useAuthStore } from '@/store/authStore'
import { Icons } from '@/components/ui/Icons'

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'USER'

interface NavItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  roles?: Role[]
}

const NAV_PRIMARY: NavItem[] = [
  { href: '/dashboard',    icon: Icons.Grid,       label: 'Dashboard' },
  { href: '/pacientes',    icon: Icons.Users,      label: 'Pacientes' },
  { href: '/agenda',       icon: Icons.Calendar,   label: 'Agenda' },
  { href: '/planes',       icon: Icons.Table,      label: 'Planes' },
  // 'Pagos' fuera del alcance de la tesis (módulo Billing no incluido).
]

const NAV_SECONDARY: NavItem[] = [
  { href: '/configuracion', icon: Icons.Settings, label: 'Configuración' },
  { href: '/admin',         icon: Icons.Shield,   label: 'Administración', roles: ['SUPER_ADMIN', 'ADMIN'] },
]

function LogoMark() {
  return (
    <div
      className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
      style={{ background: '#1E4D6B' }}
    >
      <div className="w-3.5 h-3.5 rounded-xs" style={{ background: '#3DAA7F' }} />
    </div>
  )
}

function SidebarNavItem({ item, userRole }: { item: NavItem; userRole?: Role }) {
  if (item.roles && userRole && !item.roles.includes(userRole)) return null

  return (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-2.5 py-2 pl-4 pr-3 text-sm font-medium w-full',
          'border-l-[3px] transition-colors duration-fast',
          isActive
            ? 'border-l-primary-700 bg-primary-50 text-primary-700 font-semibold'
            : 'border-l-transparent text-text-secondary hover:bg-subtle hover:text-text-primary'
        )
      }
    >
      <item.icon className="w-4 h-4 flex-shrink-0" />
      {item.label}
    </NavLink>
  )
}

function Sidebar() {
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)
  const navigate = useNavigate()

  const fullName = user ? `${user.first_name} ${user.last_name}`.trim() : ''
  const initials = fullName
    ? fullName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : (user?.email?.[0]?.toUpperCase() ?? '?')

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside
      className="flex flex-col flex-shrink-0 bg-surface border-r border-border-base"
      style={{ width: 'var(--sidebar-width)' }}
    >
      {/* Logo */}
      <Link
        to="/dashboard"
        className="flex items-center gap-2.5 px-4 py-5 border-b border-border-subtle hover:bg-subtle transition-colors"
      >
        <LogoMark />
        <span className="font-semibold text-lg text-text-primary">Nutrilius</span>
      </Link>

      {/* Primary nav */}
      <nav className="flex-1 overflow-y-auto pt-3 pb-2">
        <div className="space-y-0.5">
          {NAV_PRIMARY.map(item => (
            <SidebarNavItem key={item.href} item={item} userRole={user?.role} />
          ))}
        </div>

        <div className="mx-4 my-3 h-px bg-border-subtle" />

        <div className="space-y-0.5">
          {NAV_SECONDARY.map(item => (
            <SidebarNavItem key={item.href} item={item} userRole={user?.role} />
          ))}
        </div>
      </nav>

      {/* User footer */}
      <div className="border-t border-border-subtle p-3">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded hover:bg-subtle transition-colors group">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold"
            style={{ background: '#E3EDF4', color: '#1E4D6B' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate leading-tight">
              {fullName || user?.email || '—'}
            </p>
            <p className="text-xs text-text-muted truncate leading-tight">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-base transition-colors opacity-0 group-hover:opacity-100"
            title="Cerrar sesión"
          >
            <Icons.LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}

export function AppShell() {
  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="max-w-[1200px] p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
