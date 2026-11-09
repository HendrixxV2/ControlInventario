import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Alerts() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  async function load() {
    const { data } = await api.get('/alerts/reorder');
    setItems(data);
  }
  useEffect(() => { load(); }, []);

  async function recheck() {
    setError('');
    try {
      const { data } = await api.post('/alerts/recheck');
      setItems(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al re-evaluar');
    }
  }

  async function resolve(id) {
    setError('');
    try {
      const { data } = await api.post(`/alerts/${id}/resolve`);
      setItems(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al resolver');
    }
  }

  return (
    <div>
      <div className="header-row">
        <h1>Alertas de reorden</h1>
        <button onClick={recheck}>Re-evaluar alertas</button>
      </div>
      {error && <p className="error">{error}</p>}

      <table>
        <thead>
          <tr>
            <th>Material</th><th>Código</th>
            <th>Stock actual</th><th>PR</th>
            <th>Creada</th><th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => (
            <tr key={a.id}>
              <td>{a.material_name}</td>
              <td>{a.material_code}</td>
              <td>{Number(a.current_stock).toFixed(2)}</td>
              <td>{Number(a.reorder_point).toFixed(2)}</td>
              <td>{a.created_at}</td>
              <td><button onClick={() => resolve(a.id)}>Resolver</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}