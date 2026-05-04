import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./responsive.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./Pages/Home";
import ProductListing from "./Pages/ProductListing";
import { ProductDetails } from "./Pages/ProductDetails";
import { createContext } from "react";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import CartPage from "./Pages/Cart";
import Verify from "./Pages/Verify";
import ForgotPassword from "./Pages/ForgotPassword";
import Checkout from "./Pages/Checkout";
import MyAccount from "./Pages/MyAccount";
import MyList from "./Pages/MyList";
import Orders from "./Pages/Orders";

import toast, { Toaster } from 'react-hot-toast';
import { fetchDataFromApi, postData, deleteData, editData } from "./utils/api";
import Address from "./Pages/MyAccount/address";
import { OrderSuccess } from "./Pages/Orders/success";
import { OrderFailed } from "./Pages/Orders/failed";
import SearchPage from "./Pages/Search";
import Compare from "./Pages/Compare";
import Points from "./Pages/Points";


const MyContext = createContext();

function App() {
  const [openProductDetailsModal, setOpenProductDetailsModal] = useState({
    open: false,
    item: {}
  });
  const [isLogin, setIsLogin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [catData, setCatData] = useState([]);
  const [cartData, setCartData] = useState([]);
  const [myListData, setMyListData] = useState([]);
  const [compareData, setCompareData] = useState([]);

  const [openCartPanel, setOpenCartPanel] = useState(false);
  const [openAddressPanel, setOpenAddressPanel] = useState(false);

  const [addressMode, setAddressMode] = useState("add");
  const [addressId, setAddressId] = useState("");
  const [searchData, setSearchData] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [openFilter, setOpenFilter] = useState(false);
  const [isFilterBtnShow, setisFilterBtnShow] = useState(false);

  const [openSearchPanel, setOpenSearchPanel] = useState(false);

  const handleOpenProductDetailsModal = (status, item) => {
    setOpenProductDetailsModal({
      open: status,
      item: item
    });
  }

  const handleCloseProductDetailsModal = () => {
    setOpenProductDetailsModal({
      open: false,
      item: {}
    });
  };

  const toggleCartPanel = (newOpen) => () => {
    setOpenCartPanel(newOpen);
  };

  const toggleAddressPanel = (newOpen) => () => {
    if (newOpen == false) {
      setAddressMode("add");
    }

    setOpenAddressPanel(newOpen);
  };




  useEffect(() => {
    localStorage.removeItem("userEmail")
    const token = localStorage.getItem('accessToken');

    if (token !== undefined && token !== null && token !== "") {
      setIsLogin(true);
      getCartItems();
      getMyListData();
      getUserDetails();
    } else {
      setIsLogin(false);
      try {
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        setCartData(guestCart);
      } catch {
        setCartData([]);
      }
    }
  }, [isLogin])


  const getUserDetails = () => {
    fetchDataFromApi(`/api/user/user-details`).then((res) => {
      setUserData(res.data);
      if (res?.response?.data?.error === true) {
        if (res?.response?.data?.message === "You have not login") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          alertBox("error", "Your session is closed please login again");


          // maybe redirect to login later

          setIsLogin(false);
        }
      }
    })
  }



  useEffect(() => {
    fetchDataFromApi("/api/category").then((res) => {
      if (res?.error === false) {
        setCatData(res?.data);
      }
    })

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };

  }, []);

  const alertBox = (type, msg) => {
    if (type === "success") {
      toast.success(msg)
    }
    if (type === "error") {
      toast.error(msg)
    }
    if (type === "info") {
      toast(msg, { icon: 'ℹ️' })
    }
  }



  const addToCart = (product, userId, quantity) => {
    if (!isLogin) {
      const guestItem = {
        _id: `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        productTitle: product?.name,
        image: product?.image,
        rating: product?.rating,
        price: product?.price,
        oldPrice: product?.oldPrice,
        discount: product?.discount,
        quantity: quantity,
        subTotal: parseInt(product?.price * quantity),
        productId: product?._id,
        countInStock: product?.countInStock,
        brand: product?.brand,
        size: Array.isArray(product?.size) ? product.size[0] : product?.size,
        isGuest: true,
      };

      setCartData(prevCart => {
        const existing = prevCart.findIndex(
          i => i.productId === guestItem.productId && i.size === guestItem.size
        );
        const newCart = [...prevCart];
        if (existing >= 0) {
          newCart[existing] = {
            ...newCart[existing],
            quantity: newCart[existing].quantity + quantity,
            subTotal: newCart[existing].price * (newCart[existing].quantity + quantity),
          };
        } else {
          newCart.push(guestItem);
        }
        localStorage.setItem('guestCart', JSON.stringify(newCart));
        return newCart;
      });

      alertBox("success", "Added to cart");
      return;
    }

    const data = {
      productTitle: product?.name,
      image: product?.image,
      rating: product?.rating,
      price: product?.price,
      oldPrice: product?.oldPrice,
      discount: product?.discount,
      quantity: quantity,
      subTotal: parseInt(product?.price * quantity),
      productId: product?._id,
      countInStock: product?.countInStock,
      brand: product?.brand,
      size: product?.size,
    };

    postData("/api/cart/add", data).then((res) => {
      if (res?.error === false) {
        alertBox("success", res?.message);
        getCartItems();
      } else {
        alertBox("error", res?.message);
      }
    });
  };

  const getCartItems = () => {
    if (!isLogin) {
      try {
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        setCartData(guestCart);
      } catch {
        setCartData([]);
      }
      return;
    }
    fetchDataFromApi(`/api/cart/get`).then((res) => {
      if (res?.error === false) {
        setCartData(res?.data);
      }
    });
  };

  const mergeGuestCart = async () => {
    const stored = localStorage.getItem('guestCart');
    if (!stored) return;
    try {
      const items = JSON.parse(stored);
      if (!items || items.length === 0) {
        localStorage.removeItem('guestCart');
        return;
      }
      for (const item of items) {
        await postData("/api/cart/add", {
          productTitle: item.productTitle,
          image: item.image,
          rating: item.rating,
          price: item.price,
          oldPrice: item.oldPrice,
          discount: item.discount,
          quantity: item.quantity,
          subTotal: item.subTotal,
          productId: item.productId,
          countInStock: item.countInStock,
          brand: item.brand,
          size: item.size,
        });
      }
      localStorage.removeItem('guestCart');
      setCartData([]);
    } catch (e) {
      console.error('Failed to merge guest cart:', e);
    }
  };

  const removeCartItem = (item) => {
    if (!isLogin) {
      setCartData(prevCart => {
        const newCart = prevCart.filter(i => i._id !== item._id);
        localStorage.setItem('guestCart', JSON.stringify(newCart));
        return newCart;
      });
      alertBox("success", "Product removed from cart");
      return;
    }
    deleteData(`/api/cart/delete-cart-item/${item._id}`).then(() => {
      alertBox("success", "Product removed from cart");
      getCartItems();
    });
  };

  const updateCartItemQty = (item, newQty) => {
    if (!isLogin) {
      setCartData(prevCart => {
        const newCart = prevCart.map(i =>
          i._id === item._id
            ? { ...i, quantity: newQty, subTotal: i.price * newQty }
            : i
        );
        localStorage.setItem('guestCart', JSON.stringify(newCart));
        return newCart;
      });
      alertBox("success", "Quantity updated");
      return Promise.resolve({ data: { error: false } });
    }
    return editData("/api/cart/update-qty", {
      _id: item._id,
      qty: newQty,
      subTotal: item.price * newQty,
    });
  };

  const updateCartItemSize = (item, newSize) => {
    setCartData(prevCart => {
      const newCart = prevCart.map(i =>
        i._id === item._id ? { ...i, size: newSize } : i
      );
      localStorage.setItem('guestCart', JSON.stringify(newCart));
      return newCart;
    });
  };



  const getMyListData = () => {
    fetchDataFromApi("/api/myList").then((res) => {
      if (res?.error === false) {
        setMyListData(res?.data)
      }
    })
  }

  // compare products 
  useEffect(() => {
    const savedCompare = localStorage.getItem('compareProducts');
    if (savedCompare) {
      try {
        setCompareData(JSON.parse(savedCompare));
      } catch (e) {
        console.error('Error parsing compare data:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (compareData.length > 0) {
      localStorage.setItem('compareProducts', JSON.stringify(compareData));
    } else {
      localStorage.removeItem('compareProducts');
    }
  }, [compareData]);

  const addToCompare = (product) => {
    const maxCompareItems = 4; // Limit to 4 products
    
    // check if already added
    const isAlreadyAdded = compareData.some(item => item._id === product._id);
    
    if (isAlreadyAdded) {
      alertBox("info", "Product is already in compare list");
      return;
    }

    if (compareData.length >= maxCompareItems) {
      alertBox("error", `You can compare maximum ${maxCompareItems} products`);
      return;
    }

    const productToAdd = {
      _id: product._id,
      name: product.name,
      images: product.images,
      price: product.price,
      oldPrice: product.oldPrice,
      rating: product.rating,
      brand: product.brand,
      discount: product.discount,
      description: product.description,
      size: product.size,
    };

    setCompareData([...compareData, productToAdd]);
    alertBox("success", "Product added to compare");
  };

  const removeFromCompare = (productId) => {
    setCompareData(compareData.filter(item => item._id !== productId));
    alertBox("success", "Product removed from compare");
  };

  const values = {
    openProductDetailsModal,
    setOpenProductDetailsModal,
    handleOpenProductDetailsModal,
    handleCloseProductDetailsModal,
    setOpenCartPanel,
    toggleCartPanel,
    openCartPanel,
    setOpenAddressPanel,
    toggleAddressPanel,
    openAddressPanel,
    isLogin,
    setIsLogin,
    alertBox,
    setUserData,
    userData,
    setCatData,
    catData,
    addToCart,
    cartData,
    setCartData,
    getCartItems,
    mergeGuestCart,
    removeCartItem,
    updateCartItemQty,
    updateCartItemSize,
    myListData,
    setMyListData,
    getMyListData,
    getUserDetails,
    compareData,
    setCompareData,
    addToCompare,
    removeFromCompare,
    setAddressMode,
    addressMode,
    addressId,
    setAddressId,
    setSearchData,
    searchData,
    windowWidth,
    setOpenFilter,
    openFilter,
    setisFilterBtnShow,
    isFilterBtnShow,
    setOpenSearchPanel,
    openSearchPanel
  };

  return (
    <>
      <BrowserRouter>
        <MyContext.Provider value={values}>
          <Header />
          <Routes>
            <Route path={"/"} exact={true} element={<Home />} />
            <Route
              path={"/products"}
              exact={true}
              element={<ProductListing />}
            />
            <Route
              path={"/product/:id"}
              exact={true}
              element={<ProductDetails />}
            />
            <Route path={"/login"} exact={true} element={<Login />} />
            <Route path={"/register"} exact={true} element={<Register />} />
            <Route path={"/cart"} exact={true} element={<CartPage />} />
            <Route path={"/verify"} exact={true} element={<Verify />} />
            <Route path={"/forgot-password"} exact={true} element={<ForgotPassword />} />
            <Route path={"/checkout"} exact={true} element={<Checkout />} />
            <Route path={"/my-account"} exact={true} element={<MyAccount />} />
            <Route path={"/my-list"} exact={true} element={<MyList />} />
            <Route path={"/my-orders"} exact={true} element={<Orders />} />
            <Route path={"/order/success"} exact={true} element={<OrderSuccess />} />
            <Route path={"/order/failed"} exact={true} element={<OrderFailed />} />
            <Route path={"/address"} exact={true} element={<Address />} />
            <Route path={"/search"} exact={true} element={<SearchPage />} />
            <Route path={"/compare"} exact={true} element={<Compare />} />
            <Route path={"/my-points"} exact={true} element={<Points />} />
          </Routes>
          <Footer />
        </MyContext.Provider>
      </BrowserRouter>





      <Toaster />


    </>
  );
}

export default App;

export { MyContext };
