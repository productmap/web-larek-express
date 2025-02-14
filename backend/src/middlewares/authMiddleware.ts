import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types/apiTypes';
import { config } from '../app.config';
import logger from '../utils/logger';

const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
):void => {
  // 1. Получаем токен из кук
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
     res.status(401)
      .json({
        success: false,
        message: 'No token provided',
      });
    return
  }

  try {
    // 2. Верифицируем токен
    const decoded = jwt.verify(accessToken, config.auth.secret) as {
      id: string;
      email: string;
    };

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);

    if (error instanceof jwt.TokenExpiredError) {
       res.status(401)
        .json({ message: 'Token expired' });
      return
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401)
        .json({ message: 'Invalid token' });
      return
    }

     res.status(401)
      .json({ message: 'Unauthorized' });
  }
  return
};

export default authMiddleware;
