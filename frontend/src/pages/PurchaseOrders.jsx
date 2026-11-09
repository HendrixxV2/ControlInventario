import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [form, setForm] = useState({
    supplier_id: '', destination_location_id: '', observations: '',
    items: [{ material_id: '', quantity: 1, unit_price: 0 }]
  });
  const [error, setError] = useState('');

  async function load() {
    const { data } = await api.get('/purchase-orders');
    setOrders(data);
  }

  useEffect(() => {
    api.get('/suppliers').then((r) => setSuppliers(r.data));
    api.get('/locations').then((r) => setLocations(r.data));
    api.get('/materials').then((r) => setMaterials(r.data));
    load();
  }, []);

  function setField(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  function setItem(i, k, v) {
    const items = [...form.items];
    items[i] = { ...items[i], [k]: v };
    setForm({ ...form, items });
  }
  function addItem() {
    setForm({ ...form, items: [...form.items, { material_id: '', quantity: 1, unit_price: 0 }] });
  }
  function removeItem(i) {
    setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        supplier_id: Number(form.supplier_id),
        destination_location_id: Number(form.destination_location_id),
        observations: form.observations || null,
        items: form.items.map((it) => ({
          material_id: Number(it.material_id),
          quantity: Number(it.quantity),
          unit_price: Number(it.unit_price || 0)
        }))
      };
      await api.post('/purchase-orders', payload);
      setForm({
        supplier_id: '', destination_location_id: '', observations: '',
        items: [{ material_id: '', quantity: 1, unit_price: 0 }]
      });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  }

  return (
    <div>
      <div className="header-row">
        <h1>Órdenes de compra</h1>
        <Link to="/duplicates">Ver posibles duplicados</Link>
      </div>

      <form className="card form-grid" onSubmit={submit}>
        <select value={form.supplier_id}
                onChange={(e) => setField('supplier_id', e.target.value)}>
          <option value="">Proveedor...</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select value={form.destination_location_id}
                onChange={(e) => setField('destination_location_id', e.target.value)}>
          <option value="">Ubicación destino...</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>

        <input placeholder="Observaciones" value={form.observations}
               onChange={(e) => setField('observations', e.target.value)} />

        <h4>Ítems</h4>
        {form.items.map((it, i) => (
          <div key={i} className="item-row">
            <select value={it.material_id}
                    onChange={(e) => setItem(i, 'material_id', e.target.value)}>
              <option value="">Material...</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>{m.code} — {m.name}</option>
              ))}
            </select>
            <input type="number" step="0.01" placeholder="Cantidad"
                   value={it.quantity}
                   onChange={(e) => setItem(i, 'quantity', e.target.value)} />
            <input type="number" step="0.01" placeholder="Precio unit."
                   value={it.unit_price}
                   onChange={(e) => setItem(i, 'unit_price', e.target.value)} />
            {form.items.length > 1 && (
              <button type="button" onClick={() => removeItem(i)}>Quitar</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addItem}>+ Ítem</button>
        <button type="submit">Crear OC</button>
        {error && <p className="error">{error}</p>}
      </form>

      <table>
        <thead>
          <tr>
            <th>Número</th><th>Proveedor</th><th>Destino</th>
            <th>Estado</th><th>Total</th><th>Creada</th><th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.order_number}</td>
              <td>{o.supplier_name}</td>
              <td>{o.destination_name}</td>
              <td>{o.status}</td>
              <td>{Number(o.total).toFixed(2)}</td>
              <td>{o.created_at}</td>
              <td><Link to={`/purchase-orders/${o.id}`}>Ver</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}