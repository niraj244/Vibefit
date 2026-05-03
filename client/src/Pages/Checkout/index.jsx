import React, { useContext, useEffect, useState } from "react";
import { Button } from "@mui/material";
import { BsFillBagCheckFill } from "react-icons/bs";
import { MyContext } from '../../App';
import { FaPlus } from "react-icons/fa6";
import Radio from '@mui/material/Radio';
import { deleteData, fetchDataFromApi, postData } from "../../utils/api";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import CircularProgress from '@mui/material/CircularProgress';
import { formatPrice } from "../../utils/currency";

const VITE_APP_PAYPAL_CLIENT_ID = import.meta.env.VITE_APP_PAYPAL_CLIENT_ID;
const VITE_APP_ESEWA_MERCHANT_ID = import.meta.env.VITE_APP_ESEWA_MERCHANT_ID;
const VITE_API_URL = import.meta.env.VITE_API_URL;

const Checkout = () => {

  const [userData, setUserData] = useState(null);
  const [isChecked, setIsChecked] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [totalAmount, setTotalAmount] = useState();
  const [isLoading, setIsloading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("esewa"); // paypal, esewa, cod
  const context = useContext(MyContext);

  const history = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      context.alertBox("info", "Please login to continue to checkout");
      history("/login", { state: { from: "/checkout" } });
    }
  }, []);

  useEffect(() => {
    if (context.isLogin) {
      window.scrollTo(0, 0);
      setUserData(context?.userData);
      setSelectedAddress(context?.userData?.address_details[0]?._id);
    }
  }, [context?.userData, context.isLogin])


  useEffect(() => {
    setTotalAmount(
      context.cartData?.length !== 0 ?
        context.cartData?.map(item => parseInt(item.price) * item.quantity)
          .reduce((total, value) => total + value, 0) : 0
    );

    // localStorage.setItem("totalAmount", context.cartData?.length !== 0 ?
    //   context.cartData?.map(item => parseInt(item.price) * item.quantity)
    //     .reduce((total, value) => total + value, 0) : 0)
    //   ?.toLocaleString('en-US', { style: 'currency', currency: 'INR' })

  }, [context.cartData])





  // Load PayPal SDK and render buttons
  useEffect(() => {
    // Only load PayPal SDK if PayPal is selected and we have a client ID
    if (selectedPaymentMethod !== 'paypal' || !VITE_APP_PAYPAL_CLIENT_ID) {
      const container = document.getElementById("paypal-button-container");
      if (container) {
        container.innerHTML = "";
      }
      return;
    }

    // Wait a bit for the container to be available in DOM
    const timeoutId = setTimeout(() => {
      const container = document.getElementById("paypal-button-container");
      if (!container) {
        console.error("PayPal container not found in DOM");
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector(`script[src*="paypal.com/sdk"]`);
      if (existingScript && window.paypal) {
        // Script already loaded, just render buttons
        renderPayPalButtons();
        return;
      }

      // Load the PayPal JavaScript SDK
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${VITE_APP_PAYPAL_CLIENT_ID}&disable-funding=card`;
      script.async = true;
      script.onload = () => {
        // Wait a bit more to ensure PayPal is fully initialized
        setTimeout(() => {
          renderPayPalButtons();
        }, 100);
      };
      script.onerror = () => {
        console.error("Failed to load PayPal SDK");
        const container = document.getElementById("paypal-button-container");
        if (container) {
          container.innerHTML = "<p className='text-red-500 text-sm text-center p-3'>Failed to load PayPal SDK. Please check your internet connection and try again.</p>";
        }
        context.alertBox("error", "Failed to load PayPal. Please check your PayPal Client ID.");
      };
      
      document.body.appendChild(script);
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      // Don't remove script on cleanup, just clear the container
      const container = document.getElementById("paypal-button-container");
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [selectedPaymentMethod, totalAmount, context?.cartData, context?.userData, selectedAddress, userData]);

  const renderPayPalButtons = () => {
    const container = document.getElementById("paypal-button-container");
    if (!container) {
      console.error("PayPal container not found");
      return;
    }

    // Clear container first
    container.innerHTML = "";

    // Check if PayPal SDK is loaded
    if (!window.paypal) {
      console.error("PayPal SDK not loaded");
      container.innerHTML = "<p className='text-orange-500 text-sm text-center p-3'>Loading PayPal...</p>";
      // Retry after a short delay
      setTimeout(() => {
        if (window.paypal) {
          renderPayPalButtons();
        } else {
          container.innerHTML = "<p className='text-red-500 text-sm text-center p-3'>PayPal SDK failed to load. Please refresh the page.</p>";
        }
      }, 500);
      return;
    }

    // Check if address is selected
    if (userData?.address_details?.length === 0) {
      container.innerHTML = "<p className='text-orange-500 text-sm text-center p-3'>Please add a delivery address first</p>";
      return;
    }

    // Validate totalAmount before rendering
    if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
      container.innerHTML = "<p className='text-red-500 text-sm text-center p-3'>Invalid order amount. Please add items to cart.</p>";
      return;
    }

    try {
      window.paypal
        .Buttons({
          createOrder: async () => {
            // Validate totalAmount (in NPR)
            if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
              console.error("Invalid totalAmount:", totalAmount);
              throw new Error("Invalid order amount. Please refresh and try again.");
            }

            // Convert NPR to USD for PayPal (PayPal doesn't support NPR)
            // Using approximate rate: 1 USD ≈ 133 NPR (update this rate as needed)
            const nprToUsdRate = 133; // Update this rate based on current exchange rate
            const usdAmount = (parseFloat(totalAmount) / nprToUsdRate).toFixed(2);

            // Validate converted amount
            if (!usdAmount || isNaN(usdAmount) || parseFloat(usdAmount) <= 0) {
              throw new Error("Invalid order amount. Please try again.");
            }

            const headers = {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json',
            }

            // Send both NPR and USD amounts - backend will use USD for PayPal, store NPR
            const data = {
              userId: context?.userData?._id,
              totalAmount: usdAmount, // USD for PayPal processing
              nprAmount: parseFloat(totalAmount).toFixed(2) // Original NPR amount
            }

            if (!data.userId) {
              throw new Error("User not logged in. Please login and try again.");
            }

            console.log("Creating PayPal order - NPR:", data.nprAmount, "USD:", data.totalAmount);

            try {
              const response = await axios.get(
                VITE_API_URL + `/api/order/create-order-paypal?userId=${data?.userId}&totalAmount=${data?.totalAmount}&nprAmount=${data.nprAmount}`, 
                { headers }
              );

              if (!response?.data?.id) {
                console.error("PayPal order creation failed - no order ID:", response.data);
                throw new Error(response.data?.message || "Failed to create PayPal order");
              }

              return response.data.id; // Return order ID to PayPal
            } catch (error) {
              console.error("========== FRONTEND PAYPAL ERROR ==========");
              console.error("Error creating PayPal order:", error);
              console.error("Error response:", error.response?.data);
              console.error("Error message:", error.response?.data?.message || error.message);
              console.error("==========================================");
              
              if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
              }
              throw new Error(error.message || "Failed to create PayPal order. Please check your PayPal credentials in server/.env file.");
            }
          },
          onApprove: async (data) => {
            onApprovePayment(data);
          },
          onError: (err) => {
            console.error("PayPal Checkout onError:", err);
            context.alertBox("error", "PayPal payment failed. Please try again.");
            history("/order/failed");
          },
          onCancel: () => {
            console.log("PayPal payment cancelled");
          }
        })
        .render("#paypal-button-container")
        .catch((err) => {
          console.error("Error rendering PayPal buttons:", err);
          console.error("Error details:", err.message, err.stack);
          container.innerHTML = "<p className='text-red-500 text-sm text-center p-3'>Error loading PayPal. Please check the console for details and refresh the page.</p>";
        });
    } catch (error) {
      console.error("Error in renderPayPalButtons:", error);
      container.innerHTML = "<p className='text-red-500 text-sm text-center p-3'>Error initializing PayPal. Please refresh the page.</p>";
    }
  };




  const onApprovePayment = async (data) => {
    const user = context?.userData;

    const info = {
      userId: user?._id,
      products: context?.cartData,
      payment_status: "COMPLETE",
      delivery_address: selectedAddress,
      totalAmount: totalAmount, // This is in NPR
      nprAmount: totalAmount, // Explicitly store NPR amount
      date: new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    };


    // Capture order on the server

    const headers = {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
      'Content-Type': 'application/json', // Adjust the content type as needed
    }

    try {
      const response = await axios.post(
        VITE_API_URL + "/api/order/capture-order-paypal",
        {
          ...info,
          paymentId: data.orderID
        }, { headers }
      );

      if (response.data.success) {
        context.alertBox("success", response.data.message || "Order completed and saved to database!");
        history("/order/success");
        deleteData(`/api/cart/emptyCart/${context?.userData?._id}`).then((res) => {
          context?.getCartItems();
        });
      } else {
        context.alertBox("error", response.data.message || "Payment failed");
        history("/order/failed");
      }
    } catch (error) {
      console.error("PayPal payment error:", error);
      context.alertBox("error", "Payment processing failed");
      history("/order/failed");
    }

  }


  const editAddress = (id) => {
    context?.setOpenAddressPanel(true);
    context?.setAddressMode("edit");
    context?.setAddressId(id);
  }


  const handleChange = (e, index) => {
    if (e.target.checked) {
      setIsChecked(index);
      setSelectedAddress(e.target.value)
    }
  }

  const handleEsewaPayment = async () => {
    if (totalAmount < 1000) {
      context.alertBox("error", "Minimum order amount is Rs. 1,000");
      return;
    }
    if (userData?.address_details?.length === 0) {
      context.alertBox("error", "Please add address");
      return;
    }

    setIsloading(true);

    const headers = {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json',
    }

    const payload = {
      userId: context?.userData?._id,
      products: context?.cartData,
      totalAmount: totalAmount,
      delivery_address: selectedAddress,
      date: new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    };

    try {
      const response = await axios.post(
        VITE_API_URL + "/api/order/initiate-esewa-payment",
        payload,
        { headers }
      );

      if (response.data.success && response.data.formData) {
        // Create a form and submit it to eSewa
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = response.data.paymentUrl;

        // Add all form fields
        Object.keys(response.data.formData).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = response.data.formData[key];
          form.appendChild(input);
        });

        // Append form to body and submit
        document.body.appendChild(form);
        form.submit();
        setIsloading(false);
      } else {
        context.alertBox("error", response.data.message || "Failed to initiate eSewa payment");
        setIsloading(false);
      }
    } catch (error) {
      console.error("eSewa payment error:", error);
      context.alertBox("error", "Failed to initiate eSewa payment");
      setIsloading(false);
    }
  }



  const cashOnDelivery = () => {
    if (totalAmount < 1000) {
      context.alertBox("error", "Minimum order amount is Rs. 1,000");
      return;
    }

    const user = context?.userData
    setIsloading(true);

    if (userData?.address_details?.length !== 0) {
      const payLoad = {
        userId: user?._id,
        products: context?.cartData,
        paymentId: '',
        payment_status: "CASH ON DELIVERY",
        delivery_address: selectedAddress,
        totalAmt: totalAmount,
        date: new Date().toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
      };


      postData(`/api/order/create`, payLoad).then((res) => {
        if (res?.error === false) {
          context.alertBox("success", res?.message);
          deleteData(`/api/cart/emptyCart/${user?._id}`).then(() => {
            context?.getCartItems();
          });
          setIsloading(false);
          history("/order/success");
        } else {
          context.alertBox("error", res?.message || "Failed to place order");
          setIsloading(false);
        }
      });
    } else {
      context.alertBox("error", "Please add address");
      setIsloading(false);
    }



  }

  return (
    <section className="py-3 lg:py-10 px-3">
      <div className="w-full lg:w-[70%] m-auto flex flex-col md:flex-row gap-5">
          <div className="leftCol w-full md:w-[60%]">
            <div className="card bg-white shadow-md p-5 rounded-md w-full">
              <div className="flex items-center justify-between">
                <h2>Select Delivery Address</h2>
                {
                  userData?.address_details?.length !== 0 &&
                  <Button variant="outlined"
                    onClick={() => {
                      context?.setOpenAddressPanel(true);
                      context?.setAddressMode("add");
                    }} className="btn">
                    <FaPlus />
                    ADD {context?.windowWidth< 767 ? '' : 'NEW ADDRESS'}
                  </Button>
                }

              </div>

              <br />

              <div className="flex flex-col gap-4">


                {
                  userData?.address_details?.length !== 0 ? userData?.address_details?.map((address, index) => {

                    return (
                      <label className={`flex gap-3 p-4 border border-[rgba(0,0,0,0.1)] rounded-md relative ${isChecked === index && 'bg-[#fff2f2]'}`} key={index}>
                        <div>
                          <Radio size="small" onChange={(e) => handleChange(e, index)}
                            checked={isChecked === index} value={address?._id} />
                        </div>
                        <div className="info">
                          <span className="inline-block text-[13px] font-[500] p-1 bg-[#f1f1f1] rounded-md">{address?.addressType}</span>
                          <h3>{userData?.name}</h3>
                          <p className="mt-0 mb-0">
                            {address?.address_line1 + " " + address?.city + " " + address?.country + " " + address?.state + " " + address?.landmark + ' ' + '+ ' + address?.mobile}
                          </p>

   
                          <p className="mb-0 font-[500]">{userData?.mobile !== null ? '+'+userData?.mobile : '+'+address?.mobile}</p>
                        </div>

                        <Button variant="text" className="!absolute top-[15px] right-[15px]" size="small"
                          onClick={() => editAddress(address?._id)}
                        >EDIT</Button>

                      </label>
                    )
                  })

                    :


                    <>
                      <div className="flex items-center mt-5 justify-between flex-col p-5">
                        <img src="/map.png" width="100" />
                        <h2 className="text-center">No Addresses found in your account!</h2>
                        <p className="mt-0">Add a delivery address.</p>
                        <Button className="btn-org" 
                        onClick={() => {
                          context?.setOpenAddressPanel(true);
                          context?.setAddressMode("add");
                        }}>ADD ADDRESS</Button>
                      </div>
                    </>

                }

              </div>


            </div>
          </div>

          <div className="rightCol w-full  md:w-[40%]">
            <div className="card shadow-md bg-white p-5 rounded-md">
              <h2 className="mb-4">Your Order</h2>

              <div className="flex items-center justify-between py-3 border-t border-b border-[rgba(0,0,0,0.1)]">
                <span className="text-[14px] font-[600]">Product</span>
                <span className="text-[14px] font-[600]">Subtotal</span>
              </div>

              <div className="mb-5 scroll max-h-[250px] overflow-y-scroll overflow-x-hidden pr-2">

                {
                  context?.cartData?.length !== 0 && context?.cartData?.map((item, index) => {
                    return (
                      <div className="flex items-center justify-between py-2" key={index}>
                        <div className="part1 flex items-center gap-3">
                          <div className="img w-[50px] h-[50px] object-cover overflow-hidden rounded-md group cursor-pointer">
                            <img
                              src={item?.image}
                              className="w-full transition-all group-hover:scale-105"
                            />
                          </div>

                          <div className="info">
                            <h4 className="text-[14px]" title={item?.productTitle}>{item?.productTitle?.substr(0, 20) + '...'} </h4>
                            <span className="text-[13px]">Qty : {item?.quantity}</span>
                          </div>
                        </div>

                        <span className="text-[14px] font-[500]">{formatPrice(item?.quantity * item?.price)}</span>
                      </div>
                    )
                  })
                }



              </div>

              <div className="mb-4">
                <h3 className="text-[16px] font-[600] mb-3">Select Payment Method</h3>
                <div className="flex flex-col gap-3">
                  {/* PayPal option — hidden for now, uncomment to re-enable
                  <label className={`flex items-center gap-3 p-3 border-2 rounded-md cursor-pointer ${selectedPaymentMethod === 'paypal' ? 'border-[#FFA239] bg-[#fff8f0]' : 'border-[rgba(0,0,0,0.1)]'}`}>
                    <Radio
                      checked={selectedPaymentMethod === 'paypal'}
                      onChange={() => setSelectedPaymentMethod('paypal')}
                      value="paypal"
                    />
                    <div className="flex-1">
                      <span className="text-[14px] font-[600]">PayPal</span>
                      <p className="text-[12px] text-gray-500 mt-1">Pay securely with PayPal</p>
                    </div>
                  </label>
                  */}
                  <label className={`flex items-center gap-3 p-3 border-2 rounded-md cursor-pointer ${selectedPaymentMethod === 'esewa' ? 'border-[#FFA239] bg-[#fff8f0]' : 'border-[rgba(0,0,0,0.1)]'}`}>
                    <Radio
                      checked={selectedPaymentMethod === 'esewa'}
                      onChange={() => setSelectedPaymentMethod('esewa')}
                      value="esewa"
                    />
                    <div className="flex-1">
                      <span className="text-[14px] font-[600]">eSewa</span>
                      <p className="text-[12px] text-gray-500 mt-1">Pay with eSewa wallet</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-3 border-2 rounded-md cursor-pointer ${selectedPaymentMethod === 'cod' ? 'border-[#FFA239] bg-[#fff8f0]' : 'border-[rgba(0,0,0,0.1)]'}`}>
                    <Radio
                      checked={selectedPaymentMethod === 'cod'}
                      onChange={() => setSelectedPaymentMethod('cod')}
                      value="cod"
                    />
                    <div className="flex-1">
                      <span className="text-[14px] font-[600]">Cash on Delivery</span>
                      <p className="text-[12px] text-gray-500 mt-1">Pay when you receive</p>
                    </div>
                  </label>
                </div>
              </div>

              {totalAmount < 1000 && (
                <p className="text-red-500 text-[13px] text-center bg-red-50 border border-red-200 rounded-md p-2 mb-2">
                  Minimum order amount is <strong>Rs. 1,000</strong>. Add more items to proceed.
                </p>
              )}

              <div className="flex items-center flex-col gap-3 mb-2">
                {/* PayPal button — hidden for now, uncomment to re-enable
                {selectedPaymentMethod === 'paypal' && (
                  <div id="paypal-button-container" className="w-full min-h-[50px]">
                    {!VITE_APP_PAYPAL_CLIENT_ID && (
                      <p className="text-red-500 text-sm text-center p-3">
                        PayPal Client ID not configured. Please add VITE_APP_PAYPAL_CLIENT_ID to your .env file.
                      </p>
                    )}
                    {VITE_APP_PAYPAL_CLIENT_ID && userData?.address_details?.length === 0 && (
                      <p className="text-orange-500 text-sm text-center p-3">
                        Please add a delivery address first
                      </p>
                    )}
                  </div>
                )}
                */}

                {selectedPaymentMethod === 'esewa' && (
                  <Button 
                    type="button" 
                    className="btn-org btn-lg w-full flex gap-2 items-center" 
                    onClick={handleEsewaPayment}
                    disabled={userData?.address_details?.length === 0 || isLoading || totalAmount < 1000}
                  >
                    {isLoading ? <CircularProgress size={20} /> : (
                      <>
                        <BsFillBagCheckFill className="text-[20px]" />
                        Pay with eSewa
                      </>
                    )}
                  </Button>
                )}

                {selectedPaymentMethod === 'cod' && (
                  <Button 
                    type="button" 
                    className="btn-dark btn-lg w-full flex gap-2 items-center" 
                    onClick={cashOnDelivery}
                    disabled={userData?.address_details?.length === 0 || isLoading || totalAmount < 1000}
                  >
                    {isLoading ? <CircularProgress size={20} /> : (
                      <>
                        <BsFillBagCheckFill className="text-[20px]" />
                        Place Order (Cash on Delivery)
                      </>
                    )}
                  </Button>
                )}
              </div>

            </div>
          </div>
        </div>
    </section>
  );
};

export default Checkout;
