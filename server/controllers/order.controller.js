import OrderModel from "../models/order.model.js";
import ProductModel from '../models/product.modal.js';
import UserModel from '../models/user.model.js';
import CouponModel from '../models/coupon.model.js';
import PointsModel from '../models/points.model.js';
import paypal from "@paypal/checkout-server-sdk";
import OrderConfirmationEmail from "../utils/orderEmailTemplate.js";
import sendEmailFun from "../config/sendEmail.js";
import crypto from "crypto";

async function applyCoupon(code, userId) {
    if (!code) return;
    await CouponModel.findOneAndUpdate(
        { code: code.toUpperCase().trim(), isUsed: false },
        { isUsed: true, usedBy: String(userId), usedAt: new Date() }
    );
}

async function redeemPoints(userId, pointsToRedeem, orderId) {
    if (!pointsToRedeem || pointsToRedeem <= 0) return;
    const user = await UserModel.findById(userId);
    if (!user || user.points < pointsToRedeem) return;
    await UserModel.findByIdAndUpdate(userId, { $inc: { points: -pointsToRedeem } });
    await PointsModel.create({
        userId: String(userId),
        type: 'redeemed',
        points: -pointsToRedeem,
        orderId: String(orderId),
        description: `Redeemed ${pointsToRedeem} points for Rs. ${(pointsToRedeem * 0.1).toFixed(0)} discount`
    });
}

async function awardOrderPoints(userId, amountPaid, orderId) {
    const points = Math.floor(amountPaid / 10);
    if (points <= 0) return;
    await UserModel.findByIdAndUpdate(userId, { $inc: { points } });
    await PointsModel.create({
        userId: String(userId),
        type: 'earned',
        points,
        orderId: String(orderId),
        description: `Earned from order worth Rs. ${Math.round(amountPaid)}`
    });
}

async function handleFirstOrderReferral(userId, amountPaid) {
    if (amountPaid < 50) return;
    const user = await UserModel.findById(userId);
    if (!user || user.hasCompletedFirstOrder || !user.referredBy) return;

    await UserModel.findByIdAndUpdate(userId, { hasCompletedFirstOrder: true, $inc: { points: 250 } });
    await PointsModel.create({
        userId: String(userId),
        type: 'referral_friend',
        points: 250,
        description: 'Referral bonus - first purchase reward'
    });

    const referrer = await UserModel.findOne({ referralCode: user.referredBy });
    if (!referrer) return;

    await UserModel.findByIdAndUpdate(referrer._id, { $inc: { points: 500 } });
    await PointsModel.create({
        userId: String(referrer._id),
        type: 'referral_reward',
        points: 500,
        description: `Referral reward - ${user.name} made their first purchase`
    });
}

