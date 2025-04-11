import { useState } from 'react';
import { login } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';
import backgroundImage from '../assets/fondo2.jpg';

const Login = ({ setUser }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await login(form);
    if (user) {
      setUser(user);
      navigate('/'); // Redirigir a la página principal después del login
    } else {
      alert('Error en el inicio de sesión');
    }
  };

  return (
    <div
      className="login-wrapper"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>LOGIN</h2>
          <input type="email" name="email" placeholder="Correo" onChange={handleChange} />
          <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} />
          <button type="submit">Iniciar Sesión</button>
          <p className="login-link">¿No tienes una cuenta? <a href="/Register">Registrate</a></p>
        </form>
      </div>
    </div>
  );
};

export default Login;