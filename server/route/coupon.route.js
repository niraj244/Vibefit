import express from 'express';
import auth from '../middlewares/auth.js';
import {
    createCouponController,
    listCouponsController,
    validateCouponController,
    deleteCouponController,
    toggleCouponController,
} from '../controllers/coupon.controller.js';

const couponRouter = express.Router();

couponRouter.get('/validate', auth, validateCouponController);
couponRouter.post('/create', auth, createCouponController);
couponRouter.get('/list', auth, listCouponsController);
couponRouter.delete('/:id', auth, deleteCouponController);
couponRouter.patch('/toggle/:id', auth, toggleCouponController);

export default couponRouter;
