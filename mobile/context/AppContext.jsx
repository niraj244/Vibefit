import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchData, postData, deleteData, editData } from '../utils/api';
import { saveToken, getToken, removeToken, saveData, getData, removeData } from '../utils/storage';

export const MyContext = createContext(null);

export const useApp = () => {
  const ctx = useContext(MyContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export function AppProvider({ children }) {
  const [isLogin, setIsLogin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [cartData, setCartData] = useState([]);
  const [myListData, setMyListData] = useState([]);
  const [catData, setCatData] = useState([]);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // ── Auth ──────────────────────────────────────────────────────────────
  const checkAuth = useCallback(async () => {
    try {
      const token = await getToken('accessToken');
      if (!token) { setIsAuthLoading(false); return; }
      const res = await fetchData('/api/user/user-details');
      if (res?.data) {
        setUserData(res.data);
        setIsLogin(true);
        await loadCart();
        await loadWishlist();
      }
    } catch {
      await removeToken('accessToken');
      await removeToken('refreshToken');
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, []);

  const login = async (email, password) => {
    const res = await postData('/api/user/login', { email, password });
    if (res?.accesstoken) {
      await saveToken('accessToken', res.accesstoken);
      await saveToken('refreshToken', res.refreshToken || '');
      setUserData(res.userData);
      setIsLogin(true);
      await mergeGuestCart();
      await loadCart();
      await loadWishlist();
    }
    return res;
  };

  const logout = async () => {
    try { await fetchData('/api/user/logout'); } catch {}
    await removeToken('accessToken');
    await removeToken('refreshToken');
    setIsLogin(false);
    setUserData(null);
    setCartData([]);
    setMyListData([]);
  };

  // ── Cart ──────────────────────────────────────────────────────────────
  const loadCart = async () => {
    try {
      const res = await fetchData('/api/cart/get');
      setCartData(res?.data || []);
    } catch {}
  };

  const addToCart = async (product) => {
    if (!isLogin) {
      // Guest cart stored in AsyncStorage
      const guestCart = (await getData('guestCart')) || [];
      const existing = guestCart.find(
        (i) => i.productId === product.productId && i.size === product.size
      );
      if (existing) {
        existing.quantity += product.quantity || 1;
        existing.subTotal = existing.quantity * existing.price;
      } else {
        guestCart.push({
          _id: `guest_${Date.now()}_${Math.random()}`,
          isGuest: true,
          quantity: product.quantity || 1,
          subTotal: product.price * (product.quantity || 1),
          ...product,
        });
      }
      await saveData('guestCart', guestCart);
      setCartData(guestCart);
      return;
    }
    try {
      await postData('/api/cart/add', product);
      await loadCart();
    } catch (e) { throw e; }
  };

  const removeCartItem = async (id, isGuest) => {
    if (isGuest) {
      const guestCart = ((await getData('guestCart')) || []).filter((i) => i._id !== id);
      await saveData('guestCart', guestCart);
      setCartData(guestCart);
      return;
    }
    await deleteData(`/api/cart/delete-cart-item/${id}`);
    await loadCart();
  };

  const updateCartItemQty = async (id, qty, subTotal, isGuest) => {
    if (isGuest) {
      const guestCart = (await getData('guestCart')) || [];
      const item = guestCart.find((i) => i._id === id);
      if (item) { item.quantity = qty; item.subTotal = subTotal; }
      await saveData('guestCart', guestCart);
      setCartData([...guestCart]);
      return;
    }
    await editData('/api/cart/update-qty', { _id: id, qty, subTotal });
    await loadCart();
  };

  const clearCart = async (userId) => {
    try { await deleteData(`/api/cart/emptyCart/${userId}`); } catch {}
    setCartData([]);
  };

  const mergeGuestCart = async () => {
    const guestCart = (await getData('guestCart')) || [];
    for (const item of guestCart) {
      try { await postData('/api/cart/add', item); } catch {}
    }
    await removeData('guestCart');
  };

  // Load guest cart for non-logged-in users
  useEffect(() => {
    if (!isLogin) {
      getData('guestCart').then((gc) => setCartData(gc || []));
    }
  }, [isLogin]);

  // ── Wishlist ──────────────────────────────────────────────────────────
  const loadWishlist = async () => {
    try {
      const res = await fetchData('/api/myList');
      setMyListData(res?.data || []);
    } catch {}
  };

  const toggleWishlist = async (productId) => {
    if (!isLogin) return false;
    const exists = myListData.find((i) => i.productId === productId);
    if (exists) {
      await deleteData(`/api/myList/${exists._id}`);
    } else {
      await postData('/api/myList', { productId });
    }
    await loadWishlist();
    return !exists;
  };

  const isInWishlist = (productId) => myListData.some((i) => i.productId === productId);

  // ── Categories ────────────────────────────────────────────────────────
  useEffect(() => {
    fetchData('/api/category/get-all').then((res) => setCatData(res?.data || [])).catch(() => {});
  }, []);

  const cartTotal = cartData.reduce((sum, i) => sum + (i.subTotal || 0), 0);
  const cartCount = cartData.reduce((sum, i) => sum + (i.quantity || 0), 0);

  return (
    <MyContext.Provider
      value={{
        isLogin, setIsLogin,
        userData, setUserData,
        isAuthLoading,
        login, logout, checkAuth,
        cartData, setCartData, cartTotal, cartCount,
        addToCart, removeCartItem, updateCartItemQty, clearCart, loadCart,
        myListData, toggleWishlist, isInWishlist, loadWishlist,
        catData,
      }}
    >
      {children}
    </MyContext.Provider>
  );
}
