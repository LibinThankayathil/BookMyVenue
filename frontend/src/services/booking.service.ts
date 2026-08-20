import apiClient from "./api-client";

export const bookingService = {
  /**
   * Fetch all bookings for the current user
   */
  getBookings: async (params?: Record<string, any>) => {
    const response = await apiClient.get("/bookings", { params });
    return response.data;
  },

  /**
   * Fetch booking details by ID
   */
  getBookingById: async (id: string) => {
    const response = await apiClient.get(`/bookings/${id}`);
    return response.data;
  },

  /**
   * Check availability for a specific venue and time slot
   */
  checkAvailability: async (venueId: string, startTime: string, endTime: string) => {
    const response = await apiClient.get("/bookings/availability", {
      params: { venueId, startTime, endTime }
    });
    return response.data;
  },

  /**
   * Create a new booking
   */
  createBooking: async (payload: Record<string, any>) => {
    const response = await apiClient.post("/bookings", payload);
    return response.data;
  },

  /**
   * Cancel or delete a booking
   */
  cancelBooking: async (id: string) => {
    const response = await apiClient.delete(`/bookings/${id}`);
    return response.data;
  },

  /**
   * Reschedule an existing booking
   */
  rescheduleBooking: async (id: string, bookingDate: string, startTime: string, endTime: string) => {
    const response = await apiClient.patch(`/bookings/${id}/reschedule`, {
      bookingDate,
      startTime,
      endTime
    });
    return response.data;
  },

  /**
   * Simulate confirming a booking via webhook trigger
   */
  confirmBooking: async (bookingId: string, paymentId: string) => {
    const response = await apiClient.post("/bookings/webhook", {
      event: "payment.succeeded",
      data: {
        bookingId,
        paymentId
      }
    });
    return response.data;
  },

  /**
   * Initiate a Razorpay payment order for a booking
   */
  createPaymentOrder: async (bookingId: string) => {
    const response = await apiClient.post(`/bookings/${bookingId}/payment/order`);
    return response.data;
  },

  /**
   * Cryptographically verify a Razorpay payment transaction on the server
   */
  verifyPayment: async (
    bookingId: string,
    payload: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    },
  ) => {
    const response = await apiClient.post(`/bookings/${bookingId}/payment/verify`, payload);
    return response.data;
  },
};

export default bookingService;
