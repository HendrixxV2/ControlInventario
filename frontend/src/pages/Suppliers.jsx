import { useEffect, useState } from 'react';
import api from '../api/client';

const empty = { name: '', tax_id: '', contact: '', phone: '', email: '', active: true };

export default function Suppliers() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  async function load() {
    const { data } = await api.get('/suppliers');
    setItems(data);
  }
  useEffect(() => { load(); }, []);

  function setField(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/suppliers', form);
      setForm(empty);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  }

  return (
    <div>
      <h1>Proveedores</h1>

      <form className="card form-grid" onSubmit={submit}>
        <input placeholder="Nombre" value={form.name}
               onChange={(e) => setField('name', e.target.value)} />
        <input placeholder="NIT / ID fiscal" value={form.tax_id}
               onChange={(e) => setField('tax_id', e.target.value)} />
        <input placeholder="Contacto" value={form.contact}
               onChange={(e) => setField('contact', e.target.value)} />
        <input placeholder="Teléfono" value={form.phone}
               onChange={(e) => setField('phone', e.target.value)} />
        <input placeholder="Email" value={form.email}
               onChange={(e) => setField('email', e.target.value)} />
        <button type="submit">Crear</button>
        {error && <p className="error">{error}</p>}
      </form>

      <table>
        <thead>
          <tr>
            <th>Nombre</th><th>NIT</th><th>Contacto</th>
            <th>Teléfono</th><th>Email</th><th>Activo</th>
          </tr>
        </thead>
        <tbody>
          {items.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.tax_id || '-'}</td>
              <td>{s.contact || '-'}</td>
              <td>{s.phone || '-'}</td>
              <td>{s.email || '-'}</td>
              <td>{s.active ? 'Sí' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}