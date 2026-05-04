import PointsModel from "../models/points.model.js";
import UserModel from "../models/user.model.js";

export const getMyPointsController = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId).select('points referralCode name email');
        if (!user) return res.status(404).json({ error: true, success: false, message: "User not found" });

        const transactions = await PointsModel.find({ userId: String(req.userId) })
            .sort({ createdAt: -1 })
            .limit(30);

        return res.status(200).json({
            error: false, success: true,
            data: {
                points: user.points || 0,
                referralCode: user.referralCode || '',
                referralLink: `${process.env.FRONTEND_URL || 'https://vibefit-kappa.vercel.app'}/register?ref=${user.referralCode || ''}`,
                transactions,
            }
        });
    } catch (error) {
        return res.status(500).json({ error: true, success: false, message: error.message });
    }
};
