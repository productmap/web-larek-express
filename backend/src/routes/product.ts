import express, { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  getMyProducts,
  getProductItem,
  getProductList,
  updateProduct,
  uploadImage,
} from '../controllers/product';
import authMiddleware from '../middlewares/authMiddleware';
import uploadMiddleware from '../middlewares/imageMiddleware';

const router: Router = express.Router();

// Получение списка продуктов
router.get('/', getProductList);

// Получение своих продуктов (админ панель)
router.get('/me', authMiddleware, getMyProducts);

// Получение продукта по ID
router.get('/:id', getProductItem);

// Создание продукта (требуется авторизация)
router.post('/', authMiddleware, createProduct);

// Обновление продукта (требуется авторизация)
router.patch('/:id', authMiddleware, updateProduct);

// Удаление продукта (требуется авторизация)
router.delete('/:id', authMiddleware, deleteProduct);

// Загрузка картинки
router.post('/upload', authMiddleware, uploadMiddleware.single('file'), uploadImage);

export default router;
