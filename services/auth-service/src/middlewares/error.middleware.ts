import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  errors?: any;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  console.error(`❌ [Error ${status}] ${message}`, err.errors || '');

  res.status(status).json({
    success: false,
    message,
    errors: err.errors || null,
  });
};
