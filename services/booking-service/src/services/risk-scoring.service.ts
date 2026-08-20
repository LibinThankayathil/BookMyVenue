import { prisma } from '../prisma/prisma';
import { env } from '../config/env';
import { redis } from '../utils/redis';

interface RiskScoreResult {
  score: number;
  factors: {
    cancellationRate: number;
    accountTrust: number;
    concurrentBookings: number;
    paymentTrust: number;
  };
}

interface CachedRiskProfile {
  totalBookings: number;
  cancelledBookings: number;
  totalSpend: number;
}

export class RiskScoringService {
  /**
   * Updates/refreshes the cached risk profile in Redis for a specific user.
   */
  static async updateCache(userId: string): Promise<CachedRiskProfile> {
    const history = await prisma.booking.findMany({
      where: { userId },
    });

    const totalBookings = history.length;
    const cancelledBookings = history.filter(
      (b) => b.status === 'CANCELLED',
    ).length;
    const totalSpend = history
      .filter((b) => b.status === 'CONFIRMED')
      .reduce((sum, b) => sum + Number(b.totalPrice), 0);

    const profile: CachedRiskProfile = {
      totalBookings,
      cancelledBookings,
      totalSpend,
    };

    // Cache in Redis for 1 hour to keep it fresh but highly accessible
    await redis.set(
      `user:${userId}:risk_profile`,
      JSON.stringify(profile),
      3600,
    );
    console.log(
      `[RISK CACHE] Refreshed Redis profile for user ${userId}:`,
      profile,
    );
    return profile;
  }

  /**
   * Evaluates the risk score of a booking request using Hybrid JWT/Redis Architecture.
   * @param userId The ID of the user making the booking
   * @param targetDate The date the user is trying to book
   * @param isKycVerified KYC verification status from custom JWT claims
   * @param accountCreatedAt Account creation timestamp from custom JWT claims
   */
  async calculateRiskScore(
    userId: string,
    targetDate: Date,
    isKycVerified: boolean,
    accountCreatedAt: Date,
  ): Promise<RiskScoreResult> {
    // 1. JWT Claims Evaluation (0ms latency)
    const accountAgeHours =
      (Date.now() - accountCreatedAt.getTime()) / (1000 * 60 * 60);

    // 2. Fetch User Booking History (Fast Redis Cache with DB Fallback)
    let totalBookings = 0;
    let cancelledBookings = 0;
    let totalSpend = 0;

    try {
      const cachedData = await redis.get(`user:${userId}:risk_profile`);
      if (cachedData) {
        const profile = JSON.parse(cachedData) as CachedRiskProfile;
        totalBookings = profile.totalBookings;
        cancelledBookings = profile.cancelledBookings;
        totalSpend = profile.totalSpend;
        console.log(`[RISK CACHE] Cache hit for user ${userId}:`, profile);
      } else {
        console.log(
          `[RISK CACHE] Cache miss for user ${userId}. Querying DB and building cache...`,
        );
        const profile = await RiskScoringService.updateCache(userId);
        totalBookings = profile.totalBookings;
        cancelledBookings = profile.cancelledBookings;
        totalSpend = profile.totalSpend;
      }
    } catch (err: any) {
      console.error(
        `[RISK CACHE] Redis error. Falling back to direct database query:`,
        err.message,
      );
      // Resilient Fallback to direct DB query if Redis connection breaks
      const history = await prisma.booking.findMany({
        where: { userId },
      });
      totalBookings = history.length;
      cancelledBookings = history.filter(
        (b) => b.status === 'CANCELLED',
      ).length;
      totalSpend = history
        .filter((b) => b.status === 'CONFIRMED')
        .reduce((sum, b) => sum + Number(b.totalPrice), 0);
    }

    // 3. Fetch Concurrent Bookings for the target date
    // Normalize targetDate to start and end of day
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const concurrentBookings = await prisma.booking.count({
      where: {
        userId,
        bookingDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          not: 'CANCELLED',
        },
      },
    });

    // --- Factor 1: Cancellation Rate (Weight: 0.35) ---
    // Severity 0: User completes 90%+ of bookings.
    // Severity 100: User cancels > 50% of bookings.
    let cancellationSeverity = 50; // Default medium if not enough data
    if (totalBookings >= 3) {
      const cancellationRate = cancelledBookings / totalBookings;
      if (cancellationRate >= 0.5) {
        cancellationSeverity = 100;
      } else if (cancellationRate <= 0.1) {
        cancellationSeverity = 0;
      } else {
        // Interpolate between 10% (0) and 50% (100)
        cancellationSeverity = ((cancellationRate - 0.1) / 0.4) * 100;
      }
    } else {
      cancellationSeverity = 30; // Mild risk for new users
    }

    // --- Factor 2: Account Trust Profile (Weight: 0.25) ---
    // Severity 0: Account age > 6 months (4320 hours) OR has isKycVerified: true
    // Severity 100: Account age < 48 hours AND isKycVerified: false
    let accountTrustSeverity = 50;
    if (isKycVerified || accountAgeHours > 4320) {
      accountTrustSeverity = 0;
    } else if (accountAgeHours < 48 && !isKycVerified) {
      accountTrustSeverity = 100;
    }

    // --- Factor 3: Concurrent Bookings (Weight: 0.20) ---
    // Severity 0: 1 to 2 bookings for the same target date.
    // Severity 80: 3 or more bookings requested for the exact same target date.
    let concurrentSeverity = 0;
    const requestedConcurrent = concurrentBookings + 1; // including the one being evaluated
    if (requestedConcurrent >= 3) {
      concurrentSeverity = 80;
    }

    // --- Factor 4: Payment Trust History (Weight: 0.20) ---
    // Severity 0: High total historical spend (let's say >= 1000).
    // Severity 100: Zero historical spend / first-time transaction.
    let paymentTrustSeverity = 100;
    if (totalSpend >= 1000) {
      paymentTrustSeverity = 0;
    } else if (totalSpend > 0) {
      // Interpolate between 0 (100) and 1000 (0)
      paymentTrustSeverity = 100 - (totalSpend / 1000) * 100;
    }

    // Calculate final score
    const finalScore =
      0.35 * cancellationSeverity +
      0.25 * accountTrustSeverity +
      0.2 * concurrentSeverity +
      0.2 * paymentTrustSeverity;

    return {
      score: Math.round(finalScore),
      factors: {
        cancellationRate: cancellationSeverity,
        accountTrust: accountTrustSeverity,
        concurrentBookings: concurrentSeverity,
        paymentTrust: paymentTrustSeverity,
      },
    };
  }
}
