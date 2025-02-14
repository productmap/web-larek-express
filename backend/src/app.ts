import path from 'path';
import express from 'express';
import cors from 'cors';
import logger from './utils/logger';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/errorHandler';
import { connectToDatabase } from './utils/db';
import securityHeaders from './middlewares/headersMiddleware';
import { config } from './app.config';
import authRoutes from './routes/auth';
import productRoutes from './routes/product';
import orderRoutes from './routes/order';

const app = express();

// Мидлвары
app.use(securityHeaders);
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3082',
      'http://127.0.0.1:3082',
      'http://localhost',
      'http://127.0.0.1',
    ],
    // Необходимо для отправки кук и заголовков авторизации в кросс-доменных запросах.
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Маршрутизатор для добавления префикса
const apiRouter = express.Router();
// Базовый тестовый маршрут
apiRouter.get('/', (_req, res) => {
  res.send('Backend is running!');
});

// Маршруты
apiRouter.use('/auth', authRoutes);
apiRouter.use('/product', productRoutes);
apiRouter.use('/order', orderRoutes);

// Применение префикса к маршрутам
app.use(config.app.prefix, apiRouter);

// Мидлвар обработки ошибок
app.use(errorHandler);

// Папка статических файлов
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images'), {
  setHeaders: (res, _path, _stat) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); // Явно устанавливаем CORP
  },
}));

// Функция запуска сервера
const startServer = async () => {
  // Проверка подключения к базе данных
  await connectToDatabase();

  app.listen(config.app.port, config.app.host, () => {
    logger.info(`Application is running on port ${config.app.baseUrl}${config.app.prefix}...`);
  });
};

// Запуск сервера
startServer()
  .catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });
