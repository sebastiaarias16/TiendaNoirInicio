import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import { getUser, logout } from './api/auth';
import './styles/navbar.css';
import '../src/App.css';
import Verify from './pages/Verify';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const loggedUser = await getUser();
      setUser(loggedUser);
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify/:token" element={<Verify />} />
      </Routes>
    </Router>
  );
};

export default App;
