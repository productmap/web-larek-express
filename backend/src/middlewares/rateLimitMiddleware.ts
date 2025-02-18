import rateLimit from 'express-rate-limit';

// Настройка rate limiting для аутентификации
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  limit: 100, // 100 запросов с одного IP
  standardHeaders: true, // Включить стандартные заголовки
  legacyHeaders: false, // Выключить устаревшие заголовки
  handler: (_req, res, _next) => {
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
    });
  },
});
