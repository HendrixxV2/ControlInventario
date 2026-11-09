import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Duplicates() {
  const [data, setData] = useState({ rule: null, duplicates: [] });
  const [error, setError] = useState('');

  async function load() {
    const res = await api.get('/purchase-orders/duplicates');
    setData(res.data);
  }
  useEffect(() => { load(); }, []);

  async function updateRule(e) {
    e.preventDefault();
    setError('');
    try {
      await api.put(`/duplicate-rules/${data.rule.id}`, data.rule);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar regla');
    }
  }

  function setRule(k, v) { setData({ ...data, rule: { ...data.rule, [k]: v } }); }

  return (
    <div>
      <h1>Duplicados de compra</h1>

      {data.rule && (
        <form className="card form-grid" onSubmit={updateRule}>
          <label>% diferencia cantidad
            <input type="number" step="0.01" value={data.rule.quantity_diff_pct}
                   onChange={(e) => setRule('quantity_diff_pct', e.target.value)} />
          </label>
          <label>Ventana (días)
            <input type="number" value={data.rule.date_window_days}
                   onChange={(e) => setRule('date_window_days', e.target.value)} />
          </label>
          <label>Estados excluidos
            <input value={data.rule.excluded_statuses}
                   onChange={(e) => setRule('excluded_statuses', e.target.value)} />
          </label>
          <button type="submit">Guardar regla</button>
          {error && <p className="error">{error}</p>}
        </form>
      )}

      <h3>Posibles duplicados</h3>
      <table>
        <thead>
          <tr>
            <th>Material</th><th>Proveedor</th>
            <th>OC A</th><th>Fecha A</th><th>Cant. A</th>
            <th>OC B</th><th>Fecha B</th><th>Cant. B</th>
            <th>% Dif.</th><th>Días</th>
          </tr>
        </thead>
        <tbody>
          {data.duplicates.map((d, i) => (
            <tr key={i}>
              <td>{d.material_name}</td>
              <td>{d.supplier_name}</td>
              <td>{d.order_a}</td><td>{d.date_a}</td>
              <td>{d.qty_a}</td>
              <td>{d.order_b}</td><td>{d.date_b}</td>
              <td>{d.qty_b}</td>
              <td>{Number(d.diff_pct).toFixed(2)}</td>
              <td>{d.days_diff}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}