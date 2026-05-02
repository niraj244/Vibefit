import React, { useEffect, useState } from "react";
import AccountSidebar from "../../components/AccountSidebar";
import { Button } from "@mui/material";
import { FaAngleDown } from "react-icons/fa6";
import Badge from "../../components/Badge";
import { FaAngleUp } from "react-icons/fa6";
import { fetchDataFromApi } from "../../utils/api";
import Pagination from "@mui/material/Pagination";
import { formatPrice } from "../../utils/currency";
import { Link } from "react-router-dom";
import { MdContentCopy } from "react-icons/md";
import CircularProgress from "@mui/material/CircularProgress";
import { postData } from "../../utils/api";

const formatDateTime = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  const date = d.toLocaleDateString('en-CA'); // YYYY-MM-DD
  const time = d.toLocaleTimeString('en-GB'); // HH:MM:SS
  return `${date} ${time}`;
};

const RETURN_REASONS = [
  'Wrong item received',
  'Damaged item',
  'Item not as described',
  'Changed my mind',
  'Other',
];

const PathaoTrackingCard = ({ consignmentId, orderId, orderStatus, returnRequested, returnStatus: initReturnStatus }) => {
  const [copied, setCopied] = useState(false);
  const [tracking, setTracking] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState(null);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnNote, setReturnNote] = useState('');
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnDone, setReturnDone] = useState(!!returnRequested);
  const [returnStatus, setReturnStatus] = useState(initReturnStatus || 'none');

  const fetchTracking = () => {
    if (!consignmentId || !orderId) return;
    setTrackingLoading(true);
    setTrackingError(null);
    fetchDataFromApi(`/api/order/${orderId}/pathao-tracking`).then((res) => {
      setTrackingLoading(false);
      if (res?.success) setTracking(res);
      else setTrackingError(res?.message || 'Live tracking temporarily unavailable.');
    }).catch(() => {
      setTrackingLoading(false);
      setTrackingError('Live tracking temporarily unavailable.');
    });
  };

  useEffect(() => { if (consignmentId && orderId) fetchTracking(); }, [consignmentId, orderId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(consignmentId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const submitReturn = () => {
    if (!returnReason) return;
    setReturnSubmitting(true);
    postData(`/api/order/${orderId}/return-request`, { returnReason, returnNote }).then((res) => {
      setReturnSubmitting(false);
      if (res?.success) { setReturnDone(true); setReturnStatus('pending'); setShowReturnForm(false); }
    });
  };

  if (!consignmentId) return (
    <div className="mt-4 mb-2 p-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-[13px] text-gray-500 text-center">
      Tracking ID will be available after your parcel is handed over to Pathao Nepal.
    </div>
  );

  const isEligibleForReturn = orderStatus === 'delivered' && !returnDone && !showReturnForm;
  const returnStatusLabel = {
    pending: 'Return request pending. Our team will review it and contact you soon.',
    approved: '✓ Return approved. Our team will be in touch.',
    rejected: 'Return request was not approved. Please contact us for more info.',
    completed: '✓ Return completed.',
  }[returnStatus];

  return (
    <div className="mt-4 mb-2 rounded-xl border border-[rgba(0,0,0,0.1)] bg-[#f0faf4] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-[#1a8c4e] text-white">
        <span>🚚</span>
        <span className="font-[600] text-[14px]">Track your Pathao Nepal delivery</span>
      </div>

      <div className="px-4 py-4">
        <p className="text-[13px] text-gray-600 mb-3">Your parcel has been sent through Pathao Nepal.</p>

        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-[13px] text-gray-500 font-[500]">Tracking ID:</span>
          <span className="font-mono font-[700] text-[15px] text-[#1a8c4e] bg-white px-3 py-1 rounded-md border border-[#c3e6cb]">
            {consignmentId}
          </span>
        </div>

        <p className="text-[12px] text-gray-500 mb-4">
          Live tracking status is shown below when available. You can also copy this Tracking ID for support.
        </p>

        {/* Live Status */}
        {trackingLoading && (
          <div className="flex items-center gap-2 text-[13px] text-gray-500 mb-3">
            <CircularProgress size={14} /> Fetching live status...
          </div>
        )}

        {!trackingLoading && tracking?.success && (
          <div className="bg-white rounded-lg border border-[#c3e6cb] p-3 mb-4">
            {tracking.status && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] text-gray-500 font-[500]">Current Status:</span>
                <span className="text-[13px] font-[600] text-[#1a8c4e]">{tracking.status}</span>
              </div>
            )}
            {tracking.lastUpdated && (
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-gray-500 font-[500]">Last Updated:</span>
                <span className="text-[12px] text-gray-600">{new Date(tracking.lastUpdated).toLocaleString()}</span>
              </div>
            )}
            {tracking.history?.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-[11px] font-[600] text-gray-500 uppercase tracking-wide mb-1">History</p>
                {tracking.history.map((h, i) => (
                  <div key={i} className="text-[12px] text-gray-600 border-l-2 border-[#1a8c4e] pl-2">
                    {h.status || h.message || JSON.stringify(h)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!trackingLoading && trackingError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-[12px] text-yellow-700">
            {trackingError} Please contact us with your Tracking ID for assistance.
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button size="small" variant="outlined"
            className="!border-[#1a8c4e] !text-[#1a8c4e] !capitalize !text-[12px] !font-[600]"
            startIcon={<MdContentCopy />} onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy Tracking ID'}
          </Button>
          <Button size="small" variant="outlined"
            className="!border-[#1a8c4e] !text-[#1a8c4e] !capitalize !text-[12px] !font-[600]"
            onClick={fetchTracking} disabled={trackingLoading}>
            {trackingLoading ? 'Refreshing...' : 'Refresh Status'}
          </Button>
        </div>

        {/* Return Request */}
        {isEligibleForReturn && (
          <div className="mt-4 pt-4 border-t border-[rgba(0,0,0,0.08)]">
            <Button size="small" variant="outlined" color="error"
              className="!capitalize !text-[12px] !font-[600]"
              onClick={() => setShowReturnForm(true)}>
              Request Return
            </Button>
          </div>
        )}

        {returnDone && returnStatusLabel && (
          <div className="mt-4 pt-4 border-t border-[rgba(0,0,0,0.08)]">
            <p className={`text-[12px] font-[500] ${returnStatus === 'rejected' ? 'text-red-600' : 'text-orange-600'}`}>
              {returnStatusLabel}
            </p>
          </div>
        )}

        {showReturnForm && (
          <div className="mt-4 pt-4 border-t border-[rgba(0,0,0,0.08)]">
            <p className="text-[13px] font-[600] text-gray-700 mb-3">Return Request</p>
            <select
              className="w-full border border-gray-300 rounded-md p-2 text-[13px] mb-3 bg-white"
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}>
              <option value="">Select a reason...</option>
              {RETURN_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 text-[13px] resize-none mb-3"
              rows={3} placeholder="Additional notes (optional)"
              value={returnNote} onChange={(e) => setReturnNote(e.target.value)} />
            <div className="flex gap-2">
              <Button size="small" variant="contained" color="error"
                className="!capitalize !text-[12px] !font-[600]"
                disabled={!returnReason || returnSubmitting} onClick={submitReturn}>
                {returnSubmitting ? 'Submitting...' : 'Submit Return Request'}
              </Button>
              <Button size="small" variant="text" className="!capitalize !text-[12px]"
                onClick={() => setShowReturnForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Orders = () => {
  const [isOpenOrderdProduct, setIsOpenOrderdProduct] = useState(null);
  const [orders, setOrders] = useState([]);

  const [page, setPage] = useState(1);

  const isShowOrderdProduct = (index) => {
    if (isOpenOrderdProduct === index) {
      setIsOpenOrderdProduct(null);
    } else {
      setIsOpenOrderdProduct(index);
    }
  };


  useEffect(() => {
    fetchDataFromApi(`/api/order/order-list/orders?page=${page}&limit=10`).then((res) => {
      if (res?.error === false) {
        setOrders(res)
      }
    })
  }, [page])

  return (
    <section className="py-5 lg:py-10 w-full">
      <div className="container flex flex-col lg:flex-row gap-5">
        <div className="col1 w-[20%] hidden lg:block">
          <AccountSidebar />
        </div>

        <div className="col2 w-full lg:w-[80%]">
          <div className="shadow-md rounded-md bg-white">
            <div className="py-5 px-5 border-b border-[rgba(0,0,0,0.1)]">
              <h2>My Orders</h2>
              <p className="mt-0 mb-0">
                There are <span className="font-bold text-primary">{ orders?.data?.length}</span>{" "}
                orders
              </p>

              <div className="relative overflow-x-auto mt-5">
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
                        Address
                      </th>
                      <th scope="col" className="px-6 py-3 whitespace-nowrap">
                        Total Amount
                      </th>
                      <th scope="col" className="px-6 py-3 whitespace-nowrap">
                        Order Status
                      </th>
                      <th scope="col" className="px-6 py-3 whitespace-nowrap">
                        Date &amp; Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>

                    {
                      orders?.data?.length !== 0 && orders?.data?.map((order, index) => {
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

                              <td className="px-6 py-4 font-[500]">
                               <span className='inline-block text-[13px] font-[500] p-1 bg-[#f1f1f1] rounded-md'>{order?.delivery_address?.addressType}</span>
                                <span className="block w-[300px]">
                                  {order?.delivery_address?.
                                    address_line1 + " " +
                                    order?.delivery_address?.city + " " +
                                    order?.delivery_address?.landmark + " " +
                                    order?.delivery_address?.state + " " +
                                    order?.delivery_address?.country
                                  }
                                </span>
                              </td>

                              <td className="px-6 py-4 font-[500]">{formatPrice(order?.totalAmt)}</td>

                              <td className="px-6 py-4 font-[500]">
                                <Badge status={order?.order_status} />
                              </td>
                              <td className="px-6 py-4 font-[500] whitespace-nowrap">
                                {formatDateTime(order?.createdAt)}
                              </td>
                            </tr>

                            {isOpenOrderdProduct === index && (
                              <tr>
                                <td className="px-6 pb-4" colSpan="7">
                                  <PathaoTrackingCard
                                    consignmentId={order?.pathaoConsignmentId}
                                    orderId={order?._id}
                                    orderStatus={order?.order_status}
                                    returnRequested={order?.returnRequested}
                                    returnStatus={order?.returnStatus}
                                  />
                                  <div className="relative overflow-x-auto">
                                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                          <th scope="col" className="px-6 py-3 whitespace-nowrap">
                                            Product Title
                                          </th>
                                          <th scope="col" className="px-6 py-3 whitespace-nowrap">
                                            Image
                                          </th>
                                          <th scope="col" className="px-6 py-3 whitespace-nowrap">
                                            Size
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
                                                  <Link to={`/product/${item?.productId}`} className="link hover:text-primary transition-all">
                                                    <div className="w-[200px]">
                                                      {item?.productTitle}
                                                    </div>
                                                  </Link>
                                                </td>

                                                <td className="px-6 py-4 font-[500]">
                                                  <Link to={`/product/${item?.productId}`}>
                                                    <img
                                                      src={item?.image}
                                                      className="w-[40px] h-[40px] object-cover rounded-md hover:opacity-80 transition-all"
                                                    />
                                                  </Link>
                                                </td>

                                                <td className="px-6 py-4 font-[500]">
                                                  {item?.size ? item.size : <span className="text-gray-400">—</span>}
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
                <div className="flex items-center justify-center mt-10">
                  <Pagination
                    showFirstButton showLastButton
                    count={orders?.totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                  />
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Orders;
