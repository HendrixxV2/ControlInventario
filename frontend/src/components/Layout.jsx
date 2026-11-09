import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  ['/', 'Dashboard'],
  ['/materials', 'Materiales'],
  ['/movements', 'Movimientos'],
  ['/locations', 'Ubicaciones'],
  ['/suppliers', 'Proveedores'],
  ['/purchase-orders', 'Órdenes de compra'],
  ['/alerts', 'Alertas'],
  ['/duplicates', 'Duplicados'],
  ['/traceability', 'Trazabilidad']
];

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Inventario</h2>
        <nav>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="user">
          <small>{user?.name} ({user?.role})</small>
          <button onClick={() => { logout(); nav('/login'); }}>Salir</button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}