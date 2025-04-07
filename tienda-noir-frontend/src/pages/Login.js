import { useState } from 'react';
import { login } from '../api/auth';
import { useNavigate } from 'react-router-dom';

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
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" placeholder="Correo" onChange={handleChange} />
      <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} />
      <button type="submit">Iniciar Sesión</button>
    </form>
  );
};

export default Login;