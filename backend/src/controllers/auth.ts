import { Request, Response } from 'express';
import User, { IUser } from '../models/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Tokens from 'csrf';
import {
  AuthenticatedRequest,
  UserLoginBodyDto,
  UserRegisterBodyDto,
  UserResponse,
  UserResponseToken,
} from '../types/apiTypes';
import validator from 'validator';
import logger from '../utils/logger';
import { config } from '../app.config';

// Генерация токена
const generateToken = (user: IUser, exp: number = config.auth.accessTokenExpiry): string => {
  return jwt.sign({ id: user._id }, config.auth.secret, {
    expiresIn: exp,
  });
};

// Установка куков
const setAuthCookies = (res: Response, user: IUser, accessToken?: string, refreshToken?: string) => {
  const accessTokenToSet = accessToken || generateToken(user, config.auth.accessTokenExpiry as number);
  const refreshTokenToSet = refreshToken || generateToken(user, config.auth.refreshTokenExpiry as number);

  res.cookie('accessToken', accessTokenToSet, {
    httpOnly: true,
    maxAge: config.auth.accessTokenExpiry as number,
    secure: config.app.environment === 'production',
    sameSite: 'lax',
  });
  res.cookie('refreshToken', refreshTokenToSet, {
    httpOnly: true,
    maxAge: config.auth.refreshTokenExpiry as number,
    secure: config.app.environment === 'production',
    sameSite: 'lax',
  });
};

// Регистрация пользователя
export const register = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body as UserRegisterBodyDto;

    // Валидация входных данных
    if (!name || name.trim() === '') {
      res.status(400)
        .json({
          success: false,
          message: 'Name is required',
        });

    }
    if (!email || !validator.isEmail(email)) {
      res.status(400)
        .json({
          success: false,
          message: 'Invalid email format',
        });

    }
    if (!password || password.length < 6) { // Пример: минимальная длина пароля 6 символов
      res.status(400)
        .json({
          success: false,
          message: 'Password is required and must be at least 6 characters long',
        });

    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      passwordHash,
    });
    const user = await newUser.save();
    setAuthCookies(res, user);
    logger.info(`User registered: ${email}`);

    const response: UserResponseToken = {
      success: true,
      user: {
        name: user.name,
        email: user.email,
      },
    };
    res.status(201)
      .json(response);
  } catch (error: any) {
    if (error.code === 11000) {
      logger.error(`Error registering user: ${error.message}`);
      res.status(400)
        .json({
          success: false,
          message: 'Email already in use',
        });
    } else {
      logger.error(`Error registering user: ${error.message}`);
      res.status(500)
        .json({
          success: false,
          message: error.message,
        });
    }
  }
};

// Вход пользователя
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      email,
      password,
    } = req.body as UserLoginBodyDto;
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Invalid login attempt: ${email}`);
      res.status(400)
        .json({
          success: false,
          message: 'Invalid credentials',
        });
      return;
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      logger.warn(`Invalid login attempt: ${email}`);
      res.status(400)
        .json({
          success: false,
          message: 'Invalid credentials',
        });
      return;
    }

    setAuthCookies(res, user);
    logger.info(`User logged in: ${email}`);

    const response: UserResponseToken = {
      success: true,
      user: {
        name: user.name,
        email: user.email,
      },
    };

    res.status(200)
      .json(response);
  } catch (error: any) {
    logger.error(`Error logging in user: ${error.message}`);
    res.status(500)
      .json({
        success: false,
        message: error.message,
      });
  }
};

// Выход пользователя
export const logout = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    logger.info(`User logged out: ${req.user?.email}`);
    // const user = await User.findById(req.user?.id)
    //   .select('email');
    // logger.info(`User logged out2: ${user?.email}`);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('x-csrf-token');
    res.clearCookie('csrf-secret');

    res.status(200)
      .json({
        success: true,
        message: 'Logged out successfully',
      });
  } catch (error: any) {
    logger.error(`Error logging out user: ${error.message}`);
    res.status(500)
      .json({
        success: false,
        message: error.message,
      });
  }
};

// Получение данных пользователя
export const getUser = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id)
      .select('-passwordHash');

    if (!user) {
      res.status(404)
        .json({
          success: false,
          message: 'User not found',
        });
      return;
    }

    const response: UserResponse = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
    };

    res.status(200)
      .json({
        success: true,
        user: response,
      });
  } catch (error: any) {
    res.status(500)
      .json({
        success: false,
        message: error.message,
      });
  }
};

// Обновление токена
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshTokenFromCookie = req.cookies.refreshToken; // Получаем refreshToken из куки

    if (!refreshTokenFromCookie) {
      logger.warn('No refresh token provided');
      res.status(401)
        .json({
          success: false,
          message: 'No refresh token provided',
        });
      return;
    }

    try {
      // Верификация refreshToken
      const decodedRefreshToken = jwt.verify(refreshTokenFromCookie, config.auth.secret) as {
        id: string
      };
      const userId = decodedRefreshToken.id;

      const user = await User.findById(userId);
      if (!user) {
        logger.warn(`Invalid refresh token: user not found for id ${userId}`);
        res.status(401)
          .json({
            success: false,
            message: 'Invalid refresh token',
          });
        return;
      }

      // Генерация НОВЫХ access и refresh токенов (Refresh Token Rotation)
      const newAccessToken = generateToken(user, config.auth.accessTokenExpiry as number);
      const newRefreshToken = generateToken(user, config.auth.refreshTokenExpiry as number);

      // Установка НОВЫХ токенов в куки (заменяем старые)
      setAuthCookies(res, user, newAccessToken, newRefreshToken); // Используем модифицированную setAuthCookies

      logger.info(`Token refreshed for user: ${user.email}`);
      res.status(200)
        .json({ success: true }); // Успешно, клиент получит новые куки
      return;
    } catch (refreshVerifyError: any) {
      // Ошибка верификации refreshToken (просрочен, подделан и т.д.)
      logger.warn(`Invalid refresh token: ${refreshVerifyError.message}`);
      res.status(401)
        .json({
          success: false,
          message: 'Invalid refresh token',
        });
      return;
    }

  } catch (error: any) {
    logger.error(`Error refreshing token: ${error.message}`);
    res.status(500)
      .json({
        success: false,
        message: error.message,
      });
    return;
  }
};

// Получение CSRF-токена
export const getCsrfToken = (_req: Request, res: Response): void => {
  const tokens = new Tokens();
  const csrfSecret = config.auth.csrfSecret;
  const csrfToken = tokens.create(csrfSecret);

  // Устанавливаем HttpOnly cookie
  res.cookie('csrf-secret', csrfSecret, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  // Устанавливаем НЕ-HttpOnly cookie
  res.cookie('csrf-token', csrfToken, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  res.json({ success: true });
};
