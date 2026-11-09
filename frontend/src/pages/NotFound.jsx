import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="login">
      <div className="card">
        <h1>404</h1>
        <p>Página no encontrada.</p>
        <Link to="/">Volver al inicio</Link>
      </div>
    </div>
  );
}