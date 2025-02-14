import dotenv from 'dotenv';
import * as process from 'node:process';

dotenv.config();

const host = process.env.APP_HOST || 'localhost';
const port = parseInt(process.env.APP_PORT || '3082', 10);
const baseUrl = `http://${host}:${port}`;

// Функция для преобразования строки в миллисекунды (если нужно поддерживать '7d', '1h' и т.д.)
const parseDurationToMs = (durationString: string | undefined, defaultValueMs: number): number => {
  if (!durationString) {
    return defaultValueMs;
  }

  const durationMatch = durationString.match(/(\d+)([smhd])/); // Пример: 30s, 1h, 7d
  if (durationMatch) {
    const value = parseInt(durationMatch[1], 10);
    const unit = durationMatch[2];
    switch (unit) {
      case 's': return value * 1000;      // секунды в миллисекунды
      case 'm': return value * 60 * 1000;   // минуты в миллисекунды
      case 'h': return value * 60 * 60 * 1000; // часы в миллисекунды
      case 'd': return value * 24 * 60 * 60 * 1000; // дни в миллисекунды
      default: return defaultValueMs;
    }
  }

  const parsedValue = Number(durationString); // Попытка преобразовать в число напрямую
  return isNaN(parsedValue) ? defaultValueMs : parsedValue; // Если не число, то defaultValueMs
};


export const config = {
  app: {
    environment: process.env.NODE_ENV || 'development',
    port,
    host,
    baseUrl,
    // prefix: process.env.NODE_ENV === 'production' ? '/' : '/api/v1',
    prefix: '/api/v1',
    uploadPath: process.env.UPLOAD_PATH || 'images',
    uploadPathTemp: process.env.UPLOAD_PATH_TEMP || 'temp',
    logLevel: process.env.LOG_LEVEL || 'info',
  },
  database: {
    uri: process.env.DB_ADDRESS || 'mongodb://127.0.0.1:27017/weblarek',
  },
  auth: {
    // Используем parseDurationToMs для преобразования и обработки строк типа '7d', чисел и значений по умолчанию
    refreshTokenExpiry: parseDurationToMs(process.env.AUTH_REFRESH_TOKEN_EXPIRY, 3600000 * 24 * 7),
    accessTokenExpiry: parseDurationToMs(process.env.AUTH_ACCESS_TOKEN_EXPIRY, 3600000 * 24),
    secret: process.env.AUTH_SECRET || 'your_secret_key',
    csrfSecret: process.env.AUTH_CSRF_SECRET || 'your_csrf_secret_key',
  },
};
