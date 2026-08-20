import { Request, Response, NextFunction } from 'express';
import { RiskScoringService } from '../services/risk-scoring.service';

const riskScoringService = new RiskScoringService();

export const checkBookingRisk = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const userIdStr = req.headers['x-user-id'] as string;
    if (!userIdStr) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User context missing.',
      });
    }

    const userId = userIdStr;

    const targetDateStr = req.body.bookingDate || req.body.startTime;
    const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();

    const isKycVerified = req.headers['x-user-is-kyc-verified'] === 'true';
    const accountCreatedAtStr = req.headers['x-user-created-at'] as string;
    const accountCreatedAt = accountCreatedAtStr
      ? new Date(accountCreatedAtStr)
      : new Date();

    const riskResult = await riskScoringService.calculateRiskScore(
      userId,
      targetDate,
      isKycVerified,
      accountCreatedAt,
    );

    // Attach risk score to the request for logging or later use
    (req as any).riskScore = riskResult.score;
    (req as any).riskFactors = riskResult.factors;

    next();
  } catch (error) {
    console.error('[RISK ENGINE] Error calculating risk score:', error);
    // Fail-open or Fail-closed? Let's fail-closed for security or pass to next for robustness?
    // Usually risk engines fail-open to not block legit users if the engine is down, but we will pass to error handler.
    next(error);
  }
};
