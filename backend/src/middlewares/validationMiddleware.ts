import { NextFunction, Request, Response } from 'express';
import validator from 'validator';

// Тип для схемы валидации. Можно расширить для более сложных правил.
export type ValidationSchema = {
  [key: string]: {
    required?: boolean;
    type: 'string' | 'number' | 'email' | 'password';
    minLength?: number;
    maxLength?: number;
    isEmail?: boolean;
    // ... другие правила валидации
  };
};

const validationMiddleware = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: { [key: string]: string } = {};

    for (const field in schema) {
      const validationRules = schema[field];
      const value = (req.body as any)[field]; // Предполагаем, что данные в req.body, можно адаптировать

      if (validationRules.required && (value === undefined || value === null || value === '')) {
        errors[field] = `${field} is required`;
        continue; // Переходим к следующему полю, если уже есть ошибка required
      }

      if (value !== undefined && value !== null && value !== '') { // Валидируем только если значение предоставлено (и не required already handled)
        if (validationRules.type === 'string' && typeof value !== 'string') {
          errors[field] = `${field} must be a string`;
        } else if (validationRules.type === 'email' && !validator.isEmail(String(value))) { // String cast for type safety
          errors[field] = `${field} must be a valid email`;
        } else if (validationRules.type === 'password' && typeof value === 'string') {
          if (validationRules.minLength && value.length < validationRules.minLength) {
            errors[field] = `${field} must be at least ${validationRules.minLength} characters long`;
          }
          if (validationRules.maxLength && value.length > validationRules.maxLength) {
            errors[field] = `${field} must be no longer than ${validationRules.maxLength} characters`;
          }
        }
        // ... добавляем другие типы и правила валидации по необходимости ...
      }
    }

    if (Object.keys(errors).length > 0) {
      res.status(400)
        .json({
          success: false,
          message: 'Validation failed',
          errors,
        });
    }

    next(); // Валидация прошла успешно, переходим к следующему middleware/контроллеру
  };
};

export default validationMiddleware;
