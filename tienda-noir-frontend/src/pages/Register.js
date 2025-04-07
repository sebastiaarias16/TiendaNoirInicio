import { useState } from 'react';
import { register } from '../api/auth';

const Register = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '' });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await register(form);
        alert('Registro exitoso. Inicia sesión.');
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="Nombre" onChange={handleChange} />
            <input type="email" name="email" placeholder="Correo" onChange={handleChange} />
            <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} />
            <button type="submit">Registrarse</button>
        </form>
    );
};

export default Register;