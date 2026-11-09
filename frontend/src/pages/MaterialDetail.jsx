import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';

export default function MaterialDetail() {
  const { id } = useParams();
  const [material, setMaterial] = useState(null);
  const [stock, setStock] = useState(null);
  const [movements, setMovements] = useState([]);

  useEffect(() => {
    api.get(`/materials/${id}`).then((r) => setMaterial(r.data));
    api.get(`/materials/${id}/stock`).then((r) => setStock(r.data));
    api.get('/movements', { params: { materialId: id } })
       .then((r) => setMovements(r.data));
  }, [id]);

  if (!material) return <p>Cargando...</p>;

  return (
    <div>
      <h1>{material.name} <small>({material.code})</small></h1>
      <p>{material.description}</p>

      <div className="cards">
        <div className="kpi-card">
          <span className="kpi-label">Stock global</span>
          <strong className="kpi-value">{stock?.global ?? 0}</strong>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Punto de reorden (PR)</span>
          <strong className="kpi-value">
            {Number(material.reorder_point).toFixed(2)}
          </strong>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Stock de seguridad (SS)</span>
          <strong className="kpi-value">
            {Number(material.safety_stock).toFixed(2)}
          </strong>
        </div>
      </div>

      <h3>Stock por ubicación</h3>
      <table>
        <thead>
          <tr><th>Ubicación</th><th>Tipo</th><th>Código</th><th>Cantidad</th></tr>
        </thead>
        <tbody>
          {stock?.byLocation?.map((l) => (
            <tr key={l.location_id}>
              <td>{l.name}</td>
              <td>{l.type}</td>
              <td>{l.code}</td>
              <td>{Number(l.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Últimos movimientos</h3>
      <table>
        <thead>
          <tr>
            <th>Fecha</th><th>Tipo</th><th>Cant.</th>
            <th>Origen</th><th>Destino</th><th>Usuario</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((m) => (
            <tr key={m.id}>
              <td>{m.movement_date}</td>
              <td>{m.type}</td>
              <td>{m.quantity}</td>
              <td>{m.origin_name || '-'}</td>
              <td>{m.destination_name || '-'}</td>
              <td>{m.user_name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Link to={`/traceability?materialId=${id}`}>Ver trazabilidad completa</Link>
    </div>
  );
}