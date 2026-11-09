import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Locations() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', type: 'bodega', code: '', active: true });
  const [stockOf, setStockOf] = useState(null);
  const [stock, setStock] = useState([]);
  const [error, setError] = useState('');

  async function load() {
    const { data } = await api.get('/locations');
    setItems(data);
  }
  useEffect(() => { load(); }, []);

  function setField(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/locations', form);
      setForm({ name: '', type: 'bodega', code: '', active: true });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  }

  async function viewStock(id) {
    setStockOf(id);
    const { data } = await api.get(`/locations/${id}/stock`);
    setStock(data);
  }

  return (
    <div>
      <h1>Ubicaciones</h1>

      <form className="card form-grid" onSubmit={submit}>
        <input placeholder="Nombre" value={form.name}
               onChange={(e) => setField('name', e.target.value)} />
        <input placeholder="Código" value={form.code}
               onChange={(e) => setField('code', e.target.value)} />
        <select value={form.type} onChange={(e) => setField('type', e.target.value)}>
          <option value="bodega">Bodega</option>
          <option value="obra">Obra</option>
        </select>
        <button type="submit">Crear</button>
        {error && <p className="error">{error}</p>}
      </form>

      <table>
        <thead>
          <tr><th>Nombre</th><th>Tipo</th><th>Código</th><th>Activa</th><th></th></tr>
        </thead>
        <tbody>
          {items.map((l) => (
            <tr key={l.id}>
              <td>{l.name}</td>
              <td>{l.type}</td>
              <td>{l.code}</td>
              <td>{l.active ? 'Sí' : 'No'}</td>
              <td>
                <button onClick={() => viewStock(l.id)}>Ver stock</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {stockOf && (
        <>
          <h3>Stock de la ubicación #{stockOf}</h3>
          <table>
            <thead>
              <tr><th>Código</th><th>Material</th><th>Unidad</th><th>Cantidad</th></tr>
            </thead>
            <tbody>
              {stock.map((s) => (
                <tr key={s.material_id}>
                  <td>{s.code}</td>
                  <td>{s.name}</td>
                  <td>{s.unit}</td>
                  <td>{Number(s.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}