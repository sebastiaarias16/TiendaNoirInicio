import { createContext, useState, useEffect, useCallback } from 'react';
import { getCartItemKey } from './utils/productUtils';

export const CartContext = createContext();

/**
 * Normalizes legacy or raw cart items into the robust composite key structure.
 * Guarantees no data loss for users who already have items in localStorage.
 */
const normalizeCartItem = (item) => {
  if (!item) return null;
  const selectedSize = (
    item.selectedSize ||
    item.talla ||
    (Array.isArray(item.tallas) && item.tallas[0]) ||
    'M'
  ).toString().trim().toUpperCase();

  const selectedColor = (
    item.selectedColor ||
    item.color ||
    (Array.isArray(item.colores) && item.colores[0]) ||
    'Negro'
  ).toString().trim();

  const cartKey = item.cartKey || getCartItemKey(item, selectedSize, selectedColor);
  const quantity = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1;

  return {
    ...item,
    selectedSize,
    selectedColor,
    cartKey,
    quantity,
  };
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Load and normalize from localStorage upon mount
  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem('cartItems'));
      if (Array.isArray(savedCart)) {
        const normalized = savedCart.map(normalizeCartItem).filter(Boolean);
        setCartItems(normalized);
      }
    } catch (error) {
      console.error('Error cargando carrito desde localStorage:', error);
    }
  }, []);

  // Save to localStorage whenever cartItems changes
  useEffect(() => {
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error guardando carrito en localStorage:', error);
    }
  }, [cartItems]);

  const openCartDrawer = useCallback(() => setIsCartDrawerOpen(true), []);
  const closeCartDrawer = useCallback(() => setIsCartDrawerOpen(false), []);

  /**
   * Adds an item to the cart using its composite key (_id + selectedSize + selectedColor).
   * Same product in different variants creates independent lines.
   */
  const addToCart = (product, quantityToAdd = 1, sizeOverride = null, colorOverride = null) => {
    if (!product) return;

    const size = (
      sizeOverride ||
      product.selectedSize ||
      product.talla ||
      (Array.isArray(product.tallas) && product.tallas[0]) ||
      'M'
    ).toString().trim().toUpperCase();

    const color = (
      colorOverride ||
      product.selectedColor ||
      product.color ||
      (Array.isArray(product.colores) && product.colores[0]) ||
      'Negro'
    ).toString().trim();

    const key = getCartItemKey(product, size, color);
    const qty = typeof quantityToAdd === 'number' && quantityToAdd > 0 ? quantityToAdd : 1;
    const maxStock = typeof product.stock === 'number' ? product.stock : 999;

    setCartItems(prevItems => {
      const existingIndex = prevItems.findIndex(item => item.cartKey === key || item._id === key);

      if (existingIndex > -1) {
        return prevItems.map((item, index) => {
          if (index === existingIndex) {
            const newQty = Math.min(item.quantity + qty, maxStock);
            return {
              ...item,
              quantity: newQty,
              selectedSize: size,
              selectedColor: color,
              cartKey: key,
            };
          }
          return item;
        });
      } else {
        const initialQty = Math.min(qty, maxStock);
        const newItem = {
          ...product,
          selectedSize: size,
          selectedColor: color,
          cartKey: key,
          quantity: initialQty,
        };
        return [...prevItems, newItem];
      }
    });

    // Automatically trigger cart drawer for instant feedback
    setIsCartDrawerOpen(true);
  };

  /**
   * Removes an item by composite cartKey or fallback _id.
   */
  const removeFromCart = (cartKeyOrId) => {
    setCartItems(prev => prev.filter(item => item.cartKey !== cartKeyOrId && item._id !== cartKeyOrId));
  };

  /**
   * Increments item quantity respecting stock limits.
   */
  const incrementQuantity = (cartKeyOrId) => {
    setCartItems(prev =>
      prev.map(item => {
        if (item.cartKey === cartKeyOrId || item._id === cartKeyOrId) {
          const maxStock = typeof item.stock === 'number' ? item.stock : 999;
          const nextQty = Math.min(item.quantity + 1, maxStock);
          return { ...item, quantity: nextQty };
        }
        return item;
      })
    );
  };

  /**
   * Decrements item quantity with floor at 1.
   */
  const decrementQuantity = (cartKeyOrId) => {
    setCartItems(prev =>
      prev.map(item => {
        if (item.cartKey === cartKeyOrId || item._id === cartKeyOrId) {
          return { ...item, quantity: Math.max(item.quantity - 1, 1) };
        }
        return item;
      })
    );
  };

  /**
   * Directly updates quantity with validation.
   */
  const updateQuantity = (cartKeyOrId, newQuantity) => {
    const qty = parseInt(newQuantity, 10);
    if (isNaN(qty) || qty < 1) return;

    setCartItems(prev =>
      prev.map(item => {
        if (item.cartKey === cartKeyOrId || item._id === cartKeyOrId) {
          const maxStock = typeof item.stock === 'number' ? item.stock : 999;
          return { ...item, quantity: Math.min(qty, maxStock) };
        }
        return item;
      })
    );
  };

  /**
   * Updates an item's selected variant (e.g. from checkout or drawer).
   */
  const updateCartItemVariant = (oldCartKey, newSize, newColor) => {
    setCartItems(prev => {
      const itemToUpdate = prev.find(item => item.cartKey === oldCartKey || item._id === oldCartKey);
      if (!itemToUpdate) return prev;

      const size = (newSize || itemToUpdate.selectedSize).toString().trim().toUpperCase();
      const color = (newColor || itemToUpdate.selectedColor).toString().trim();
      const newKey = getCartItemKey(itemToUpdate, size, color);

      // If the target variant already exists in another line, merge quantities!
      const existingTarget = prev.find(item => item.cartKey === newKey && item !== itemToUpdate);
      if (existingTarget) {
        return prev
          .filter(item => item !== itemToUpdate)
          .map(item => {
            if (item === existingTarget) {
              const maxStock = typeof item.stock === 'number' ? item.stock : 999;
              return {
                ...item,
                quantity: Math.min(item.quantity + itemToUpdate.quantity, maxStock),
              };
            }
            return item;
          });
      }

      return prev.map(item => {
        if (item.cartKey === oldCartKey || item._id === oldCartKey) {
          return {
            ...item,
            selectedSize: size,
            selectedColor: color,
            cartKey: newKey,
          };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Calculated totals
  const subtotal = cartItems.reduce(
    (acc, item) => acc + (Number(item.precio) || 0) * (item.quantity || 1),
    0
  );
  const itemCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        incrementQuantity,
        decrementQuantity,
        updateQuantity,
        updateCartItemVariant,
        clearCart,
        subtotal,
        itemCount,
        isCartDrawerOpen,
        openCartDrawer,
        closeCartDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};