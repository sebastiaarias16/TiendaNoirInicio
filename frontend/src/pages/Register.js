import { useState } from 'react';
import { register } from '../api/auth';
import '../styles/register.css';
import backgroundImage from '../assets/fondo2.jpg';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { name, email, password, confirmPassword } = form;

    if (!/\S+@\S+\.\S+/.test(email)) {
      return setError('Correo inválido');
    }

    if (password !== confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }

    try {
      await register({ name, email, password });
      alert('Registro exitoso. Revisa tu correo para confirmar la cuenta.');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar');
    }
  };

  return (
    <div className="register-wrapper" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="register-container">
        <form className="register-form" onSubmit={handleSubmit}>
          <h2>Crear Cuenta</h2>

          {error && <p className="error-message">{error}</p>}

          <input type="text" name="name" placeholder="Nombre" value={form.name} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Correo electrónico" value={form.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required />
          <input type="password" name="confirmPassword" placeholder="Confirmar Contraseña" value={form.confirmPassword} onChange={handleChange} required />

          <button type="submit">Registrarse</button>
          <p className="login-link">¿Ya tienes una cuenta? <a href="/login">Inicia sesión</a></p>
        </form>
      </div>
    </div>
  );
};

export default Register;