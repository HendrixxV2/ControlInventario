import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

const empty = {
  code: '', name: '', description: '', unit: 'unidad',
  min_stock: 0, max_stock: 0,
  avg_daily_demand: 0, max_daily_demand: 0,
  lead_time_days: 0, category: '', subcategory: '', active: true
};

export default function Materials() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const { data } = await api.get('/materials', { params: { q: q || undefined } });
    setItems(data);
  }
  useEffect(() => { load(); }, []);

  function setField(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/materials', form);
      setForm(empty);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  }

  return (
    <div>
      <div className="header-row">
        <h1>Materiales</h1>
        <button onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancelar' : 'Nuevo material'}
        </button>
      </div>

      <div className="filters">
        <input placeholder="Buscar por código o nombre"
               value={q} onChange={(e) => setQ(e.target.value)} />
        <button onClick={load}>Buscar</button>
      </div>

      {showForm && (
        <form className="card form-grid" onSubmit={submit}>
          <input placeholder="Código" value={form.code}
                 onChange={(e) => setField('code', e.target.value)} />
          <input placeholder="Nombre" value={form.name}
                 onChange={(e) => setField('name', e.target.value)} />
          <input placeholder="Unidad" value={form.unit}
                 onChange={(e) => setField('unit', e.target.value)} />
          <input type="number" placeholder="Stock mín" value={form.min_stock}
                 onChange={(e) => setField('min_stock', e.target.value)} />
          <input type="number" placeholder="Stock máx" value={form.max_stock}
                 onChange={(e) => setField('max_stock', e.target.value)} />
          <input type="number" step="0.01" placeholder="Demanda prom/día"
                 value={form.avg_daily_demand}
                 onChange={(e) => setField('avg_daily_demand', e.target.value)} />
          <input type="number" step="0.01" placeholder="Demanda máx/día"
                 value={form.max_daily_demand}
                 onChange={(e) => setField('max_daily_demand', e.target.value)} />
          <input type="number" placeholder="Lead time (días)"
                 value={form.lead_time_days}
                 onChange={(e) => setField('lead_time_days', e.target.value)} />
          <input placeholder="Categoría" value={form.category}
                 onChange={(e) => setField('category', e.target.value)} />
          <input placeholder="Subcategoría" value={form.subcategory}
                 onChange={(e) => setField('subcategory', e.target.value)} />
          <textarea placeholder="Descripción" value={form.description}
                    onChange={(e) => setField('description', e.target.value)} />
          <button type="submit">Guardar</button>
          {error && <p className="error">{error}</p>}
        </form>
      )}

      <table>
        <thead>
          <tr>
            <th>Código</th><th>Nombre</th><th>Unidad</th>
            <th>Stock mín</th><th>Stock máx</th>
            <th>SS</th><th>PR</th><th>Activo</th><th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((m) => (
            <tr key={m.id}>
              <td>{m.code}</td>
              <td>{m.name}</td>
              <td>{m.unit}</td>
              <td>{m.min_stock}</td>
              <td>{m.max_stock}</td>
              <td>{Number(m.safety_stock).toFixed(2)}</td>
              <td>{Number(m.reorder_point).toFixed(2)}</td>
              <td>{m.active ? 'Sí' : 'No'}</td>
              <td><Link to={`/materials/${m.id}`}>Ver</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}