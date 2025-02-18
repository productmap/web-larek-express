import express, { Router } from 'express';
import { orderProducts } from '../controllers/order';
import authMiddleware from '../middlewares/authMiddleware';

const router: Router = express.Router();

// Создание заказа
router.post('/', authMiddleware, orderProducts);

export default router;
