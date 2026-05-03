import CouponModel from "../models/coupon.model.js";
import UserModel from "../models/user.model.js";

const SUPER_ADMIN_EMAIL = 'nirajtamang244@gmail.com';

export const createCouponController = async (req, res) => {
    try {
        const admin = await UserModel.findById(req.userId);
        if (!admin || admin.email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
            return res.status(403).json({ error: true, success: false, message: "Only super admin can create coupons" });
        }

        const { code, type, value, minOrderAmount, assignedToEmail, expiresAt } = req.body;

        if (!code || !type || !value) {
            return res.status(400).json({ error: true, success: false, message: "Code, type, and value are required" });
        }

        let assignedTo = '';
        let resolvedEmail = assignedToEmail ? assignedToEmail.trim() : '';
        if (resolvedEmail) {
            const user = await UserModel.findOne({ email: resolvedEmail });
            if (!user) {
                return res.status(404).json({ error: true, success: false, message: `No account found for ${resolvedEmail}` });
            }
            assignedTo = String(user._id);
        }

        const coupon = new CouponModel({
            code: code.toUpperCase().trim(),
            type,
            value: parseFloat(value),
            minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : 1000,
            assignedTo,
            assignedToEmail: resolvedEmail,
            expiresAt: expiresAt || null,
            createdBy: String(req.userId),
        });

        await coupon.save();
        return res.status(200).json({ error: false, success: true, message: "Coupon created", data: coupon });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: true, success: false, message: "Coupon code already exists" });
        }
        return res.status(500).json({ error: true, success: false, message: error.message });
    }
};

export const listCouponsController = async (req, res) => {
    try {
        const coupons = await CouponModel.find().sort({ createdAt: -1 });
        return res.status(200).json({ error: false, success: true, data: coupons });
    } catch (error) {
        return res.status(500).json({ error: true, success: false, message: error.message });
    }
};

export const validateCouponController = async (req, res) => {
    try {
        const { code, userId, totalAmount } = req.query;

        if (!code) {
            return res.status(400).json({ error: true, success: false, message: "Coupon code is required" });
        }

        const coupon = await CouponModel.findOne({ code: code.toUpperCase().trim() });

        if (!coupon) {
            return res.status(404).json({ error: true, success: false, valid: false, message: "Invalid coupon code" });
        }
        if (!coupon.isActive) {
            return res.status(400).json({ error: true, success: false, valid: false, message: "This coupon is no longer active" });
        }
        if (coupon.isUsed) {
            return res.status(400).json({ error: true, success: false, valid: false, message: "This coupon has already been used" });
        }
        if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
            return res.status(400).json({ error: true, success: false, valid: false, message: "This coupon has expired" });
        }
        if (coupon.assignedTo && coupon.assignedTo !== String(userId)) {
            return res.status(403).json({ error: true, success: false, valid: false, message: "This coupon is not assigned to your account" });
        }

        const amount = parseFloat(totalAmount) || 0;
        if (amount < coupon.minOrderAmount) {
            return res.status(400).json({
                error: true, success: false, valid: false,
                message: `Minimum order of Rs. ${coupon.minOrderAmount.toLocaleString()} required for this coupon`
            });
        }

        let discount = 0;
        if (coupon.type === 'flat') {
            discount = coupon.value;
        } else if (coupon.type === 'percent') {
            discount = Math.round((amount * coupon.value) / 100);
        }
        discount = Math.min(discount, amount);

        return res.status(200).json({
            error: false, success: true, valid: true,
            coupon: {
                code: coupon.code,
                type: coupon.type,
                value: coupon.value,
                discount,
                finalAmount: Math.round(amount - discount),
            }
        });
    } catch (error) {
        return res.status(500).json({ error: true, success: false, message: error.message });
    }
};

export const deleteCouponController = async (req, res) => {
    try {
        const admin = await UserModel.findById(req.userId);
        if (!admin || admin.email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
            return res.status(403).json({ error: true, success: false, message: "Only super admin can delete coupons" });
        }
        await CouponModel.findByIdAndDelete(req.params.id);
        return res.status(200).json({ error: false, success: true, message: "Coupon deleted" });
    } catch (error) {
        return res.status(500).json({ error: true, success: false, message: error.message });
    }
};

export const toggleCouponController = async (req, res) => {
    try {
        const admin = await UserModel.findById(req.userId);
        if (!admin || admin.email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
            return res.status(403).json({ error: true, success: false, message: "Only super admin can modify coupons" });
        }
        const coupon = await CouponModel.findById(req.params.id);
        if (!coupon) return res.status(404).json({ error: true, success: false, message: "Coupon not found" });
        coupon.isActive = !coupon.isActive;
        await coupon.save();
        return res.status(200).json({ error: false, success: true, message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'}`, data: coupon });
    } catch (error) {
        return res.status(500).json({ error: true, success: false, message: error.message });
    }
};
