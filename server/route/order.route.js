import { Router } from "express";
import auth from "../middlewares/auth.js";
import {  captureOrderPaypalController, createOrderController, createOrderPaypalController, deleteOrder, esewaFailureController, getOrderDetailsController, getOrdersNeedingPackagingController, getPathaoTrackingController, getTotalOrdersCountController, getUserOrderDetailsController, initiateEsewaPaymentController, submitReturnRequestController, totalSalesController, totalUsersController, updateOrderStatusController, updatePathaoConsignmentIdController, updateReturnStatusController, verifyEsewaPaymentController } from "../controllers/order.controller.js";

const orderRouter = Router();

orderRouter.post('/create',auth,createOrderController)
orderRouter.get("/order-list",auth,getOrderDetailsController)
orderRouter.get('/create-order-paypal',auth,createOrderPaypalController)
orderRouter.post('/capture-order-paypal',auth,captureOrderPaypalController)
orderRouter.put('/order-status/:id',auth,updateOrderStatusController)
orderRouter.get('/count',auth,getTotalOrdersCountController)
orderRouter.get('/sales',auth,totalSalesController)
orderRouter.get('/users',auth,totalUsersController)
orderRouter.get('/order-list/orders',auth,getUserOrderDetailsController)
orderRouter.delete('/deleteOrder/:id',auth,deleteOrder)
orderRouter.put('/pathao-consignment/:id',auth,updatePathaoConsignmentIdController)
orderRouter.get('/needs-packaging',auth,getOrdersNeedingPackagingController)
orderRouter.get('/:orderId/pathao-tracking',auth,getPathaoTrackingController)
orderRouter.post('/:orderId/return-request',auth,submitReturnRequestController)
orderRouter.put('/:orderId/return-status',auth,updateReturnStatusController)

// eSewa routes
orderRouter.post('/initiate-esewa-payment',auth,initiateEsewaPaymentController)
orderRouter.get('/esewa-success',verifyEsewaPaymentController) // Public route for eSewa callback
orderRouter.get('/esewa-failure',esewaFailureController) // Public route for eSewa callback

export default orderRouter;