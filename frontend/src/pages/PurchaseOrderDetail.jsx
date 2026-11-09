import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';

export default function PurchaseOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    const { data } = await api.get(`/purchase-orders/${id}`);
    setOrder(data);
  }
  useEffect(() => { load(); }, [id]);

  async function receive() {
    setError('');
    try {
      await api.post(`/purchase-orders/${id}/receive`);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al recibir');
    }
  }

  if (!order) return <p>Cargando...</p>;

  return (
    <div>
      <h1>OC {order.order_number}</h1>
      <p>Estado: <strong>{order.status}</strong> · Total: {Number(order.total).toFixed(2)}</p>
      <p>Observaciones: {order.observations || '-'}</p>

      {order.status !== 'recibida' && order.status !== 'cancelada' && (
        <button onClick={receive}>Marcar como recibida (genera entradas)</button>
      )}
      {error && <p className="error">{error}</p>}

      <h3>Ítems</h3>
      <table>
        <thead>
          <tr>
            <th>Código</th><th>Material</th><th>Cantidad</th>
            <th>Precio unit.</th><th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((it) => (
            <tr key={it.id}>
              <td>{it.material_code}</td>
              <td>{it.material_name}</td>
              <td>{it.quantity}</td>
              <td>{Number(it.unit_price).toFixed(2)}</td>
              <td>{Number(it.subtotal).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}