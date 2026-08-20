import { RiskScoringService } from '../services/risk-scoring.service';
import { redis } from './redis';
import { prisma } from '../prisma/prisma';

async function runTests() {
  console.log('=== STARTING HYBRID RISK SCORING ENGINE TESTS ===\n');

  // Test 1: Redis In-Memory Fallback validation
  console.log('Test 1: Resilient Redis client validation...');
  const testKey = 'test_user_key';
  const testVal = JSON.stringify({
    totalBookings: 10,
    cancelledBookings: 2,
    totalSpend: 2500,
  });

  await redis.set(testKey, testVal, 10);
  const retrievedVal = await redis.get(testKey);
  if (retrievedVal === testVal) {
    console.log('✔ Redis/In-memory caching verification succeeded!');
  } else {
    console.error('❌ Redis/In-memory caching verification failed!');
  }
  await redis.del(testKey);

  // Test 2: Calculate Risk Score for Low Risk User
  console.log('\nTest 2: Evaluating Low Risk User...');
  const riskScoringService = new RiskScoringService();

  const lowRiskUserCreatedAt = new Date();
  lowRiskUserCreatedAt.setDate(lowRiskUserCreatedAt.getDate() - 200); // 200 days old account

  const lowRiskResult = await riskScoringService.calculateRiskScore(
    '9999', // dummy user ID
    new Date(),
    true, // KycVerified
    lowRiskUserCreatedAt,
  );
  console.log(`Low Risk Score: ${lowRiskResult.score}`);
  console.log('Factors:', lowRiskResult.factors);
  if (lowRiskResult.score < 40) {
    console.log('✔ Low risk score classification succeeded!');
  } else {
    console.error('❌ Low risk score classification failed!');
  }

  // Test 3: Evaluate High Risk User (First-time transaction, unverified, brand new account)
  console.log('\nTest 3: Evaluating High Risk User...');
  const highRiskUserCreatedAt = new Date();
  highRiskUserCreatedAt.setMinutes(highRiskUserCreatedAt.getMinutes() - 30); // 30 minutes old account

  // Seed concurrent bookings to trigger concurrent severity
  const today = new Date();
  await prisma.booking.createMany({
    data: [
      {
        userId: '8888',
        venueId: '1',
        bookingDate: today,
        startTime: new Date(),
        endTime: new Date(),
        totalPrice: 100,
        status: 'PENDING_PAYMENT',
      },
      {
        userId: '8888',
        venueId: '1',
        bookingDate: today,
        startTime: new Date(),
        endTime: new Date(),
        totalPrice: 100,
        status: 'PENDING_PAYMENT',
      },
      {
        userId: '8888',
        venueId: '1',
        bookingDate: today,
        startTime: new Date(),
        endTime: new Date(),
        totalPrice: 100,
        status: 'PENDING_PAYMENT',
      },
    ],
  });

  // Simulate cache profile with cancellations
  const highRiskProfile = {
    totalBookings: 5,
    cancelledBookings: 4,
    totalSpend: 0,
  };
  await redis.set(
    'user:8888:risk_profile',
    JSON.stringify(highRiskProfile),
    60,
  );

  const highRiskResult = await riskScoringService.calculateRiskScore(
    '8888',
    today,
    false, // KycVerified
    highRiskUserCreatedAt,
  );
  console.log(`High Risk Score: ${highRiskResult.score}`);
  console.log('Factors:', highRiskResult.factors);

  // Clean up
  await prisma.booking.deleteMany({
    where: { userId: '8888' },
  });
  await redis.del('user:8888:risk_profile');

  if (highRiskResult.score >= 85) {
    console.log('✔ High risk score classification succeeded!');
  } else {
    console.error('❌ High risk score classification failed!');
  }
  console.log('\n=== HYBRID RISK SCORING ENGINE TESTS COMPLETED ===');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
