import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../prisma/prisma';
import { RiskScoringService } from '../services/risk-scoring.service';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../config/env';
import axios from 'axios';

// Helper to run serializable transaction with retries
const runSerializableTransaction = async <T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  retries = 3,
): Promise<T> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await prisma.$transaction(fn, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error: any) {
      // P2034: transaction failed due to write conflict or serialization failure
      const isSerializationFailure =
        error.code === 'P2034' || error.message?.includes('40001');
      if (isSerializationFailure && attempt < retries) {
        console.warn(
          `[CONCURRENCY] Serialization conflict on attempt ${attempt}. Retrying...`,
        );
        // Jittered backoff delay before retrying
        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 100),
        );
        continue;
      }
      throw error;
    }
  }
  throw new Error('Transaction failed after maximum retries');
};

export const createBooking = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const userIdStr = req.headers['x-user-id'] as string;
    if (!userIdStr) {
      return res
        .status(401)
        .json({ success: false, message: 'Unauthorized: User ID is missing' });
    }
    const userId = userIdStr;
    const { venueId, bookingDate, startTime, endTime, totalPrice } = req.body;

    if (!venueId || !bookingDate || !startTime || !endTime || !totalPrice) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing required booking fields' });
    }

    const parsedVenueId = venueId;
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid start or end time' });
    }

    // Execute serializable transaction
    const newBooking = await runSerializableTransaction(async (tx) => {
      // 1. The Overlap Check (The Bouncer):
      // SELECT * FROM Bookings WHERE venueId = X AND startDate < RequestedEnd AND endDate > RequestedStart
      // AND (status = 'CONFIRMED' OR (status = 'PENDING_PAYMENT' AND createdAt >= 10 minutes ago))
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

      const overlappingBookings = await tx.booking.findMany({
        where: {
          venueId: parsedVenueId,
          startTime: { lt: end },
          endTime: { gt: start },
          OR: [
            { status: 'CONFIRMED' },
            {
              status: 'PENDING_PAYMENT',
              createdAt: { gte: tenMinutesAgo },
            },
          ],
        },
      });

      if (overlappingBookings.length > 0) {
        throw new Error('SLOT_OCCUPIED');
      }

      // Calculate refund percentage policy based on riskScore
      const riskScore = (req as any).riskScore || 0;
      let refundPercentage = 100.0;
      if (riskScore >= 85) {
        refundPercentage = 0.0; // non-refundable
      } else if (riskScore >= 40) {
        refundPercentage = 50.0; // reduced refund (50%)
      }

      // 2. The Soft Lock: Create the booking with status PENDING_PAYMENT
      // Give the user exactly 10 minutes to finish the payment.
      return await tx.booking.create({
        data: {
          userId,
          venueId: parsedVenueId,
          bookingDate: new Date(bookingDate),
          startTime: start,
          endTime: end,
          totalPrice: new Prisma.Decimal(totalPrice),
          status: 'PENDING_PAYMENT',
          riskScore,
          refundPercentage: new Prisma.Decimal(refundPercentage),
        },
      });
    });

    // Update risk cache asynchronously in the background
    RiskScoringService.updateCache(userId).catch((err) =>
      console.error(
        `[RISK CACHE] Failed to update cache for user ${userId} after booking creation:`,
        err,
      ),
    );

    const { riskScore: _, ...bookingData } = newBooking;

    return res.status(201).json({
      success: true,
      message:
        'Booking request created successfully. Please complete your payment within 10 minutes.',
      data: bookingData,
    });
  } catch (error: any) {
    if (error.message === 'SLOT_OCCUPIED') {
      return res.status(409).json({
        success: false,
        message:
          'The requested time slot is already booked or held for payment by another user.',
      });
    }

    console.error('Error creating booking:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' });
  }
};

