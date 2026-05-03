import mongoose from "mongoose";

const couponSchema = mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['flat', 'percent'], required: true },
    value: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 1000 },
    assignedTo: { type: String, default: '' },
    assignedToEmail: { type: String, default: '' },
    isUsed: { type: Boolean, default: false },
    usedBy: { type: String, default: '' },
    usedAt: { type: Date },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
    createdBy: { type: String, default: '' },
}, { timestamps: true });

const CouponModel = mongoose.model('coupon', couponSchema);
export default CouponModel;
