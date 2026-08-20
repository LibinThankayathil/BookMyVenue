import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body as Record<string, unknown>,
        query: req.query as Record<string, unknown>,
        params: req.params as Record<string, unknown>,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.issues as unknown,
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors:
          error instanceof Error ? error.message : 'Unknown validation error',
      });
      return;
    }
  };
};
