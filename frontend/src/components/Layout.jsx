import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  ['/', 'Resumen', '▦'],
  ['/materials', 'Materiales', '▤'],
  ['/movements', 'Movimientos', '↔'],
  ['/locations', 'Ubicaciones', '⌖'],
  ['/suppliers', 'Proveedores', '♧'],
  ['/purchase-orders', 'Órdenes de compra', '▧'],
  ['/alerts', 'Alertas', '◉'],
  ['/duplicates', 'Duplicados', '⧉'],
  ['/traceability', 'Trazabilidad', '⌘']
];

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const activePage = links.find(([to]) => to === pathname)
    || links.find(([to]) => to !== '/' && pathname.startsWith(to));
  const name = user?.name || 'Usuario';
  const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('');

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">N</span>
          <span>
            <span className="brand-name">NODO</span>
            <span className="brand-caption">Control de inventario</span>
          </span>
        </div>
        <p className="nav-caption">Workspace</p>
        <nav>
          {links.map(([to, label, icon]) => (
            <NavLink key={to} to={to} end={to === '/'}>
              <span className="nav-icon" aria-hidden="true">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-note">
            <strong>Inventario bajo control</strong>
            <span>Consulta existencias, movimientos y alertas desde un solo lugar.</span>
          </div>
          <div className="user">
            <span className="user-avatar">{initials}</span>
            <span>
              <span className="user-name">{name}</span>
              <span className="user-role">{user?.role || 'Usuario'}</span>
            </span>
            <button className="logout-button" onClick={() => { logout(); nav('/login'); }}>
              Salir
            </button>
          </div>
        </div>
      </aside>
      <main className="content">
        <header className="topbar">
          <div className="breadcrumb">
            Operaciones <span aria-hidden="true">/</span>{' '}
            <strong>{activePage?.[1] || 'Detalle'}</strong>
          </div>
          <div className="topbar-meta">
            <span className="system-status">Sistema operativo</span>
            <span className="topbar-profile">
              <span className="topbar-avatar">{initials}</span>
              <span className="topbar-name">{name}</span>
              <button
                className="topbar-logout"
                onClick={() => { logout(); nav('/login'); }}
              >
                Salir
              </button>
            </span>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}