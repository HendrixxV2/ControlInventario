import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Dashboard() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get('/dashboard/summary').then((r) => setData(r.data));
  }, []);
  if (!data) return <p>Cargando...</p>;
  const { kpis, lowStockMaterials, recentMovements } = data;
  return (
    <div>
      <h1>Dashboard</h1>
      <div className="cards">
        <Card label="Materiales activos" value={kpis.totalMaterials} />
        <Card label="Ubicaciones" value={kpis.totalLocations} />
        <Card label="Alertas abiertas" value={kpis.openAlerts} />
        <Card label="Materiales bajo reorden" value={kpis.lowStock} />
        <Card label="Órdenes de compra" value={kpis.totalPurchaseOrders} />
        <Card label="Movimientos hoy" value={kpis.movementsToday} />
      </div>

      <h3>Materiales bajo punto de reorden</h3>
      <table>
        <thead>
          <tr><th>Código</th><th>Material</th><th>Stock</th><th>PR</th></tr>
        </thead>
        <tbody>
          {lowStockMaterials.map((m) => (
            <tr key={m.id}>
              <td>{m.code}</td><td>{m.name}</td>
              <td>{Number(m.stock).toFixed(2)}</td>
              <td>{Number(m.reorder_point).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Movimientos recientes</h3>
      <table>
        <thead>
          <tr><th>Fecha</th><th>Tipo</th><th>Material</th><th>Cant.</th><th>Origen</th><th>Destino</th><th>Usuario</th></tr>
        </thead>
        <tbody>
          {recentMovements.map((m) => (
            <tr key={m.id}>
              <td>{m.movement_date}</td><td>{m.type}</td>
              <td>{m.material_name}</td><td>{m.quantity}</td>
              <td>{m.origin_name || '-'}</td><td>{m.destination_name || '-'}</td>
              <td>{m.user_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Card({ label, value }) {
  return (
    <div className="kpi-card">
      <span className="kpi-label">{label}</span>
      <strong className="kpi-value">{value}</strong>
    </div>
  );
}
    