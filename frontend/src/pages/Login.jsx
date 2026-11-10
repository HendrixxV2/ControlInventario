import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    try {
      await login(email, password);
      nav('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error de login');
    }
  }

  return (
    <div className="login">
      <section className="login-aside" aria-label="Acerca del sistema">
        <div className="login-brand">
          <div className="brand">
            <span className="brand-mark">N</span>
            <span>
              <span className="brand-name">NODO</span>
              <span className="brand-caption">Control de inventario</span>
            </span>
          </div>
        </div>
        <div className="login-message">
          <p className="hero-eyebrow">Todo en su lugar</p>
          <h1>Tu operación, con una visión más clara.</h1>
          <p>Administra materiales, movimientos y abastecimiento con la información que necesitas para tomar mejores decisiones.</p>
          <div className="login-points">
            <span className="login-point">Existencias en tiempo real</span>
            <span className="login-point">Seguimiento de movimientos</span>
            <span className="login-point">Alertas de inventario</span>
          </div>
        </div>
        <p className="login-footnote">Gestión de inventario · Espacio de trabajo seguro</p>
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <div className="login-mobile-brand">
            <div className="brand">
              <span className="brand-mark">N</span>
              <span>
                <span className="brand-name">NODO</span>
                <span className="brand-caption">Control de inventario</span>
              </span>
            </div>
          </div>
          <p className="login-kicker">Bienvenido de nuevo</p>
          <h2>Inicia sesión</h2>
          <p className="login-intro">Ingresa tus credenciales para acceder a tu espacio de trabajo.</p>
          <form onSubmit={submit} className="card">
            <label htmlFor="login-email">Correo electrónico</label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              placeholder="nombre@empresa.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Escribe tu contraseña"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="login-error" role="alert">{error}</p>}
            <button type="submit">Entrar al sistema</button>
          </form>
          <p className="login-secure">Acceso protegido para tu equipo</p>
        </div>
      </section>
    </div>
  );
}