export const createPaymentOrder = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const id = req.params.id as string;

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'PENDING_PAYMENT') {
      return res.status(400).json({
        success: false,
        message: `Payment order cannot be created for bookings with status: ${booking.status}`,
      });
    }

    const razorpay = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });

    const amountInPaise = Math.round(Number(booking.totalPrice) * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: booking.id,
      notes: {
        bookingId: booking.id,
        userId: booking.userId,
      },
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentId: order.id },
    });

    return res.status(200).json({
      success: true,
      key: env.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      orderId: order.id,
      bookingId: booking.id,
    });
  } catch (error: any) {
    console.error('Error creating Razorpay Order:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment order',
    });
  }
};

export const verifyPayment = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const id = req.params.id as string;
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification details',
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: 'Booking not found' });
    }

    if (booking.status === 'CONFIRMED') {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified and booking confirmed',
      });
    }

    if (booking.status !== 'PENDING_PAYMENT') {
      return res.status(400).json({
        success: false,
        message: `Verification failed. Booking status is ${booking.status}`,
      });
    }

    if (booking.paymentId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment details. Order ID mismatch.',
      });
    }

    const generatedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Signature mismatch.',
      });
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CONFIRMED',
        paymentId: razorpay_payment_id,
        paymentMetadata: {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        },
      },
    });

    RiskScoringService.updateCache(booking.userId).catch((err) =>
      console.error(
        `[RISK CACHE] Failed to update cache for user ${booking.userId} after payment verification:`,
        err,
      ),
    );

    return res.status(200).json({
      success: true,
      message: 'Payment verified and booking confirmed successfully',
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify payment',
    });
  }
};

