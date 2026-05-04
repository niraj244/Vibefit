import mongoose from "mongoose";

const pointsSchema = mongoose.Schema({
    userId: { type: String, required: true },
    type: {
        type: String,
        enum: ['earned', 'redeemed', 'referral_friend', 'referral_reward', 'admin'],
        required: true
    },
    points: { type: Number, required: true },
    orderId: { type: String, default: '' },
    description: { type: String, default: '' },
}, { timestamps: true });

const PointsModel = mongoose.model('points', pointsSchema);
export default PointsModel;
