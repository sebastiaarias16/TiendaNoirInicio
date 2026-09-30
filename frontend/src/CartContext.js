import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Cargar desde localStorage al montar
  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem('cartItems'));
      if (Array.isArray(savedCart)) {
        setCartItems(savedCart);
      }
    } catch (error) {
      console.error('Error cargando carrito desde localStorage', error);
    }
  }, []);

  // Guardar en localStorage cada vez que cartItems cambie
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantityToAdd = 1) => {
    const qty = typeof quantityToAdd === 'number' && quantityToAdd > 0 ? quantityToAdd : 1;
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item._id === product._id);
      if (existingItem) {
        // Aumenta la cantidad si ya existe
        return prevItems.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      } else {
        // Agrega con cantidad inicial
        return [...prevItems, { ...product, quantity: qty }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item._id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const incrementQuantity = (productId) => {
    setCartItems(prev =>
      prev.map(item =>
        item._id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };
  
  const decrementQuantity = (productId) => {
    setCartItems(prev =>
      prev.map(item =>
        item._id === productId
          ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
          : item
      )
    );
  };


  return (
    <CartContext.Provider value={{ cartItems, setCartItems, addToCart, removeFromCart, clearCart, incrementQuantity, decrementQuantity }}>
      {children}
    </CartContext.Provider>
  );
};