export const handleRazorpayWebhook = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    if (!signature) {
      console.warn('[WEBHOOK] Missing x-razorpay-signature header');
      return res
        .status(400)
        .json({ success: false, message: 'Missing signature' });
    }

    const rawBody = (req as any).rawBody;
    if (!rawBody) {
      console.error('[WEBHOOK] Raw body not captured');
      return res
        .status(400)
        .json({ success: false, message: 'Raw body missing' });
    }

    // Cryptographic Signature Validation
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.warn('[WEBHOOK] Signature mismatch');
      return res
        .status(400)
        .json({ success: false, message: 'Signature mismatch' });
    }

    const { event, payload } = req.body;
    console.log(`[WEBHOOK] Verified webhook event: ${event}`);

    // Process only payment capture events (payments successfully charged)
    if (event !== 'payment.captured') {
      return res.status(200).json({ success: true, status: 'ignored_event' });
    }

    const payment = payload?.payment?.entity;
    if (!payment) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid payload structure' });
    }

    const razorpay_order_id = payment.order_id;
    const razorpay_payment_id = payment.id;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ success: false, message: 'Missing IDs' });
    }

    // Locate the booking by Razorpay Order ID
    const booking = await prisma.booking.findFirst({
      where: { paymentId: razorpay_order_id },
    });

    if (!booking) {
      console.warn(
        `[WEBHOOK] No booking found for order ID: ${razorpay_order_id}`,
      );
      return res
        .status(404)
        .json({ success: false, message: 'Booking not found' });
    }

    // Idempotency: Payment has already been verified and confirmed
    if (booking.status === 'CONFIRMED') {
      return res
        .status(200)
        .json({ success: true, message: 'Booking already confirmed' });
    }

    if (booking.status !== 'PENDING_PAYMENT') {
      return res.status(400).json({
        success: false,
        message: `Booking state is ${booking.status}, cannot confirm.`,
      });
    }

    // Update status to CONFIRMED and map paymentId to the actual Captured Payment ID
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CONFIRMED',
        paymentId: razorpay_payment_id,
        paymentMetadata: {
          razorpay_order_id,
          razorpay_payment_id,
          event,
        },
      },
    });

    RiskScoringService.updateCache(booking.userId).catch((err) =>
      console.error(
        `[RISK CACHE] Failed to update cache for user ${booking.userId} after webhook:`,
        err,
      ),
    );

    return res.status(200).json({
      success: true,
      message: 'Booking confirmed successfully via webhook',
    });
  } catch (error: any) {
    console.error('[WEBHOOK] Error handling webhook:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * Webhook handler to confirm a booking on successful payment.
 * Supports Stripe or Razorpay format payloads.
 */
export const handleWebhook = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { event, data } = req.body;

    console.log(
      `[PAYMENT WEBHOOK] Received event: ${event}`,
      JSON.stringify(data),
    );

    // Handle payment succeeded events
    // Usually Stripe uses event: 'payment_intent.succeeded' or 'charge.succeeded' or 'checkout.session.completed'
    // Razorpay uses event: 'payment.captured'
    // We will support simple payment succeeded events, or accept any if matched
    const isSuccessEvent =
      event === 'payment.succeeded' ||
      event === 'payment_intent.succeeded' ||
      event === 'charge.succeeded' ||
      event === 'checkout.session.completed' ||
      event === 'payment.captured';

    if (!isSuccessEvent) {
      return res.status(200).json({ received: true, status: 'ignored_event' });
    }

    // Extract bookingId and paymentId
    // Standardize finding the bookingId and paymentId from body:
    let bookingId = data?.bookingId;
    const paymentId = data?.paymentId || data?.id; // Stripe checkout session id, charge id or payment intent id

    // If metadata contains bookingId, use it
    if (data?.metadata?.bookingId) {
      bookingId = String(data.metadata.bookingId);
    } else if (data?.object?.metadata?.bookingId) {
      bookingId = String(data.object.metadata.bookingId);
    }

    if (!bookingId) {
      console.error('[PAYMENT WEBHOOK] Missing bookingId in payload');
      return res
        .status(400)
        .json({ success: false, message: 'Missing bookingId' });
    }

    const parsedBookingId = String(bookingId);

    // Find the booking to get its userId for cache updating
    const bookingToConfirm = await prisma.booking.findUnique({
      where: { id: parsedBookingId },
    });

    if (!bookingToConfirm) {
      return res.status(404).json({
        success: false,
        message: `Booking with ID ${parsedBookingId} not found`,
      });
    }

    if (bookingToConfirm.status !== 'PENDING_PAYMENT') {
      if (bookingToConfirm.status === 'CONFIRMED') {
        console.log(
          `[PAYMENT WEBHOOK] Booking ${parsedBookingId} was already confirmed`,
        );
        return res
          .status(200)
          .json({ success: true, message: 'Booking already confirmed' });
      }
      console.warn(
        `[PAYMENT WEBHOOK] Booking ${parsedBookingId} status is ${bookingToConfirm.status}, cannot confirm.`,
      );
      return res.status(400).json({
        success: false,
        message: `Booking status is ${bookingToConfirm.status}, cannot be confirmed.`,
      });
    }

    // Hard Lock: Update status from PENDING_PAYMENT to CONFIRMED
    await prisma.booking.update({
      where: { id: parsedBookingId },
      data: {
        status: 'CONFIRMED',
        paymentId: paymentId ? String(paymentId) : `pay_mock_${Date.now()}`,
        paymentMetadata: data || {},
      },
    });

    // Update risk cache asynchronously in the background
    RiskScoringService.updateCache(bookingToConfirm.userId).catch((err) =>
      console.error(
        `[RISK CACHE] Failed to update cache for user ${bookingToConfirm.userId} after webhook confirmation:`,
        err,
      ),
    );

    console.log(
      `[PAYMENT WEBHOOK] Booking ${parsedBookingId} hard-locked (status updated to CONFIRMED).`,
    );
    return res.status(200).json({
      success: true,
      message: 'Booking confirmed successfully',
    });
  } catch (error) {
    console.error('[PAYMENT WEBHOOK] Error handling webhook:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' });
  }
};

export const checkAvailability = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { venueId, startTime, endTime } = req.query;

    if (!venueId || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message:
          'Missing required query parameters: venueId, startTime, endTime',
      });
    }

    const parsedVenueId = venueId as string;
    const start = new Date(startTime as string);
    const end = new Date(endTime as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid start or end time' });
    }

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const overlappingBookings = await prisma.booking.findMany({
      where: {
        venueId: parsedVenueId,
        startTime: { lt: end },
        endTime: { gt: start },
        OR: [
          { status: 'CONFIRMED' },
          {
            status: 'PENDING_PAYMENT',
            createdAt: { gte: tenMinutesAgo },
          },
        ],
      },
    });

    return res.status(200).json({
      success: true,
      available: overlappingBookings.length === 0,
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' });
  }
};

