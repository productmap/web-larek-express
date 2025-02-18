import { NextFunction, Request, Response } from 'express';
import Tokens from 'csrf';

const tokens = new Tokens();

const csrfProtection: (req: Request, res: Response, next: NextFunction) => void = (req, res, next) => {
  const csrfToken = req.headers['x-csrf-token'] as string;
  const csrfSecret = req.cookies['csrf-secret'] as string;

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    if (!csrfSecret || !tokens.verify(csrfSecret, csrfToken)) {
      return res.status(401)
        .json({
          success: false,
          message: 'Unauthorized!',
        });
    }
  }

  next();
};

export default csrfProtection;
