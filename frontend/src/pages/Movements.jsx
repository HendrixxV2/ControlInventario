import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Movements() {
  const [items, setItems] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [locations, setLocations] = useState([]);
  const [filters, setFilters] = useState({ materialId: '', locationId: '', type: '' });
  const [form, setForm] = useState({
    material_id: '', type: 'entrada', quantity: 1,
    origin_location_id: '', destination_location_id: '',
    source_document: '', observations: ''
  });
  const [error, setError] = useState('');

  async function load() {
    const { data } = await api.get('/movements', {
      params: {
        materialId: filters.materialId || undefined,
        locationId: filters.locationId || undefined,
        type: filters.type || undefined
      }
    });
    setItems(data);
  }

  useEffect(() => {
    api.get('/materials').then((r) => setMaterials(r.data));
    api.get('/locations').then((r) => setLocations(r.data));
    load();
  }, []);

  function setField(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        material_id: Number(form.material_id),
        type: form.type,
        quantity: Number(form.quantity),
        origin_location_id: form.origin_location_id || null,
        destination_location_id: form.destination_location_id || null,
        source_document: form.source_document || null,
        observations: form.observations || null
      };
      await api.post('/movements', payload);
      setForm({ ...form, quantity: 1, source_document: '', observations: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar');
    }
  }

  const needOrigin = form.type === 'salida' || form.type === 'traslado';
  const needDest = form.type === 'entrada' || form.type === 'traslado' || form.type === 'ajuste';

  return (
    <div>
      <h1>Movimientos</h1>

      <form className="card form-grid" onSubmit={submit}>
        <select value={form.material_id}
                onChange={(e) => setField('material_id', e.target.value)}>
          <option value="">Material...</option>
          {materials.map((m) => (
            <option key={m.id} value={m.id}>{m.code} — {m.name}</option>
          ))}
        </select>

        <select value={form.type} onChange={(e) => setField('type', e.target.value)}>
          <option value="entrada">Entrada</option>
          <option value="salida">Salida</option>
          <option value="traslado">Traslado</option>
          <option value="ajuste">Ajuste</option>
        </select>

        <input type="number" step="0.01" placeholder="Cantidad"
               value={form.quantity}
               onChange={(e) => setField('quantity', e.target.value)} />

        {needOrigin && (
          <select value={form.origin_location_id}
                  onChange={(e) => setField('origin_location_id', e.target.value)}>
            <option value="">Origen...</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.code} — {l.name}</option>
            ))}
          </select>
        )}

        {needDest && (
          <select value={form.destination_location_id}
                  onChange={(e) => setField('destination_location_id', e.target.value)}>
            <option value="">Destino...</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.code} — {l.name}</option>
            ))}
          </select>
        )}

        <input placeholder="Documento origen"
               value={form.source_document}
               onChange={(e) => setField('source_document', e.target.value)} />
        <input placeholder="Observaciones"
               value={form.observations}
               onChange={(e) => setField('observations', e.target.value)} />

        <button type="submit">Registrar</button>
        {error && <p className="error">{error}</p>}
      </form>

      <div className="filters">
        <select value={filters.materialId}
                onChange={(e) => setFilters({ ...filters, materialId: e.target.value })}>
          <option value="">Todos los materiales</option>
          {materials.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
        <select value={filters.locationId}
                onChange={(e) => setFilters({ ...filters, locationId: e.target.value })}>
          <option value="">Todas las ubicaciones</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
        <select value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
          <option value="">Todos los tipos</option>
          <option value="entrada">Entrada</option>
          <option value="salida">Salida</option>
          <option value="traslado">Traslado</option>
          <option value="ajuste">Ajuste</option>
        </select>
        <button onClick={load}>Filtrar</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Fecha</th><th>Tipo</th><th>Material</th><th>Cant.</th>
            <th>Origen</th><th>Destino</th><th>Doc.</th><th>Usuario</th>
          </tr>
        </thead>
        <tbody>
          {items.map((m) => (
            <tr key={m.id}>
              <td>{m.movement_date}</td>
              <td>{m.type}</td>
              <td>{m.material_name}</td>
              <td>{m.quantity}</td>
              <td>{m.origin_name || '-'}</td>
              <td>{m.destination_name || '-'}</td>
              <td>{m.source_document || '-'}</td>
              <td>{m.user_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}