export const getBookingById = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params;
    const parsedId = id as string;

    if (!parsedId) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid booking ID' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: parsedId },
    });

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: 'Booking not found' });
    }

    const { riskScore: _, ...bookingData } = booking;
    return res.status(200).json({
      success: true,
      data: bookingData,
    });
  } catch (error) {
    console.error('Error fetching booking by id:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' });
  }
};

export const getBookings = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const userIdStr = req.headers['x-user-id'] as string;
    if (!userIdStr) {
      return res
        .status(401)
        .json({ success: false, message: 'Unauthorized: User ID is missing' });
    }
    const userId = userIdStr;

    const bookings = await prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const bookingsData = bookings.map(({ riskScore: _, ...b }) => b);
    return res.status(200).json({
      success: true,
      data: bookingsData,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' });
  }
};

export const getOwnerDashboard = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    // Extract authenticated owner's user ID
    const ownerUserId = req.headers['x-user-id'] as string;
    if (!ownerUserId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User ID is missing',
      });
    }

    // Fetch venues owned by this owner from venue-service
    let ownedVenues: any[] = [];
    try {
      const venuesRes = await axios.get(`${env.VENUE_SERVICE_URL}/venues/my-venues`, {
        headers: {
          'x-user-id': ownerUserId,
          'x-user-roles': req.headers['x-user-roles'] || '',
        },
        timeout: 5000,
      });
      ownedVenues = venuesRes.data?.data || [];
    } catch (err: any) {
      console.error('Failed to fetch owned venues for dashboard:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch venue ownership data',
      });
    }

    const ownedVenueIds = ownedVenues.map((v: any) => String(v.id));

    // If venueIds are provided as a filter, validate they're all owned by this owner
    const venueIdsQuery = req.query.venueIds as string | undefined;
    let venueIds = ownedVenueIds;
    if (venueIdsQuery) {
      const requestedIds = venueIdsQuery.split(',');
      // Ensure all requested IDs are in the owned set
      const unauthorized = requestedIds.filter((id) => !ownedVenueIds.includes(id));
      if (unauthorized.length > 0) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not own one or more of the requested venues',
        });
      }
      venueIds = requestedIds;
    }

    // Fetch all bookings for the owned venues
    const allBookings = await prisma.booking.findMany({
      where: { venueId: { in: venueIds } },
      orderBy: { createdAt: 'desc' },
    });

    let totalRevenue = 0;
    let activeBookings = 0;
    let pendingInquiries = 0;

    allBookings.forEach((b) => {
      if (b.status === 'CONFIRMED') {
        totalRevenue += Number(b.totalPrice);
        activeBookings += 1;
      } else if (b.status === 'PENDING_PAYMENT') {
        pendingInquiries += 1;
      }
    });

    // Recent bookings (last 5 created)
    const recentBookings = allBookings.slice(0, 5);

    // Upcoming events (next 5 confirmed bookings based on startTime)
    const now = new Date();
    const upcomingEvents = [...allBookings]
      .filter((b) => b.status === 'CONFIRMED' && new Date(b.startTime) >= now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 5);

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        activeBookings,
        pendingInquiries,
        recentBookings,
        upcomingEvents,
      },
    });
  } catch (error: any) {
    console.error('Error fetching owner dashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch owner dashboard data',
    });
  }
};

