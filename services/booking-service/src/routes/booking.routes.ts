import { Router } from 'express';
import {
  createBooking,
  createPaymentOrder,
  verifyPayment,
  handleRazorpayWebhook,
  handleWebhook,
  checkAvailability,
  getBookingById,
  getBookings,
  cancelBooking,
  rescheduleBooking,
  getAllBookingsAdmin,
  getOwnerDashboard,
  getOwnerBookings,
} from '../controllers/booking.controller';
import { checkBookingRisk } from '../middlewares/risk.middleware';
import { requireOwner } from '../middlewares/auth.middleware';

const router = Router();

// Define the bookings route
router.get('/', getBookings);
router.get('/availability', checkAvailability);
router.get('/admin', getAllBookingsAdmin);
router.get('/owner/dashboard', requireOwner, getOwnerDashboard);
router.get('/owner/bookings', requireOwner, getOwnerBookings);
router.get('/:id', getBookingById);
router.post('/', checkBookingRisk, createBooking);
router.post('/:id/payment/order', createPaymentOrder);
router.post('/:id/payment/verify', verifyPayment);
router.post('/payment/webhook', handleRazorpayWebhook);
router.post('/webhook', handleWebhook);
router.post('/:id/cancel', cancelBooking);
router.delete('/:id', cancelBooking);
router.patch('/:id/reschedule', rescheduleBooking);

export const bookingRoutes = router;
