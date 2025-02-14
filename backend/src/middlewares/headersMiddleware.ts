import helmet from 'helmet';

const securityHeaders = helmet({
  // Настройка HSTS (HTTP Strict Transport Security)
  hsts: {
    maxAge: 31536000, // 1 год
    includeSubDomains: true,// Применять к поддоменам
    preload: true,// Добавить домен в список предварительного загрузки
  },
  // Настройка X-Frame-Options (запрет на размещение в фреймах)
  frameguard: {
    action: 'deny',
  },
  // Настройка фильтрации XSS (защита от атак скросс-сайтинга)
  xssFilter: true,
  // Скрыть заголовок X-Powered-By
  hidePoweredBy: true,
  // Настройка X-Content-Type-Options (запрет на обработку неправильно указанных MIME типов)
  noSniff: true,
  // Настройка CSP (Content Security Policy)
  crossOriginResourcePolicy: false,
});

export default securityHeaders;