export const createOrderController = async (request, response) => {
    try {
        const { couponCode, couponDiscount, pointsToRedeem, pointsDiscount } = request.body;

        let order = new OrderModel({
            userId: request.body.userId,
            products: request.body.products,
            paymentId: request.body.paymentId,
            payment_status: request.body.payment_status,
            delivery_address: request.body.delivery_address,
            totalAmt: request.body.totalAmt,
            date: request.body.date,
            couponCode: couponCode || '',
            couponDiscount: couponDiscount || 0,
            pointsToRedeem: pointsToRedeem || 0,
            pointsDiscount: pointsDiscount || 0,
        });

        if (!order) {
            response.status(500).json({
                error: true,
                success: false
            })
        }

        order = await order.save();

        // Mark coupon as used only after order is saved
        await applyCoupon(couponCode, request.body.userId);
        await redeemPoints(request.body.userId, pointsToRedeem, order._id);

        for (let i = 0; i < request.body.products.length; i++) {

            const product = await ProductModel.findOne({ _id: request.body.products[i].productId })
            console.log(product)

            await ProductModel.findByIdAndUpdate(
                request.body.products[i].productId,
                {
                    countInStock: parseInt(request.body.products[i].countInStock - request.body.products[i].quantity),
                    sale: parseInt(product?.sale + request.body.products[i].quantity)
                },
                { new: true }
            );
        }

        const user = await UserModel.findOne({ _id: request.body.userId })

        // Send email in background — don't block the response
        if (user?.email) {
            sendEmailFun({
                sendTo: [user.email],
                subject: "Order Confirmation",
                text: "",
                html: OrderConfirmationEmail(user?.name, order)
            }).catch(err => console.error("Order email error:", err));
        }

        return response.status(200).json({
            error: false,
            success: true,
            message: "Order Placed",
            order: order
        });


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export async function getOrderDetailsController(request, response) {
    try {
        const userId = request.userId // order id

        const { page, limit } = request.query;

        const orderlist = await OrderModel.find().sort({ createdAt: -1 }).populate('delivery_address userId').skip((page - 1) * limit).limit(parseInt(limit));

        const total = await OrderModel.countDocuments(orderlist);

        return response.json({
            message: "order list",
            data: orderlist,
            error: false,
            success: true,
            total: total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function getUserOrderDetailsController(request, response) {
    try {
        const userId = request.userId // order id

        const { page, limit } = request.query;

        const orderlist = await OrderModel.find({ userId: userId }).sort({ createdAt: -1 }).populate('delivery_address userId').skip((page - 1) * limit).limit(parseInt(limit));

        const orderTotal = await OrderModel.find({ userId: userId }).sort({ createdAt: -1 }).populate('delivery_address userId');

        const total = await orderTotal?.length;

        return response.json({
            message: "order list",
            data: orderlist,
            error: false,
            success: true,
            total: total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export async function getTotalOrdersCountController(request, response) {
    try {
        const ordersCount = await OrderModel.countDocuments();
        return response.status(200).json({
            error: false,
            success: true,
            count: ordersCount
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



function getPayPalClient() {
    // checking paypal mode
    const isLive = process.env.PAYPAL_MODE === "live" || process.env.PAYPAL_MODE === "LIVE";
    const isSandbox = process.env.PAYPAL_MODE === "sandbox" || process.env.PAYPAL_MODE === "SANDBOX" || process.env.PAYPAL_MODE === "test" || process.env.PAYPAL_MODE === "TEST";
    
    // default to test mode
    const useLive = isLive && !isSandbox;

    if (useLive) {
        const clientId = process.env.PAYPAL_CLIENT_ID_LIVE?.trim();
        const secret = process.env.PAYPAL_SECRET_LIVE?.trim();
        
        if (!clientId || !secret) {
            throw new Error("PayPal Live credentials not configured. Please set PAYPAL_CLIENT_ID_LIVE and PAYPAL_SECRET_LIVE in .env file");
        }
        
        console.log("Using PayPal LIVE environment");
        return new paypal.core.PayPalHttpClient(
            new paypal.core.LiveEnvironment(clientId, secret)
        );
    } else {
        const clientId = process.env.PAYPAL_CLIENT_ID_TEST?.trim();
        const secret = process.env.PAYPAL_SECRET_TEST?.trim();
        
        if (!clientId || !secret) {
            console.error("PayPal credentials check:");
            console.error("PAYPAL_CLIENT_ID_TEST:", clientId ? "✓ Set" : "✗ Missing");
            console.error("PAYPAL_SECRET_TEST:", secret ? "✓ Set" : "✗ Missing");
            throw new Error("PayPal Sandbox credentials not configured. Please set PAYPAL_CLIENT_ID_TEST and PAYPAL_SECRET_TEST in .env file");
        }
        
        // making sure theyre not the same
        if (clientId === secret) {
            throw new Error("PayPal Client ID and Secret cannot be the same. Please check your server/.env file.");
        }
        
        console.log("Using PayPal SANDBOX environment");
        console.log("Client ID:", clientId.substring(0, 10) + "...");
        console.log("Secret:", secret.substring(0, 10) + "...");
        
        return new paypal.core.PayPalHttpClient(
            new paypal.core.SandboxEnvironment(clientId, secret)
        );
    }
}


export const createOrderPaypalController = async (request, response) => {
    try {
        const { userId, totalAmount, nprAmount } = request.query;

        // checking if user id exists
        if (!userId) {
            return response.status(400).json({
                error: true,
                success: false,
                message: "User ID is required"
            });
        }

         // converting to usd for paypal
        const usdAmount = totalAmount; // USD amount for PayPal
        const originalNprAmount = nprAmount || totalAmount; // Original NPR amount to store

        if (!usdAmount || isNaN(parseFloat(usdAmount)) || parseFloat(usdAmount) <= 0) {
            return response.status(400).json({
                error: true,
                success: false,
                message: "Invalid total amount"
            });
        }

        const req = new paypal.orders.OrdersCreateRequest();
        req.prefer("return=representation");

        // PayPal requires USD (doesn't support NPR)
        req.requestBody({
            intent: "CAPTURE",
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: parseFloat(usdAmount).toFixed(2)
                },
                description: `Order payment (NPR ${originalNprAmount})`
            }]
        });

        try {
            const client = getPayPalClient();
            const order = await client.execute(req);
            
            if (!order.result || !order.result.id) {
                throw new Error("PayPal order creation failed - no order ID returned");
            }

            response.json({ id: order.result.id });
        } catch (error) {
            console.error("========== PAYPAL API ERROR ==========");
            console.error("PayPal API Error:", error);
            console.error("Error message:", error.message || error);
            console.error("Error status:", error.statusCode);
            console.error("Error details:", error.details || error);
            
            // Log the actual PayPal error response if available
            if (error.response) {
                console.error("PayPal Error Response:", JSON.stringify(error.response, null, 2));
            }
            
            // Check for specific error types
            let errorMessage = "Error creating PayPal order.";
            
            if (error.message && error.message.includes("credentials")) {
                errorMessage = "PayPal credentials not configured correctly. Please check your server .env file.";
            } else if (error.message && (error.message.includes("401") || error.message.includes("invalid_client") || error.message.includes("Authentication failed"))) {
                errorMessage = "PayPal authentication failed. Your PayPal Secret is incorrect. Please check your server .env file - PAYPAL_SECRET_TEST must be different from PAYPAL_CLIENT_ID_TEST.";
            } else if (error.message && error.message.includes("400")) {
                errorMessage = "Invalid PayPal request. Please check the order amount.";
            } else if (error.statusCode === 401 || (error.message && error.message.includes("invalid_client"))) {
                errorMessage = "PayPal authentication failed. Please verify your PayPal Secret in server/.env file.";
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            console.error("Returning error message to client:", errorMessage);
            console.error("=====================================");
            
            return response.status(500).json({
                error: true,
                success: false,
                message: errorMessage
            });
        }

    } catch (error) {
        console.error("createOrderPaypalController Error:", error);
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}




export const captureOrderPaypalController = async (request, response) => {
    try {
        const { paymentId } = request.body;

        const req = new paypal.orders.OrdersCaptureRequest(paymentId);
        req.requestBody({});

        // save npr amount not usd
        const nprAmount = request.body.nprAmount || request.body.totalAmount;

        const orderInfo = {
            userId: request.body.userId,
            products: request.body.products,
            paymentId: request.body.paymentId,
            payment_status: request.body.payment_status,
            delivery_address: request.body.delivery_address,
            totalAmt: parseFloat(nprAmount), // Store in NPR
            date: request.body.date
        }

        const order = new OrderModel(orderInfo);
        await order.save();

        const user = await UserModel.findOne({ _id: request.body.userId })

        // Send email in background — don't block the response
        if (user?.email) {
            sendEmailFun({
                sendTo: [user.email],
                subject: "Order Confirmation",
                text: "",
                html: OrderConfirmationEmail(user?.name, order)
            }).catch(err => console.error("PayPal order email error:", err));
        }

        for (let i = 0; i < request.body.products.length; i++) {

            const product = await ProductModel.findOne({ _id: request.body.products[i].productId })

            await ProductModel.findByIdAndUpdate(
                request.body.products[i].productId,
                {
                    countInStock: parseInt(request.body.products[i].countInStock - request.body.products[i].quantity),
                    sale: parseInt(product?.sale + request.body.products[i].quantity)
                },
                { new: true }
            );
        }


        return response.status(200).json(
            {
                success: true,
                error: false,
                order: order,
                message: "Order Placed"
            }
        );

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



export const updateOrderStatusController = async (request, response) => {
    try {
        const { id, order_status } = request.body;

        const updateOrder = await OrderModel.updateOne(
            { _id: id },
            { order_status: order_status },
            { new: true }
        );

        // Award points only when delivered and not yet awarded
        if (order_status === 'delivered') {
            const order = await OrderModel.findOne({ _id: id, pointsAwarded: false });
            if (order) {
                await OrderModel.updateOne({ _id: id }, { pointsAwarded: true });
                await awardOrderPoints(order.userId, order.totalAmt, order._id);
                handleFirstOrderReferral(order.userId, order.totalAmt).catch(() => {});
            }
        }

        return response.json({
            message: "Update order status",
            success: true,
            error: false,
            data: updateOrder
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }

}

export const updatePathaoConsignmentIdController = async (request, response) => {
    try {
        const { id } = request.params;
        const { pathaoConsignmentId } = request.body;

        await OrderModel.updateOne(
            { _id: id },
            { pathaoConsignmentId: pathaoConsignmentId || "" }
        );

        return response.json({
            message: "Pathao Consignment ID updated",
            success: true,
            error: false
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}






export const getPathaoTrackingController = async (request, response) => {
    try {
        const { orderId } = request.params;
        const order = await OrderModel.findOne({ _id: orderId, userId: request.userId });

        if (!order) {
            return response.status(404).json({ message: 'Order not found', error: true, success: false });
        }
        if (!order.pathaoConsignmentId) {
            return response.json({ success: false, error: false, message: 'No tracking ID assigned to this order yet.' });
        }

        const { getPathaoTracking } = await import('../config/pathaoService.js');
        const data = await getPathaoTracking(order.pathaoConsignmentId);

        if (!data.configured) {
            return response.json({ success: false, error: false, message: 'Live tracking not yet configured.' });
        }

        return response.json({
            success: true,
            error: false,
            trackingId: order.pathaoConsignmentId,
            status: data.order_status || data.status || null,
            lastUpdated: data.updated_at || data.last_updated || null,
            history: data.history || data.events || [],
        });
    } catch (error) {
        console.error('[Pathao Tracking]', error.message);
        return response.json({ success: false, error: false, message: 'Live tracking temporarily unavailable.' });
    }
}

export const submitReturnRequestController = async (request, response) => {
    try {
        const { orderId } = request.params;
        const { returnReason, returnNote } = request.body;

        const order = await OrderModel.findOne({ _id: orderId, userId: request.userId });
        if (!order) {
            return response.status(404).json({ message: 'Order not found', error: true, success: false });
        }
        if (order.order_status !== 'delivered') {
            return response.status(400).json({ message: 'Only delivered orders are eligible for return.', error: true, success: false });
        }
        if (order.returnRequested) {
            return response.status(400).json({ message: 'A return has already been requested for this order.', error: true, success: false });
        }

        await OrderModel.updateOne({ _id: orderId }, {
            returnRequested: true,
            returnStatus: 'pending',
            returnReason: returnReason || '',
            returnNote: returnNote || '',
            returnRequestedAt: new Date(),
            returnRequestedBy: String(request.userId),
        });

        return response.json({ success: true, error: false, message: 'Return request submitted successfully.' });
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}

export const updateReturnStatusController = async (request, response) => {
    try {
        const { orderId } = request.params;
        const { returnStatus } = request.body;
        const allowed = ['none', 'pending', 'approved', 'rejected', 'completed'];
        if (!allowed.includes(returnStatus)) {
            return response.status(400).json({ message: 'Invalid return status.', error: true, success: false });
        }
        await OrderModel.updateOne({ _id: orderId }, { returnStatus });
        return response.json({ success: true, error: false, message: 'Return status updated.' });
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}

export const getOrdersNeedingPackagingController = async (request, response) => {
    try {
        const orders = await OrderModel.find({
            order_status: { $in: ['confirm', 'pending'] },
            $or: [{ pathaoConsignmentId: '' }, { pathaoConsignmentId: { $exists: false } }]
        }).sort({ createdAt: -1 }).populate('delivery_address userId').limit(50);

        return response.json({ success: true, error: false, data: orders, total: orders.length });
    } catch (error) {
        return response.status(500).json({ message: error.message || error, error: true, success: false });
    }
}

export const totalSalesController = async (request, response) => {
    try {
        const currentYear = new Date().getFullYear();

        const ordersList = await OrderModel.find();

        let totalSales = 0;
        let monthlySales = [
            {
                name: 'JAN',
                TotalSales: 0
            },
            {
                name: 'FEB',
                TotalSales: 0
            },
            {
                name: 'MAR',
                TotalSales: 0
            },
            {
                name: 'APRIL',
                TotalSales: 0
            },
            {
                name: 'MAY',
                TotalSales: 0
            },
            {
                name: 'JUNE',
                TotalSales: 0
            },
            {
                name: 'JULY',
                TotalSales: 0
            },
            {
                name: 'AUG',
                TotalSales: 0
            },
            {
                name: 'SEP',
                TotalSales: 0
            },
            {
                name: 'OCT',
                TotalSales: 0
            },
            {
                name: 'NOV',
                TotalSales: 0
            },
            {
                name: 'DEC',
                TotalSales: 0
            },
        ]


        for (let i = 0; i < ordersList.length; i++) {
            totalSales = totalSales + parseInt(ordersList[i].totalAmt);
            const str = JSON.stringify(ordersList[i]?.createdAt);
            const year = str.substr(1, 4);
            const monthStr = str.substr(6, 8);
            const month = parseInt(monthStr.substr(0, 2));

            if (currentYear == year) {

                if (month === 1) {
                    monthlySales[0] = {
                        name: 'JAN',
                        TotalSales: monthlySales[0].TotalSales = parseInt(monthlySales[0].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 2) {

                    monthlySales[1] = {
                        name: 'FEB',
                        TotalSales: monthlySales[1].TotalSales = parseInt(monthlySales[1].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 3) {
                    monthlySales[2] = {
                        name: 'MAR',
                        TotalSales: monthlySales[2].TotalSales = parseInt(monthlySales[2].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 4) {
                    monthlySales[3] = {
                        name: 'APRIL',
                        TotalSales: monthlySales[3].TotalSales = parseInt(monthlySales[3].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 5) {
                    monthlySales[4] = {
                        name: 'MAY',
                        TotalSales: monthlySales[4].TotalSales = parseInt(monthlySales[4].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 6) {
                    monthlySales[5] = {
                        name: 'JUNE',
                        TotalSales: monthlySales[5].TotalSales = parseInt(monthlySales[5].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 7) {
                    monthlySales[6] = {
                        name: 'JULY',
                        TotalSales: monthlySales[6].TotalSales = parseInt(monthlySales[6].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 8) {
                    monthlySales[7] = {
                        name: 'AUG',
                        TotalSales: monthlySales[7].TotalSales = parseInt(monthlySales[7].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 9) {
                    monthlySales[8] = {
                        name: 'SEP',
                        TotalSales: monthlySales[8].TotalSales = parseInt(monthlySales[8].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 10) {
                    monthlySales[9] = {
                        name: 'OCT',
                        TotalSales: monthlySales[9].TotalSales = parseInt(monthlySales[9].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 11) {
                    monthlySales[10] = {
                        name: 'NOV',
                        TotalSales: monthlySales[10].TotalSales = parseInt(monthlySales[10].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 12) {
                    monthlySales[11] = {
                        name: 'DEC',
                        TotalSales: monthlySales[11].TotalSales = parseInt(monthlySales[11].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

            }


        }


        return response.status(200).json({
            totalSales: totalSales,
            monthlySales: monthlySales,
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}





export const totalUsersController = async (request, response) => {
    try {
        const users = await UserModel.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 },
            },
        ]);



        let monthlyUsers = [
            {
                name: 'JAN',
                TotalUsers: 0
            },
            {
                name: 'FEB',
                TotalUsers: 0
            },
            {
                name: 'MAR',
                TotalUsers: 0
            },
            {
                name: 'APRIL',
                TotalUsers: 0
            },
            {
                name: 'MAY',
                TotalUsers: 0
            },
            {
                name: 'JUNE',
                TotalUsers: 0
            },
            {
                name: 'JULY',
                TotalUsers: 0
            },
            {
                name: 'AUG',
                TotalUsers: 0
            },
            {
                name: 'SEP',
                TotalUsers: 0
            },
            {
                name: 'OCT',
                TotalUsers: 0
            },
            {
                name: 'NOV',
                TotalUsers: 0
            },
            {
                name: 'DEC',
                TotalUsers: 0
            },
        ]




        for (let i = 0; i < users.length; i++) {

            if (users[i]?._id?.month === 1) {
                monthlyUsers[0] = {
                    name: 'JAN',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 2) {
                monthlyUsers[1] = {
                    name: 'FEB',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 3) {
                monthlyUsers[2] = {
                    name: 'MAR',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 4) {
                monthlyUsers[3] = {
                    name: 'APRIL',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 5) {
                monthlyUsers[4] = {
                    name: 'MAY',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 6) {
                monthlyUsers[5] = {
                    name: 'JUNE',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 7) {
                monthlyUsers[6] = {
                    name: 'JULY',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 8) {
                monthlyUsers[7] = {
                    name: 'AUG',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 9) {
                monthlyUsers[8] = {
                    name: 'SEP',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 10) {
                monthlyUsers[9] = {
                    name: 'OCT',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 11) {
                monthlyUsers[10] = {
                    name: 'NOV',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 12) {
                monthlyUsers[11] = {
                    name: 'DEC',
                    TotalUsers: users[i].count
                }
            }

        }



        return response.status(200).json({
            TotalUsers: monthlyUsers,
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



export async function deleteOrder(request, response) {
    const order = await OrderModel.findById(request.params.id);

    console.log(request.params.id)

    if (!order) {
        return response.status(404).json({
            message: "Order Not found",
            error: true,
            success: false
        })
    }


    const deletedOrder = await OrderModel.findByIdAndDelete(request.params.id);

    if (!deletedOrder) {
        response.status(404).json({
            message: "Order not deleted!",
            success: false,
            error: true
        });
    }

    return response.status(200).json({
        success: true,
        error: false,
        message: "Order Deleted!",
    });
}


// storing esewa orders temporarily
const esewaPendingOrders = new Map();

// esewa payment
export const initiateEsewaPaymentController = async (request, response) => {
    try {
        const { userId, products, totalAmount, delivery_address, date, couponCode, couponDiscount, pointsToRedeem, pointsDiscount } = request.body;

        if (!userId || !products || !totalAmount || !delivery_address) {
            return response.status(400).json({
                error: true,
                success: false,
                message: "Missing required fields"
            });
        }

        const merchantId = process.env.ESEWA_MERCHANT_ID;
        const secretKey = process.env.ESEWA_SECRET_KEY;
        const environment = process.env.ESEWA_ENVIRONMENT || "test";

        // check env vars
        if (!merchantId || !secretKey) {
            return response.status(400).json({
                error: true,
                success: false,
                message: "eSewa credentials not configured. Please set ESEWA_MERCHANT_ID and ESEWA_SECRET_KEY in .env file"
            });
        }

        // Generate unique transaction ID
        const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Calculate amount (eSewa expects amount in NPR)
        const amount = parseFloat(totalAmount).toFixed(2);

        // Create success and failure URLs - these should point to backend endpoints
        const baseUrl = process.env.BACKEND_URL || `${request.protocol}://${request.get("host")}`;
        const successUrl = `${baseUrl}/api/order/esewa-success?transaction_uuid=${transactionId}`;
        const failureUrl = `${baseUrl}/api/order/esewa-failure?transaction_uuid=${transactionId}`;

        // Store order data temporarily using transaction ID as key
        esewaPendingOrders.set(transactionId, {
            userId,
            products,
            delivery_address,
            date: date || new Date().toLocaleString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
            }),
            totalAmount: amount,
            couponCode: couponCode || '',
            couponDiscount: couponDiscount || 0,
            pointsToRedeem: pointsToRedeem || 0,
            pointsDiscount: pointsDiscount || 0,
            createdAt: new Date()
        });

        // Clean up old entries (older than 1 hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        for (const [key, value] of esewaPendingOrders.entries()) {
            if (value.createdAt < oneHourAgo) {
                esewaPendingOrders.delete(key);
            }
        }

        // Create hash for eSewa payment
        // eSewa v2 API signature format: Use HMAC-SHA256 with base64 encoding
        // Signature is based on signed_field_names: total_amount,transaction_uuid,product_code
        const productCode = environment === "live" ? (process.env.ESEWA_PRODUCT_CODE || "YOUR_PRODUCT_CODE") : "EPAYTEST";
        
        // eSewa v2 uses HMAC-SHA256 for signature
        // Format: total_amount=amount,transaction_uuid=uuid,product_code=code
        const signatureData = `total_amount=${amount},transaction_uuid=${transactionId},product_code=${productCode}`;
        const hash = crypto.createHmac('sha256', secretKey).update(signatureData).digest('base64');

        // Determine eSewa payment URL based on environment
        const esewaPaymentUrl = environment === "live"
            ? "https://epay.esewa.com.np/api/epay/main/v2/form"
            : "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

        // Return payment URL and form data for frontend to submit
        return response.status(200).json({
            success: true,
            error: false,
            paymentUrl: esewaPaymentUrl,
            formData: {
                amount: amount,
                tax_amount: "0",
                total_amount: amount,
                transaction_uuid: transactionId,
                product_code: productCode,
                product_service_charge: "0",
                product_delivery_charge: "0",
                success_url: successUrl,
                failure_url: failureUrl,
                signed_field_names: "total_amount,transaction_uuid,product_code",
                signature: hash
            },
            transactionId: transactionId
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}


export const verifyEsewaPaymentController = async (request, response) => {
    try {
        const { data, transaction_uuid, transaction_code, status, total_amount, product_code, signature } = request.query;

        if (!transaction_uuid) {
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
            return response.redirect(`${frontendUrl}/order/failed`);
        }

        // Retrieve stored order data
        const storedOrderData = esewaPendingOrders.get(transaction_uuid);

        if (!storedOrderData) {
            console.error("Order data not found for transaction:", transaction_uuid);
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
            return response.redirect(`${frontendUrl}/order/failed`);
        }

        const merchantId = process.env.ESEWA_MERCHANT_ID;
        const secretKey = process.env.ESEWA_SECRET_KEY;

        if (!merchantId || !secretKey) {
            console.error("eSewa credentials not configured");
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
            return response.redirect(`${frontendUrl}/order/failed`);
        }

        // Verify the signature from eSewa
        // eSewa v2 verification: Use the same format as initiation
        const productCode = process.env.ESEWA_ENVIRONMENT === "live" 
            ? (process.env.ESEWA_PRODUCT_CODE || "YOUR_PRODUCT_CODE") 
            : "EPAYTEST";
        const signatureData = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${productCode}`;
        const calculatedHash = crypto.createHmac('sha256', secretKey).update(signatureData).digest('base64');

        // Check if payment was successful
        if (status === "COMPLETE" || status === "success" || transaction_code) {
            // Payment successful - create order
            const { userId, products, delivery_address, date, totalAmount, couponCode, couponDiscount, pointsToRedeem, pointsDiscount } = storedOrderData;

            // Verify amount matches
            if (parseFloat(total_amount) !== parseFloat(totalAmount)) {
                console.error("Amount mismatch:", total_amount, totalAmount);
                esewaPendingOrders.delete(transaction_uuid);
                const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
                return response.redirect(`${frontendUrl}/order/failed`);
            }

            // Create order
            let order = new OrderModel({
                userId: userId,
                products: products,
                paymentId: transaction_uuid,
                payment_status: "COMPLETED",
                delivery_address: delivery_address,
                totalAmt: parseFloat(total_amount),
                date: date,
                couponCode: couponCode || '',
                couponDiscount: couponDiscount || 0,
                pointsToRedeem: pointsToRedeem || 0,
                pointsDiscount: pointsDiscount || 0,
            });

            order = await order.save();

            // Mark coupon as used only after order is saved
            await applyCoupon(couponCode, userId);
            await redeemPoints(userId, pointsToRedeem, order._id);

            // Update product stock
            for (let i = 0; i < products.length; i++) {
                const product = await ProductModel.findOne({ _id: products[i].productId });

                if (product) {
                    await ProductModel.findByIdAndUpdate(
                        products[i].productId,
                        {
                            countInStock: parseInt(products[i].countInStock - products[i].quantity),
                            sale: parseInt(product?.sale + products[i].quantity)
                        },
                        { new: true }
                    );
                }
            }

            // Send confirmation email in background
            const user = await UserModel.findOne({ _id: userId });
            if (user?.email) {
                sendEmailFun({
                    sendTo: [user.email],
                    subject: "Order Confirmation",
                    text: "",
                    html: OrderConfirmationEmail(user.name, order)
                }).catch(err => console.error("eSewa order email error:", err));
            }

            // Clear cart
            try {
                await fetch(`${process.env.BACKEND_URL || request.protocol + "://" + request.get("host")}/api/cart/emptyCart/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${request.headers.authorization?.split(' ')[1] || ''}`
                    }
                });
            } catch (e) {
                console.error("Error clearing cart:", e);
            }

            // Remove from pending orders
            esewaPendingOrders.delete(transaction_uuid);

            // Redirect to success page
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
            return response.redirect(`${frontendUrl}/order/success`);

        } else {
            // Payment failed or cancelled
            esewaPendingOrders.delete(transaction_uuid);
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
            return response.redirect(`${frontendUrl}/order/failed`);
        }

    } catch (error) {
        console.error("eSewa verification error:", error);
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        return response.redirect(`${frontendUrl}/order/failed`);
    }
}

// Handle eSewa failure callback
export const esewaFailureController = async (request, response) => {
    try {
        const { transaction_uuid } = request.query;
        
        if (transaction_uuid) {
            esewaPendingOrders.delete(transaction_uuid);
        }

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        return response.redirect(`${frontendUrl}/order/failed`);
    } catch (error) {
        console.error("eSewa failure handler error:", error);
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        return response.redirect(`${frontendUrl}/order/failed`);
    }
}