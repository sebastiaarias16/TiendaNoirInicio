import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Verify from './pages/Verify';
import Orders from './pages/Orders';
import PaymentStatus from './pages/PaymentStatus';
import { getUser, logout } from './api/auth';
import './App.css';

const App = () => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const syncUser = async () => {
      const loggedUser = await getUser();
      if (loggedUser) {
        setUser(loggedUser);
      }
    };
    syncUser();
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  return (
    <Router>
      <div className="app-wrapper">
        <Navbar user={user} onLogout={handleLogout} />
        <CartDrawer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/collections" element={<Products />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify/:token" element={<Verify />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/payment/status" element={<PaymentStatus />} />
          <Route path="/payment/success" element={<PaymentStatus />} />
          <Route path="/payment/pending" element={<PaymentStatus />} />
          <Route path="/payment/failed" element={<PaymentStatus />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
