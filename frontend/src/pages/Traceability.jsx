import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';

export default function Traceability() {
  const [params, setParams] = useSearchParams();
  const [materials, setMaterials] = useState([]);
  const [data, setData] = useState(null);
  const materialId = params.get('materialId') || '';

  useEffect(() => {
    api.get('/materials').then((r) => setMaterials(r.data));
  }, []);

  useEffect(() => {
    if (materialId) {
      api.get(`/materials/${materialId}/traceability`).then((r) => setData(r.data));
    } else {
      setData(null);
    }
  }, [materialId]);

  return (
    <div>
      <h1>Trazabilidad</h1>

      <div className="filters">
        <select value={materialId}
                onChange={(e) => setParams({ materialId: e.target.value })}>
          <option value="">Seleccione material...</option>
          {materials.map((m) => (
            <option key={m.id} value={m.id}>{m.code} — {m.name}</option>
          ))}
        </select>
      </div>

      {data && (
        <>
          <div className="cards">
            <div className="kpi-card">
              <span className="kpi-label">Material</span>
              <strong className="kpi-value">{data.material.name}</strong>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Stock global</span>
              <strong className="kpi-value">{data.globalStock}</strong>
            </div>
          </div>

          <h3>Historial de movimientos</h3>
          <table>
            <thead>
              <tr>
                <th>Fecha</th><th>Tipo</th><th>Cant.</th>
                <th>Origen</th><th>Destino</th>
                <th>Doc. origen</th><th>Usuario</th><th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {data.movements.map((m) => (
                <tr key={m.id}>
                  <td>{m.movement_date}</td>
                  <td>{m.type}</td>
                  <td>{m.quantity}</td>
                  <td>{m.origin_name || '-'}</td>
                  <td>{m.destination_name || '-'}</td>
                  <td>{m.source_document || '-'}</td>
                  <td>{m.user_name}</td>
                  <td>{m.observations || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}