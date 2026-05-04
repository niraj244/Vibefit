import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    products: [
        {
            productId: {
                type: String
            },
            productTitle: {
                type: String
            },
            quantity: {
                type: Number
            },
            price: {
                type: Number
            },
            image: {
                type: String
            },
            size: {
                type: String,
                default: ""
            },
            subTotal: {
                type: Number
            }
        }
    ],
    paymentId: {
        type: String,
        default: ""
    },
    payment_status : {
        type : String,
        default : ""
    },
    order_status : {
        type : String,
        default : "confirm"
    },
    delivery_address: {
        type: mongoose.Schema.ObjectId,
        ref: 'address'
    },
    totalAmt: {
        type: Number,
        default: 0
    },
    couponCode: {
        type: String,
        default: ""
    },
    couponDiscount: {
        type: Number,
        default: 0
    },
    pointsToRedeem: {
        type: Number,
        default: 0
    },
    pointsDiscount: {
        type: Number,
        default: 0
    },
    pointsAwarded: {
        type: Boolean,
        default: false
    },
    pathaoConsignmentId: {
        type: String,
        default: ""
    },
    returnRequested: {
        type: Boolean,
        default: false
    },
    returnStatus: {
        type: String,
        enum: ['none', 'pending', 'approved', 'rejected', 'completed'],
        default: 'none'
    },
    returnReason: {
        type: String,
        default: ""
    },
    returnNote: {
        type: String,
        default: ""
    },
    returnRequestedAt: {
        type: Date
    },
    returnRequestedBy: {
        type: String
    }
}, {
    timestamps: true
})

const OrderModel = mongoose.model('order', orderSchema)

export default OrderModel