import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Analytics', icon: DashboardIcon, end: true },
  { to: '/products', label: 'Products', icon: ProductsIcon },
  { to: '/categories', label: 'Categories', icon: CategoriesIcon },
  { to: '/companies', label: 'Companies', icon: CompaniesIcon },
  { to: '/types-materials', label: 'Types & Materials', icon: TypesIcon },
  { to: '/orders', label: 'Orders', icon: OrdersIcon },
  { to: '/reviews', label: 'Reviews', icon: ReviewsIcon },
  { to: '/blogs', label: 'Blog', icon: BlogIcon },
];

export default function Sidebar() {
  const { user, signOut } = useAuth();

  return (
    <aside className="w-60 shrink-0 bg-surface border-r border-border flex flex-col">
      <div className="px-5 pt-7 pb-6">
        <span className="font-display font-bold text-lg tracking-tight text-white">
          Devansh <span className="text-amber">Admin</span>
        </span>
      </div>

      <nav className="flex-1 px-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 mb-1 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-amber/10 text-amber font-medium border-l-2 border-amber -ml-[2px] pl-[14px]'
                  : 'text-muted hover:text-white hover:bg-surface-alt'
              }`
            }
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <p className="px-2 text-xs text-muted truncate mb-2">{user?.email}</p>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted hover:text-white hover:bg-surface-alt transition-colors"
        >
          <LogoutIcon />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

/* Inline icons — keeps this scaffold dependency-free for icons. Swap for
   lucide-react or similar once the project is wired up, if preferred. */
function iconProps() {
  return { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8 };
}
function DashboardIcon() { return <svg {...iconProps()}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>; }
function ProductsIcon() { return <svg {...iconProps()}><path d="M21 8 12 3 3 8l9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>; }
function CategoriesIcon() { return <svg {...iconProps()}><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>; }
function CompaniesIcon() { return <svg {...iconProps()}><rect x="3" y="7" width="18" height="14" rx="1.5"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>; }
function TypesIcon() { return <svg {...iconProps()}><path d="m12 2 8 4.5v9L12 20l-8-4.5v-9L12 2Z"/><path d="M12 11v9M4 6.5 12 11l8-4.5"/></svg>; }
function OrdersIcon() { return <svg {...iconProps()}><path d="M6 3h12l1 4H5l1-4Z"/><path d="M5 7h14l-1.2 12.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 7Z"/></svg>; }
function LogoutIcon() { return <svg {...iconProps()}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>; }
function ReviewsIcon() { return <svg {...iconProps()}><path d="m12 2 2.8 6.6L21 9l-5 4.5L17.5 21 12 17.3 6.5 21 8 13.5 3 9l6.2-.4L12 2Z"/></svg>; }
function BlogIcon() { return <svg {...iconProps()}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></svg>; }