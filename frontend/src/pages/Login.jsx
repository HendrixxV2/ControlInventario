import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('admin123');
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
      <form onSubmit={submit} className="card">
        <h2>Iniciar sesión</h2>
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Entrar</button>
        <small>Demo: admin@demo.com / admin123</small>
      </form>
    </div>
  );
}