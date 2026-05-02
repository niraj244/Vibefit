import React, { useState, useEffect } from 'react';
import { Button, TextField } from "@mui/material";
import { FaAngleDown } from "react-icons/fa6";
import Badge from "../../Components/Badge";
import SearchBox from '../../Components/SearchBox';
import { FaAngleUp } from "react-icons/fa6";
import { deleteData, editData, fetchDataFromApi } from '../../utils/api';
import Pagination from "@mui/material/Pagination";
import { formatPrice } from '../../utils/currency';

import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useContext } from 'react';
import { MdOutlineInventory2 } from "react-icons/md";

import { MyContext } from "../../App.jsx";

export const Orders = () => {

  const [isOpenOrderdProduct, setIsOpenOrderdProduct] = useState(null);
  const [orderStatus, setOrderStatus] = useState('');

  const [ordersData, setOrdersData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pageOrder, setPageOrder] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalOrdersData, setTotalOrdersData] = useState([]);
  const [pathaoInputs, setPathaoInputs] = useState({});
  const [pathaoSaving, setPathaoSaving] = useState({});
  const [packagingOrders, setPackagingOrders] = useState([]);
  const [showPackaging, setShowPackaging] = useState(true);
  const [returnSaving, setReturnSaving] = useState({});

  const context = useContext(MyContext);


  const isShowOrderdProduct = (index) => {
    if (isOpenOrderdProduct === index) {
      setIsOpenOrderdProduct(null);
    } else {
      setIsOpenOrderdProduct(index);
    }
  };


  const handleChange = (event, id) => {
    setOrderStatus(event.target.value);

    const obj = {
      id: id,
      order_status: event.target.value
    }

    editData(`/api/order/order-status/${id}`, obj).then((res) => {
      if (res?.data?.error === false) {
        context.alertBox("success", res?.data?.message);
      }
    })

  };


  useEffect(() => {
    context?.setProgress(50);
    fetchDataFromApi(`/api/order/order-list?page=${pageOrder}&limit=5`).then((res) => {
      if (res?.error === false) {
        setOrdersData(res?.data)
        context?.setProgress(100);
        const inputs = {};
        res?.data?.forEach(order => {
          inputs[order._id] = order.pathaoConsignmentId || '';
        });
        setPathaoInputs(prev => ({ ...prev, ...inputs }));
      }
    })
    fetchDataFromApi(`/api/order/order-list`).then((res) => {
      if (res?.error === false) {
        setTotalOrdersData(res)
      }
    })
    fetchDataFromApi(`/api/order/needs-packaging`).then((res) => {
      if (res?.error === false) setPackagingOrders(res?.data || []);
    })
  }, [orderStatus, pageOrder])


  useEffect(() => {

    // Filter orders based on search query
    if (searchQuery !== "") {
      const filteredOrders = totalOrdersData?.data?.filter((order) =>
        order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order?.userId?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order?.userId?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order?.createdAt.includes(searchQuery)
      );
      setOrdersData(filteredOrders)
    } else {
      fetchDataFromApi(`/api/order/order-list?page=${pageOrder}&limit=5`).then((res) => {
        if (res?.error === false) {
          setOrders(res)
          setOrdersData(res?.data)
          const inputs = {};
          res?.data?.forEach(order => {
            inputs[order._id] = order.pathaoConsignmentId || '';
          });
          setPathaoInputs(prev => ({ ...prev, ...inputs }));
        }
      })
    }

  }, [searchQuery])


  const deleteOrder = (id) => {
    if (context?.userData?.role === "ADMIN") {
      deleteData(`/api/order/deleteOrder/${id}`).then((res) => {
        fetchDataFromApi(`/api/order/order-list?page=${pageOrder}&limit=5`).then((res) => {
          if (res?.error === false) {
            setOrdersData(res?.data)
            context?.setProgress(100);
            context.alertBox("success", "Order Delete successfully!");
          }
        })

        fetchDataFromApi(`/api/order/order-list`).then((res) => {
          if (res?.error === false) {
            setTotalOrdersData(res)
          }
        })

      })
    } else {
      context.alertBox("error", "Only admin can delete data");
    }
  }

  const saveReturnStatus = (orderId, returnStatus) => {
    setReturnSaving(prev => ({ ...prev, [orderId]: true }));
    editData(`/api/order/${orderId}/return-status`, { returnStatus }).then((res) => {
      setReturnSaving(prev => ({ ...prev, [orderId]: false }));
      if (res?.data?.error === false || res?.error === false) {
        context.alertBox("success", "Return status updated!");
        setOrdersData(prev => prev.map(o => o._id === orderId ? { ...o, returnStatus } : o));
      } else {
        context.alertBox("error", "Failed to update return status");
      }
    });
  };

  const savePathaoId = (orderId) => {
    setPathaoSaving(prev => ({ ...prev, [orderId]: true }));
    editData(`/api/order/pathao-consignment/${orderId}`, {
      pathaoConsignmentId: pathaoInputs[orderId] || ''
    }).then((res) => {
      setPathaoSaving(prev => ({ ...prev, [orderId]: false }));
      if (res?.data?.error === false || res?.error === false) {
        context.alertBox("success", "Pathao Consignment ID saved!");
      } else {
        context.alertBox("error", "Failed to save Pathao Consignment ID");
      }
    }).catch(() => {
      setPathaoSaving(prev => ({ ...prev, [orderId]: false }));
      context.alertBox("error", "Failed to save Pathao Consignment ID");
    });
  };


  return (
    <div className="card my-2 md:mt-4 shadow-md sm:rounded-lg bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 px-5 py-5 flex-col sm:flex-row">
        <h2 className="text-[18px] font-[600] text-left mb-2 lg:mb-0">Recent Orders</h2>
        <div className="ml-auto w-full">
          <SearchBox
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setPageOrder={setPageOrder}
          />
        </div>
      </div>

      {/* Packages to Prepare Section */}
      {packagingOrders.length > 0 && (
        <div className="mx-5 mb-4 rounded-lg border border-orange-200 bg-orange-50 overflow-hidden">
          <div
            className="flex items-center justify-between px-4 py-3 cursor-pointer"
            onClick={() => setShowPackaging(v => !v)}
          >
            <div className="flex items-center gap-2">
              <MdOutlineInventory2 className="text-orange-500 text-[20px]" />
              <span className="font-[600] text-[14px] text-orange-700">
                Packages to Prepare for Pathao ({packagingOrders.length})
              </span>
              <span className="text-[11px] text-orange-500">— confirmed orders without a Pathao tracking ID</span>
            </div>
            {showPackaging ? <FaAngleUp className="text-orange-500" /> : <FaAngleDown className="text-orange-500" />}
          </div>

          {showPackaging && (
            <div className="overflow-x-auto border-t border-orange-200">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs uppercase bg-orange-100 text-orange-700">
                  <tr>
                    <th className="px-4 py-2 whitespace-nowrap">Order ID</th>
                    <th className="px-4 py-2 whitespace-nowrap">Customer</th>
                    <th className="px-4 py-2 whitespace-nowrap">Address</th>
                    <th className="px-4 py-2 whitespace-nowrap">Payment</th>
                    <th className="px-4 py-2 whitespace-nowrap">Total</th>
                    <th className="px-4 py-2 whitespace-nowrap">Status</th>
                    <th className="px-4 py-2 whitespace-nowrap">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {packagingOrders.map((o) => (
                    <tr key={o._id} className="border-t border-orange-100 bg-white hover:bg-orange-50 transition-all">
                      <td className="px-4 py-2 font-mono text-[12px] text-primary">{o._id}</td>
                      <td className="px-4 py-2 whitespace-nowrap font-[500]">{o?.userId?.name}</td>
                      <td className="px-4 py-2 text-[12px] max-w-[220px]">
                        {[o?.delivery_address?.address_line1, o?.delivery_address?.city, o?.delivery_address?.state].filter(Boolean).join(', ')}
                      </td>
                      <td className="px-4 py-2 text-[12px]">{o?.paymentId ? 'Paid' : 'COD'}</td>
                      <td className="px-4 py-2 whitespace-nowrap font-[500]">{formatPrice(o?.totalAmt)}</td>
                      <td className="px-4 py-2"><Badge status={o?.order_status} /></td>
                      <td className="px-4 py-2 whitespace-nowrap text-[12px]">{o?.createdAt?.split('T')[0]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                &nbsp;
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Order Id
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Payment Id
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Name
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Phone Number
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Address
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Pincode
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Total Amount
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Email
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                User Id
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Order Status
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Date
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>
          <tbody>

            {
              ordersData?.length !== 0 && ordersData?.map((order, index) => {
                return (
                  <>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="px-6 py-4 font-[500]">
                        <Button
                          className="!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-[#f1f1f1]"
                          onClick={() => isShowOrderdProduct(index)}
                        >
                          {
                            isOpenOrderdProduct === index ? <FaAngleUp className="text-[16px] text-[rgba(0,0,0,0.7)]" /> : <FaAngleDown className="text-[16px] text-[rgba(0,0,0,0.7)]" />
                          }

                        </Button>
                      </td>
                      <td className="px-6 py-4 font-[500]">
                        <span className="text-primary">
                          {order?._id}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-[500]">
                        <span className="text-primary whitespace-nowrap text-[13px]">{order?.paymentId ? order?.paymentId : 'CASH ON DELIVERY'}</span>
                      </td>

                      <td className="px-6 py-4 font-[500] whitespace-nowrap">
                        {order?.userId?.name}
                      </td>

                      <td className="px-6 py-4 font-[500]">{order?.delivery_address?.mobile}</td>

                      <td className="px-6 py-4 font-[500]">
                        <span className='inline-block text-[13px] font-[500] p-1 bg-[#f1f1f1] rounded-md'>{order?.delivery_address?.addressType}</span>
                        <span className="block w-[400px]">
                          {order?.delivery_address?.
                            address_line1 + " " +
                            order?.delivery_address?.city + " " +
                            order?.delivery_address?.landmark + " " +
                            order?.delivery_address?.state + " " +
                            order?.delivery_address?.country
                          }
                        </span>
                      </td>

                      <td className="px-6 py-4 font-[500]">{order?.delivery_address?.pincode}</td>

                      <td className="px-6 py-4 font-[500]">{order?.totalAmt}</td>

                      <td className="px-6 py-4 font-[500]">
                        {order?.userId?.email?.substr(0,5)+'***'}
                      </td>

                      <td className="px-6 py-4 font-[500]">
                        <span className="text-primary">
                          {order?.userId?._id}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-[500]">
                        <Select
                          labelId="demo-simple-select-helper-label"
                          id="demo-simple-select-helper"
                          value={order?.order_status !== null ? order?.order_status : orderStatus}
                          label="Status"
                          size="small"
                          style={{ zoom: '80%' }}
                          className="w-full"
                          onChange={(e) => handleChange(e, order?._id)}
                        >
                          <MenuItem value={'pending'}>Pending</MenuItem>
                          <MenuItem value={'confirm'}>Confirm</MenuItem>
                          <MenuItem value={'delivered'}>Delivered</MenuItem>
                        </Select>
                      </td>
                      <td className="px-6 py-4 font-[500] whitespace-nowrap">
                        {order?.createdAt?.split("T")[0]}
                        {order?.returnRequested && (
                          <span className="block mt-1 text-[10px] font-[600] text-red-600 bg-red-100 px-2 py-0.5 rounded-full w-fit">
                            Return Requested
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-[500] whitespace-nowrap">
                        <Button onClick={() => deleteOrder(order?._id)} variant="outlined" color="error" size="small">Delete</Button>
                      </td>
                    </tr>

                    {isOpenOrderdProduct === index && (
                      <tr>
                        <td className="pl-20" colSpan="13">
                          {/* Return Request Panel */}
                          {order?.returnRequested && (
                            <div className="flex items-start gap-4 my-4 p-4 bg-red-50 rounded-lg border border-red-200 flex-wrap">
                              <div className="flex-1 min-w-[200px]">
                                <p className="text-[13px] font-[600] text-red-700 mb-1">🔄 Return Request</p>
                                <p className="text-[12px] text-gray-600"><span className="font-[500]">Reason:</span> {order?.returnReason || '—'}</p>
                                {order?.returnNote && <p className="text-[12px] text-gray-600"><span className="font-[500]">Note:</span> {order.returnNote}</p>}
                                <p className="text-[12px] text-gray-500 mt-1">Requested: {order?.returnRequestedAt ? new Date(order.returnRequestedAt).toLocaleString() : '—'}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[12px] font-[500] text-gray-600">Status:</span>
                                <Select
                                  size="small"
                                  value={order?.returnStatus || 'pending'}
                                  style={{ zoom: '80%', minWidth: 130 }}
                                  disabled={returnSaving[order._id]}
                                  onChange={(e) => saveReturnStatus(order._id, e.target.value)}
                                >
                                  <MenuItem value="pending">Pending</MenuItem>
                                  <MenuItem value="approved">Approved</MenuItem>
                                  <MenuItem value="rejected">Rejected</MenuItem>
                                  <MenuItem value="completed">Completed</MenuItem>
                                </Select>
                              </div>
                            </div>
                          )}

                          {/* Pathao Consignment ID Input */}
                          <div className="flex items-center gap-3 my-4 p-4 bg-[#f9f9f9] rounded-lg border border-[rgba(0,0,0,0.08)]">
                            <span className="text-[13px] font-[600] whitespace-nowrap text-gray-700">
                              🚚 Pathao Nepal Consignment ID:
                            </span>
                            <TextField
                              size="small"
                              placeholder="e.g. DS0407254C48WT"
                              value={pathaoInputs[order._id] || ''}
                              onChange={(e) => setPathaoInputs(prev => ({ ...prev, [order._id]: e.target.value }))}
                              className="!w-[260px]"
                              inputProps={{ style: { fontFamily: 'monospace', fontSize: '13px' } }}
                            />
                            <Button
                              variant="contained"
                              size="small"
                              className="!bg-primary !text-white !capitalize"
                              disabled={pathaoSaving[order._id]}
                              onClick={() => savePathaoId(order._id)}
                            >
                              {pathaoSaving[order._id] ? 'Saving...' : 'Save'}
                            </Button>
                            {order?.pathaoConsignmentId && (
                              <span className="text-[12px] text-green-600 font-[500]">
                                ✓ Currently saved: <span className="font-mono">{order.pathaoConsignmentId}</span>
                              </span>
                            )}
                          </div>

                          <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                  <th scope="col" className="px-6 py-3 whitespace-nowrap">
                                    Product Id
                                  </th>
                                  <th scope="col" className="px-6 py-3 whitespace-nowrap">
                                    Product Title
                                  </th>
                                  <th scope="col" className="px-6 py-3 whitespace-nowrap">
                                    Image
                                  </th>
                                  <th scope="col" className="px-6 py-3 whitespace-nowrap">
                                    Quantity
                                  </th>
                                  <th scope="col" className="px-6 py-3 whitespace-nowrap">
                                    Price
                                  </th>
                                  <th scope="col" className="px-6 py-3 whitespace-nowrap">
                                    Sub Total
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {
                                  order?.products?.map((item, index) => {
                                    return (
                                      <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td className="px-6 py-4 font-[500]">
                                          <span className="text-gray-600">
                                            {item?._id}
                                          </span>
                                        </td>
                                        <td className="px-6 py-4 font-[500]">
                                          <div className="w-[200px]">
                                            {item?.productTitle}
                                          </div>
                                        </td>

                                        <td className="px-6 py-4 font-[500]">
                                          <img
                                            src={item?.image}
                                            className="w-[40px] h-[40px] object-cover rounded-md"
                                          />
                                        </td>

                                        <td className="px-6 py-4 font-[500] whitespace-nowrap">
                                          {item?.quantity}
                                        </td>

                                        <td className="px-6 py-4 font-[500]">{formatPrice(item?.price)}</td>

                                        <td className="px-6 py-4 font-[500]">{formatPrice(item?.price * item?.quantity)}</td>
                                      </tr>
                                    )
                                  })
                                }


                                <tr>
                                  <td className="bg-[#f1f1f1]" colSpan="12"></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })

            }


          </tbody>
        </table>
      </div>


      {
        orders?.totalPages > 1 &&
        <div className="flex items-center justify-center mt-10 pb-5">
          <Pagination
            showFirstButton showLastButton
            count={orders?.totalPages}
            page={pageOrder}
            onChange={(e, value) => setPageOrder(value)}
          />
        </div>
      }
    </div>
  )
}


export default Orders;