export const getOwnerBookings = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    // Extract authenticated owner's user ID
    const ownerUserId = req.headers['x-user-id'] as string;
    if (!ownerUserId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User ID is missing',
      });
    }

    // Fetch venues owned by this owner from venue-service
    let ownedVenues: any[] = [];
    try {
      const venuesRes = await axios.get(`${env.VENUE_SERVICE_URL}/venues/my-venues`, {
        headers: {
          'x-user-id': ownerUserId,
          'x-user-roles': req.headers['x-user-roles'] || '',
        },
        timeout: 5000,
      });
      ownedVenues = venuesRes.data?.data || [];
    } catch (err: any) {
      console.error('Failed to fetch owned venues for bookings:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch venue ownership data',
      });
    }

    const ownedVenueIds = ownedVenues.map((v: any) => String(v.id));

    // If venueIds are provided as a filter, validate they're all owned by this owner
    const venueIdsQuery = req.query.venueIds as string | undefined;
    let venueIds = ownedVenueIds;
    if (venueIdsQuery) {
      const requestedIds = venueIdsQuery.split(',');
      // Ensure all requested IDs are in the owned set
      const unauthorized = requestedIds.filter((id) => !ownedVenueIds.includes(id));
      if (unauthorized.length > 0) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not own one or more of the requested venues',
        });
      }
      venueIds = requestedIds;
    }

    const bookings = await prisma.booking.findMany({
      where: { venueId: { in: venueIds } },
      orderBy: { startTime: 'asc' },
    });

    const bookingsData = bookings.map(({ riskScore: _, ...b }) => b);

    return res.status(200).json({
      success: true,
      data: bookingsData,
    });
  } catch (error: any) {
    console.error('Error fetching owner bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch owner bookings',
    });
  }
};



export const cancelBooking = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params;
    const userIdStr = req.headers['x-user-id'] as string;
    if (!userIdStr) {
      return res
        .status(401)
        .json({ success: false, message: 'Unauthorized: User ID is missing' });
    }
    const userId = userIdStr;
    const parsedId = id as string;

    if (!parsedId) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid booking ID' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: parsedId },
    });

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: 'Booking not found' });
    }

    // Authorization Check: User must own the booking
    if (booking.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to cancel this booking',
      });
    }

    // Check status: Can only cancel CONFIRMED or PENDING_PAYMENT bookings
    if (booking.status === 'CANCELLED') {
      return res
        .status(400)
        .json({ success: false, message: 'Booking is already cancelled' });
    }
    if (booking.status === 'FAILED') {
      return res
        .status(400)
        .json({ success: false, message: 'Cannot cancel a failed booking' });
    }

    // Business Rule: Cancellations not allowed within 24 hours of booking start
    const now = new Date();
    const timeDiff = booking.startTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff < 24) {
      return res.status(400).json({
        success: false,
        message:
          'Cancellations are not allowed within 24 hours of the booking start time to protect venue business.',
      });
    }

    // Calculate Refund
    const refundPct = Number(booking.refundPercentage);
    const refundAmount = (Number(booking.totalPrice) * refundPct) / 100;

    // Update booking status to CANCELLED
    const updatedBooking = await prisma.booking.update({
      where: { id: parsedId },
      data: {
        status: 'CANCELLED',
      },
    });

    const { riskScore: _, ...updatedBookingData } = updatedBooking;
    return res.status(200).json({
      success: true,
      message: `Booking cancelled successfully. Refund of ₹${refundAmount.toFixed(2)} (${refundPct}% of ₹${Number(booking.totalPrice).toFixed(2)}) will be processed.`,
      data: {
        booking: updatedBookingData,
        refundAmount,
        refundPercentage: refundPct,
      },
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' });
  }
};

