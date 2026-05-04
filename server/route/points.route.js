import express from 'express';
import auth from '../middlewares/auth.js';
import { getMyPointsController } from '../controllers/points.controller.js';

const pointsRouter = express.Router();

pointsRouter.get('/my-points', auth, getMyPointsController);

export default pointsRouter;
