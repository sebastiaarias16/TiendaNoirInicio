import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

export const register = async (userData) => {
    const res = await axios.post(`${API_URL}/register`, userData);
    return res.data;
};

export const login = async (userData) => {
    const res = await axios.post(`${API_URL}/login`, userData);
    
    // Guarda el token y el usuario en localStorage
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    
    return res.data.user; // Retorna el usuario para setUser()
};


export const getUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const res = await axios.get(`${API_URL}/user`, {
            headers: { 'x-auth-token': token }
        });
        return res.data;
    } catch (error) {
        console.error("Error obteniendo el usuario:", error);
        return null;
    }
};

// ✅ Corrección en la función logout
export const logout = () => {
    localStorage.removeItem("token"); // Eliminamos el token
};

