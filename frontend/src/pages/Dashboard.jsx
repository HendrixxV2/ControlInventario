import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function Dashboard() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get('/dashboard/summary').then((r) => setData(r.data));
  }, []);
  if (!data) return <p>Cargando...</p>;
  const { kpis, lowStockMaterials, recentMovements } = data;
  const date = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date());

  return (
    <div className="dashboard">
      <section className="dashboard-hero">
        <div className="hero-copy">
          <p className="hero-eyebrow">Panel de operaciones · {date}</p>
          <h1>Control de inventario</h1>
          <p>Una vista clara de tus existencias y de lo que sucede en tu operación.</p>
        </div>
        <div className="hero-actions">
          <Link className="button button-light" to="/materials">Ver materiales</Link>
          <Link className="button" to="/movements">Registrar movimiento</Link>
        </div>
      </section>
      <div className="cards">
        <Card label="Materiales activos" value={kpis.totalMaterials} icon="▤" />
        <Card label="Ubicaciones" value={kpis.totalLocations} icon="⌖" />
        <Card label="Alertas abiertas" value={kpis.openAlerts} icon="◉" />
        <Card label="Materiales bajo reorden" value={kpis.lowStock} icon="↗" />
        <Card label="Órdenes de compra" value={kpis.totalPurchaseOrders} icon="▧" />
        <Card label="Movimientos hoy" value={kpis.movementsToday} icon="↔" />
      </div>

      <section>
        <div className="section-title">
          <h2>Materiales bajo punto de reorden</h2>
          <span>{lowStockMaterials.length} por revisar</span>
        </div>
        <div className="dashboard-table-card">
          <table>
            <thead>
              <tr><th>Código</th><th>Material</th><th>Stock actual</th><th>Punto de reorden</th></tr>
            </thead>
            <tbody>
              {lowStockMaterials.length ? lowStockMaterials.map((m) => (
                <tr key={m.id}>
                  <td>{m.code}</td><td>{m.name}</td>
                  <td>{Number(m.stock).toFixed(2)}</td>
                  <td>{Number(m.reorder_point).toFixed(2)}</td>
                </tr>
              )) : (
                <tr><td colSpan="4">No hay materiales por debajo del punto de reorden.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="section-title">
          <h2>Movimientos recientes</h2>
          <Link to="/movements">Ver movimientos</Link>
        </div>
        <div className="dashboard-table-card">
          <table>
            <thead>
              <tr><th>Fecha</th><th>Tipo</th><th>Material</th><th>Cantidad</th><th>Origen</th><th>Destino</th><th>Usuario</th></tr>
            </thead>
            <tbody>
              {recentMovements.length ? recentMovements.map((m) => (
                <tr key={m.id}>
                  <td>{m.movement_date}</td><td>{m.type}</td>
                  <td>{m.material_name}</td><td>{m.quantity}</td>
                  <td>{m.origin_name || '-'}</td><td>{m.destination_name || '-'}</td>
                  <td>{m.user_name}</td>
                </tr>
              )) : (
                <tr><td colSpan="7">Aún no hay movimientos registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Card({ label, value, icon }) {
  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <span className="kpi-label">{label}</span>
        <span className="kpi-icon" aria-hidden="true">{icon}</span>
      </div>
      <strong className="kpi-value">{value}</strong>
      <span className="kpi-footnote">Actualizado en tiempo real</span>
    </div>
  );
}
    