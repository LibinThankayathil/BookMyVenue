import { prisma } from '../prisma/prisma';
import jwt from 'jsonwebtoken';
import axios from 'axios';

async function runIntegrationTest() {
  console.log('=== STARTING INTEGRATION RISK SCORING TESTS ===\n');

  const JWT_SECRET = process.env.JWT_SECRET || 'secret';
  const API_GATEWAY_URL = 'http://api-gateway:8000'; // Reachable inside the Docker network

  const highRiskUserId = 'high-risk-test-user-id';
  const lowRiskUserId = 'low-risk-test-user-id';
  const venueId = '349add58-5a43-4871-b7d6-5ff03c71d4ab'; // Existing venue ID from DB

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // 1. Clean up any existing test bookings for these users
  await prisma.booking.deleteMany({
    where: {
      userId: { in: [highRiskUserId, lowRiskUserId] },
    },
  });

  // 2. Generate JWT tokens
  const highRiskToken = jwt.sign(
    {
      sub: highRiskUserId,
      email: 'highrisk@test.com',
      fullName: 'High Risk User',
      roles: ['USER'],
      isKycVerified: false,
      accountCreatedAt: new Date().toISOString(), // Brand new account
    },
    JWT_SECRET,
    { expiresIn: '1h' },
  );

  const lowRiskToken = jwt.sign(
    {
      sub: lowRiskUserId,
      email: 'lowrisk@test.com',
      fullName: 'Low Risk User',
      roles: ['USER'],
      isKycVerified: true,
      accountCreatedAt: new Date(
        Date.now() - 365 * 24 * 60 * 60 * 1000,
      ).toISOString(), // 1 year old account
    },
    JWT_SECRET,
    { expiresIn: '1h' },
  );

  // 3. Seed high risk data: 3 cancelled bookings, and 3 concurrent bookings today
  console.log(
    'Seeding historical and concurrent bookings for high-risk user...',
  );
  await prisma.booking.createMany({
    data: [
      // 3 cancelled historical bookings
      {
        userId: highRiskUserId,
        venueId: venueId,
        bookingDate: new Date('2026-06-01'),
        startTime: new Date('2026-06-01T10:00:00Z'),
        endTime: new Date('2026-06-01T11:00:00Z'),
        totalPrice: 100.0,
        status: 'CANCELLED',
      },
      {
        userId: highRiskUserId,
        venueId: venueId,
        bookingDate: new Date('2026-06-02'),
        startTime: new Date('2026-06-02T10:00:00Z'),
        endTime: new Date('2026-06-02T11:00:00Z'),
        totalPrice: 100.0,
        status: 'CANCELLED',
      },
      {
        userId: highRiskUserId,
        venueId: venueId,
        bookingDate: new Date('2026-06-03'),
        startTime: new Date('2026-06-03T10:00:00Z'),
        endTime: new Date('2026-06-03T11:00:00Z'),
        totalPrice: 100.0,
        status: 'CANCELLED',
      },
      // 3 concurrent bookings today to trigger high concurrent severity
      {
        userId: highRiskUserId,
        venueId: venueId,
        bookingDate: today,
        startTime: new Date(`${todayStr}T08:00:00Z`),
        endTime: new Date(`${todayStr}T09:00:00Z`),
        totalPrice: 100.0,
        status: 'CONFIRMED',
      },
      {
        userId: highRiskUserId,
        venueId: venueId,
        bookingDate: today,
        startTime: new Date(`${todayStr}T09:00:00Z`),
        endTime: new Date(`${todayStr}T10:00:00Z`),
        totalPrice: 100.0,
        status: 'CONFIRMED',
      },
      {
        userId: highRiskUserId,
        venueId: venueId,
        bookingDate: today,
        startTime: new Date(`${todayStr}T10:00:00Z`),
        endTime: new Date(`${todayStr}T11:00:00Z`),
        totalPrice: 100.0,
        status: 'CONFIRMED',
      },
    ],
  });

  // 4. Test High Risk Booking Creation (Should succeed with 201, but with 0% refundPercentage)
  console.log('\n--- Testing High Risk User Booking Creation ---');
  try {
    const response = await axios.post(
      `${API_GATEWAY_URL}/api/bookings`,
      {
        venueId: venueId,
        bookingDate: todayStr,
        startTime: `${todayStr}T14:00:00.000Z`,
        endTime: `${todayStr}T15:00:00.000Z`,
        totalPrice: 150.0,
      },
      {
        headers: {
          Authorization: `Bearer ${highRiskToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (response.status === 201) {
      console.log(
        '✔ Test passed: High risk booking was successfully allowed with 201 Created!',
      );
      console.log(
        'Exposed Risk Score (should be undefined):',
        response.data.data.riskScore,
      );
      if (response.data.data.riskScore === undefined) {
        console.log(
          '✔ Test passed: Correctly hid riskScore from client response!',
        );
      } else {
        console.error(
          '❌ Test failed: Exposed riskScore to client response:',
          response.data.data.riskScore,
        );
      }
      console.log(
        'Refund Percentage Policy:',
        response.data.data.refundPercentage,
      );
      if (Number(response.data.data.refundPercentage) === 0) {
        console.log(
          '✔ Test passed: Correctly applied non-refundable (0%) refund policy!',
        );
      } else {
        console.error(
          '❌ Test failed: Incorrect refund policy applied:',
          response.data.data.refundPercentage,
        );
      }
    } else {
      console.error(
        '❌ Test failed: Unexpected status code:',
        response.status,
        response.data,
      );
    }
  } catch (err: any) {
    console.error(
      '❌ Test failed: High risk booking threw error:',
      err.message,
      err.response?.status,
      err.response?.data,
    );
  }

  // 5. Test Low Risk User (Should succeed with 201)
  console.log('\n--- Testing Low Risk User Booking Creation ---');
  try {
    const response = await axios.post(
      `${API_GATEWAY_URL}/api/bookings`,
      {
        venueId: venueId,
        bookingDate: todayStr,
        startTime: `${todayStr}T16:00:00.000Z`,
        endTime: `${todayStr}T17:00:00.000Z`,
        totalPrice: 150.0,
      },
      {
        headers: {
          Authorization: `Bearer ${lowRiskToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (response.status === 201) {
      console.log(
        '✔ Test passed: Low risk booking succeeded with 201 Created!',
      );
      console.log(
        'Booking details:',
        response.data.data.id,
        'Exposed Risk Score (should be undefined):',
        response.data.data.riskScore,
      );
      if (response.data.data.riskScore === undefined) {
        console.log(
          '✔ Test passed: Correctly hid riskScore from client response!',
        );
      } else {
        console.error(
          '❌ Test failed: Exposed riskScore to client response:',
          response.data.data.riskScore,
        );
      }
    } else {
      console.error(
        '❌ Test failed: Low risk booking returned unexpected status:',
        response.status,
        response.data,
      );
    }
  } catch (err: any) {
    console.error(
      '❌ Test failed: Low risk booking threw error:',
      err.message,
      err.response?.status,
      err.response?.data,
    );
  }

  // Clean up
  console.log('\nCleaning up seeded test bookings...');
  await prisma.booking.deleteMany({
    where: {
      userId: { in: [highRiskUserId, lowRiskUserId] },
    },
  });

  console.log('=== INTEGRATION RISK SCORING TESTS COMPLETED ===');
  process.exit(0);
}

runIntegrationTest().catch((err) => {
  console.error('Integration test script failed:', err);
  process.exit(1);
});
