import { Request, Response, NextFunction } from 'express';

export class HealthController {
  check = (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json({
        success: true,
        data: {
          status: 'UP',
          service: 'booking-service',
        },
      });
    } catch (err) {
      next(err);
    }
  };
}