export const rescheduleBooking = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params;
    const userIdStr = req.headers['x-user-id'] as string;
    if (!userIdStr) {
      return res
        .status(401)
        .json({ success: false, message: 'Unauthorized: User ID is missing' });
    }
    const userId = userIdStr;
    const parsedId = id as string;
    const { bookingDate, startTime, endTime } = req.body;

    if (!bookingDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message:
          'Missing required rescheduling parameters: bookingDate, startTime, endTime',
      });
    }

    if (!parsedId) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid booking ID' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: parsedId },
    });

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: 'Booking not found' });
    }

    // Authorization Check: User must own the booking
    if (booking.userId !== userId) {
      return res.status(403).json({
        success: false,
        message:
          'Forbidden: You do not have permission to reschedule this booking',
      });
    }

    // Check status: Can only reschedule CONFIRMED or PENDING_PAYMENT bookings
    if (booking.status === 'CANCELLED' || booking.status === 'FAILED') {
      return res.status(400).json({
        success: false,
        message: `Cannot reschedule a ${booking.status.toLowerCase()} booking`,
      });
    }

    // Business Rule: Rescheduling not allowed within 24 hours of booking start
    const now = new Date();
    const timeDiff = booking.startTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff < 24) {
      return res.status(400).json({
        success: false,
        message:
          'Rescheduling is not allowed within 24 hours of the booking start time.',
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid new start or end time' });
    }

    // Ensure the new date is in the future
    if (start.getTime() <= now.getTime()) {
      return res.status(400).json({
        success: false,
        message: 'New booking time must be in the future',
      });
    }

    // Check overlap for the new timeslot (excluding this booking itself)
    const newBooking = await runSerializableTransaction(async (tx) => {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

      const overlappingBookings = await tx.booking.findMany({
        where: {
          venueId: booking.venueId,
          id: { not: parsedId }, // Exclude the current booking
          startTime: { lt: end },
          endTime: { gt: start },
          OR: [
            { status: 'CONFIRMED' },
            {
              status: 'PENDING_PAYMENT',
              createdAt: { gte: tenMinutesAgo },
            },
          ],
        },
      });

      if (overlappingBookings.length > 0) {
        throw new Error('SLOT_OCCUPIED');
      }

      return await tx.booking.update({
        where: { id: parsedId },
        data: {
          bookingDate: new Date(bookingDate),
          startTime: start,
          endTime: end,
        },
      });
    });

    const { riskScore: _, ...newBookingData } = newBooking;
    return res.status(200).json({
      success: true,
      message: 'Booking rescheduled successfully.',
      data: newBookingData,
    });
  } catch (error: any) {
    if (error.message === 'SLOT_OCCUPIED') {
      return res.status(409).json({
        success: false,
        message:
          'The requested new time slot is already booked or held for payment by another user.',
      });
    }
    console.error('Error rescheduling booking:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' });
  }
};

export const getAllBookingsAdmin = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const userRoles = (req.headers['x-user-roles'] as string) || '';
    const roles = userRoles.split(',').map((r) => r.trim());

    if (!roles.includes('ADMIN')) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Admin access required',
      });
    }

    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Backend Enrichment: Fetch users and venues from internal services
    const [usersRes, venuesRes] = await Promise.all([
      axios
        .get(`${env.AUTH_SERVICE_URL}/admin/users`, {
          headers: {
            'x-user-roles': userRoles,
            'x-user-id': req.headers['x-user-id'],
          },
          timeout: 5000,
        })
        .catch((err) => {
          console.error('Failed to fetch internal users for admin bookings:', err.message);
          return null;
        }),
      axios
        .get(`${env.VENUE_SERVICE_URL}/admin/venues`, {
          headers: {
            'x-user-roles': userRoles,
            'x-user-id': req.headers['x-user-id'],
          },
          timeout: 5000,
        })
        .catch((err) => {
          console.error('Failed to fetch internal venues for admin bookings:', err.message);
          return null;
        }),
    ]);

    const users = usersRes?.data?.data || [];
    const venues = venuesRes?.data?.data || [];

    const bookingsData = bookings.map((booking: any) => {
      const { riskScore, paymentMetadata, ...b } = booking;
      const user = users.find((u: any) => u.id.toString() === b.userId);
      const venue = venues.find((v: any) => v.id.toString() === b.venueId);
      
      return {
        ...b,
        userName: user?.fullName || b.userId,
        venueName: venue?.title || b.venueId,
      };
    });

    return res.status(200).json({
      success: true,
      data: bookingsData,
    });
  } catch (error) {
    console.error('Error fetching all bookings for admin:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' });
  }
};
