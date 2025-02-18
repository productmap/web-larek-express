import multer from 'multer';
import path from 'path';

// Папка для загрузок, теперь используем переменную из конфига (если нужно)
const UPLOADS_FOLDER = path.join(__dirname, '..', 'public', 'uploads');

const storage = multer.diskStorage({
  destination: UPLOADS_FOLDER, // Относительный путь к папке uploads
  filename: (_req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    // Уникальное имя файла на основе timestamp и оригинального имени
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExt);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Ограничение размера файла до 5MB
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif']; // Список разрешенных MIME типов
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Неверный тип файла. Разрешены только изображения (jpeg, png, svg, gif)!'));
    }
  },
});

export default upload;
