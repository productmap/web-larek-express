import { Request, Response } from 'express';
import Product, { IProduct } from '../models/product';
import { ApiListResponse, AuthenticatedRequest, IFile } from '../types/apiTypes';
import logger from '../utils/logger';

// Получение списка продуктов
export const getProductList = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    logger.info('Attempting to fetch products from database');
    const products = await Product.find()
      .lean()
      .exec();

    if (!products) {
      logger.error('No products found');
      res.status(404)
        .json({ message: 'No products found' });
      return;
    }

    const total = products.length;
    const response: ApiListResponse<IProduct> = {
      total,
      items: products,
    };

    logger.info(`Successfully retrieved ${total} products`);
    res.status(200)
      .json(response);
  } catch (error: any) {
    logger.error(`Error fetching products: ${error.message}`);

    if (error.name === 'MongoNetworkError') {
      res.status(502)
        .json({ message: 'Unable to connect to the database' });
    } else {
      res.status(500)
        .json({ message: 'An unexpected error occurred' });
    }
  }
};

// Получение продукта по ID
export const getProductItem = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404)
        .json({ message: 'Product not found' });
      return;
    }
    res.status(200)
      .json(product);
  } catch (error: any) {
    res.status(500)
      .json({ message: error.message });
  }
};

// Получение списка СВОИХ продуктов (для админ панели)
export const getMyProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authenticatedRequest = req as AuthenticatedRequest;
    const userId = authenticatedRequest.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' }); // If no user, return 401
      return;
    }

    const products = await Product.find({ createdBy: userId })
      .populate('createdBy', 'name email')
      .lean()
      .exec();

    logger.info(`Products found: ${JSON.stringify(products)}`);

    if (!products) {
      logger.warn(`No products found for user ID: ${userId}`);
      res.status(404).json({ message: 'No products found for this user' });
      return;
    }

    const total = products.length;
    const response: ApiListResponse<IProduct> = {
      total,
      items: products,
    };

    logger.info(`Successfully retrieved ${total} products for user ID: ${userId}`);
    res.status(200).json(response);
  } catch (error: any) {
    logger.error(`Error fetching products for logged-in user: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// Создание продукта
export const createProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authenticatedRequest = req as AuthenticatedRequest;
    const userId = authenticatedRequest.user?.id;

    if (!userId) {
      res.status(401)
        .json({ message: 'Unauthorized to create product' });
      return;
    }

    const newProduct = new Product({
      ...req.body,
      createdBy: userId,
    });

    const savedProduct = await newProduct.save();
    res.status(201)
      .json(savedProduct);
  } catch (error: any) {
    res.status(400)
      .json({ message: error.message });
  }
};

// Обновление продукта
export const updateProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!updatedProduct) {
      res.status(404)
        .json({ message: 'Product not found' });
      return;
    }
    res.status(200)
      .json(updatedProduct);
  } catch (error: any) {
    res.status(400)
      .json({ message: error.message });
  }
};

// Удаление продукта
export const deleteProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      res.status(404)
        .json({ message: 'Product not found' });
      return;
    }
    res.status(200)
      .json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500)
      .json({ message: error.message });
  }
};

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400)
        .json({
          success: false,
          message: 'Файл не был загружен',
        });
      return;
    }

    // req.file типизирован как Express.Multer.File
    const fileName = req.file.filename; // Имя файла, сгенерированное multer
    const filePath = `/images/${fileName}`; // Путь к файлу для фронтенда

    const file: IFile = {
      _id: fileName, // Используем имя файла как ID
      fileName: fileName,
    };

    logger.info(`Файл успешно загружен: ${fileName}, путь: ${filePath}`);
    res.status(200)
      .json({
        success: true,
        message: 'Файл успешно загружен',
        file: file,
      });
    return;

  } catch (error: any) {
    logger.error(`Ошибка загрузки файла: ${error.message}`);
    res.status(500)
      .json({
        success: false,
        message: error.message,
      });
  }
};
