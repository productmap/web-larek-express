import express, { Router } from 'express';
import { getCsrfToken, getUser, login, logout, refresh, register } from '../controllers/auth';
import authMiddleware from '../middlewares/authMiddleware';
import validationMiddleware, { ValidationSchema } from '../middlewares/validationMiddleware';
import { authLimiter } from '../middlewares/rateLimitMiddleware';
import csrfProtection from '../middlewares/csrfMiddleware';

const router: Router = express.Router();
// Схемы валидации
const registerValidationSchema: ValidationSchema = {
  name: {
    required: true,
    type: 'string',
  },
  email: {
    required: true,
    type: 'email',
  },
  password: {
    required: true,
    type: 'password',
    minLength: 6,
  },
};

const loginValidationSchema: ValidationSchema = {
  email: {
    required: true,
    type: 'email',
  },
  password: {
    required: true,
    type: 'password',
  },
};

// Registration
router.post('/register', validationMiddleware(registerValidationSchema), authLimiter, register);

// Login
router.post('/login', validationMiddleware(loginValidationSchema), authLimiter, login);

// Logout
router.post('/logout', logout);

// Get user data
router.get('/user', authMiddleware, csrfProtection, getUser);

// Refresh token
router.post('/refresh', refresh);

// CSRF token endpoint
router.get('/csrf-token', getCsrfToken);

export default router;
