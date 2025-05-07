// src/pages/Verify.js
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/verify.css';

const Verify = () => {
    const { token } = useParams();
    const [message, setMessage] = useState('Verificando...');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const verifyAccount = async () => {
            try {
                const res = await axios.get(`https://noir-backend-z409.onrender.com/api/auth/verify/${token}`);
                setMessage(res.data.message || 'Cuenta verificada exitosamente.');
                setSuccess(true);
            } catch (error) {
                setMessage(error.response?.data?.error || 'Error al verificar el correo.');
                setSuccess(false);
            }
        };

        verifyAccount();
    }, [token]);

    return (
        <div className={`verify-container ${success ? 'success' : 'error'}`}>
            <h2>{message}</h2>
            {success && <a href="/login">Inicia sesión</a>}
        </div>
    );
};

export default Verify;