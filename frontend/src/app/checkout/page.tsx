"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import {
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Star,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Lock,
} from "lucide-react";

import { bookingService } from "@/services/booking.service";
import { getVenueById } from "@/lib/venues/api";
import { useAuth } from "@/components/auth/session-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { Venue } from "@/lib/venues/data";
import { formatVenuePrice } from "@/lib/venues/listing";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const bookingIdParam = searchParams.get("bookingId");
  const bookingId = bookingIdParam ? String(bookingIdParam) : null;

  const [booking, setBooking] = useState<any>(null);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Sync user context name
  useEffect(() => {
    if (user?.fullName && !guestName) {
      setGuestName(user.fullName);
    }
  }, [user, guestName]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/checkout?bookingId=${bookingIdParam || ""}`);
    }
  }, [isAuthenticated, authLoading, bookingIdParam, router]);

  // Fetch Booking and Venue details
  useEffect(() => {
    if (!bookingId || !isAuthenticated) return;

    const fetchData = async () => {
      try {
        setPageLoading(true);
        const bookingRes = await bookingService.getBookingById(bookingId.toString());

        if (bookingRes.success && bookingRes.data) {
          setBooking(bookingRes.data);

          // Fetch venue details
          const venueData = await getVenueById(bookingRes.data.venueId.toString());
          if (venueData) {
            setVenue(venueData);
          } else {
            setError("Venue information could not be retrieved.");
          }
        } else {
          setError(bookingRes.message || "Failed to load booking details.");
        }
      } catch (err: any) {
        console.error("Error loading checkout details:", err);
        setError("An error occurred while loading checkout details. Please check your network.");
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();
  }, [bookingId, isAuthenticated]);

  // Set up 10 minutes soft lock countdown timer
  useEffect(() => {
    if (!booking) return;

    const expiryTime = new Date(booking.createdAt).getTime() + 10 * 60 * 1000;
    
    const updateCountdown = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setTimeLeft(diff);
      if (diff <= 0) {
        clearInterval(timer);
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [booking]);

  // Format countdown minutes and seconds
  const formatTimeLeft = () => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Submit Payment
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId || timeLeft <= 0) return;

    setPayLoading(true);
    setError("");

    try {
      // 1. Fetch Razorpay Order parameters from secure backend
      const orderRes = await bookingService.createPaymentOrder(bookingId);
      if (!orderRes.success || !orderRes.orderId) {
        throw new Error(orderRes.message || "Failed to create payment order");
      }

      // 2. Ensure Razorpay script has registered globally in the browser
      if (typeof (window as any).Razorpay === "undefined") {
        throw new Error("Razorpay SDK failed to load. Please verify your network connection.");
      }

      // 3. Configure Checkout popup properties
      const options = {
        key: orderRes.key,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: "BookMyVenue",
        description: `Booking reservation payment for ${venue?.name || "Venue"}`,
        order_id: orderRes.orderId,
        handler: async (response: any) => {
          try {
            setPayLoading(true);
            setError("");
            
            // 4. Send token parameters to verify server endpoint
            const verifyRes = await bookingService.verifyPayment(bookingId, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              setPaymentSuccess(true);
            } else {
              setError(verifyRes.message || "Payment verification failed. Please try again.");
            }
          } catch (verifyErr: any) {
            console.error("Verification verification error:", verifyErr);
            setError(verifyErr.response?.data?.message || "Failed to confirm payment signature.");
          } finally {
            setPayLoading(false);
          }
        },
        prefill: {
          name: user?.fullName || "",
          email: user?.email || "",
          contact: phoneNumber,
        },
        theme: {
          color: "#0F172A", // Slate Dark Theme
        },
        modal: {
          ondismiss: () => {
            // Restore button trigger state if the user cancels checkout
            setPayLoading(false);
          },
        },
      };

      // 5. Open checkout UI window
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error("Payment setup error:", err);
      setError(err.message || err.response?.data?.message || "An error occurred while launching payment.");
      setPayLoading(false);
    }
  };

  if (authLoading || (pageLoading && !error)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-body-md text-text-muted">Loading secure checkout environment...</p>
      </div>
    );
  }

  if (error || !bookingId) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="text-headline-sm font-bold text-on-surface mb-3">Checkout Issue</h1>
        <p className="text-body-md text-text-muted mb-8">{error || "Invalid booking ID or parameters."}</p>
        <Button asChild className="rounded-full bg-primary text-white">
          <Link href="/venues">Return to Venues</Link>
        </Button>
      </div>
    );
  }

  if (timeLeft <= 0) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <Clock className="h-6 w-6" />
        </div>
        <h1 className="text-headline-sm font-bold text-on-surface mb-3">Booking Hold Expired</h1>
        <p className="text-body-md text-text-muted mb-8">
          The 10-minute temporary reservation hold on this venue slot has expired. The slot has been released back to availability.
        </p>
        <Button asChild className="rounded-full bg-primary text-white">
          <Link href={venue ? `/venues/${venue.id}` : "/venues"}>Try Booking Again</Link>
        </Button>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-md">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="font-display text-headline-md font-bold text-on-surface mb-3">Booking Confirmed!</h1>
        <p className="text-body-lg text-emerald-700 font-semibold mb-2">Payment Secured & Verified Successfully</p>
        <p className="text-body-md text-text-muted mb-8">
          Your reservation for <strong className="text-on-surface">{venue?.name}</strong> has been officially confirmed in our records. Your entry credentials and digital receipt have been sent to your registered email address.
        </p>

        <Card className="mb-8 border border-border-subtle bg-stone-50/50 text-left">
          <CardContent className="p-6 flex flex-col gap-4 text-sm text-stone-700">
            <div className="flex justify-between">
              <span className="text-text-muted">Booking Reference ID:</span>
              <span className="font-mono font-bold text-on-surface">#BMV-{bookingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Total Amount Paid:</span>
              <span className="font-bold text-on-surface">{formatVenuePrice(Number(booking.totalPrice))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Risk-Adjusted Refund Eligibility:</span>
              <span className="font-semibold text-primary">{Number(booking.refundPercentage)}% Refund Option</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild className="rounded-full bg-primary py-3 px-6 text-white hover:bg-orange-650">
            <Link href="/user/bookings">View My Bookings</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Formatting date for human-readable display
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Formatting time slot range
  const formatTimeSlot = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    
    const formatTime = (d: Date) => {
      const h = d.getHours();
      const m = d.getMinutes();
      const ampm = h >= 12 ? "PM" : "AM";
      const displayH = h % 12 || 12;
      const displayM = m.toString().padStart(2, "0");
      return `${displayH}:${displayM} ${ampm}`;
    };

    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  const calculatedBasePrice = venue?.pricingType === "PER_SESSION" ? Number(booking.totalPrice) : (venue?.basePrice || 0);
  const totalTax = Number(booking.totalPrice) * 0.18; // 18% GST
  const serviceFee = Number(booking.totalPrice) * 0.05; // 5% Service Fee
  const finalTotal = Number(booking.totalPrice) + totalTax + serviceFee;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-8">
      {/* Back to venue details */}
      <Link
        href={venue ? `/venues/${venue.id}` : "/venues"}
        className="mb-8 flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-on-surface"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Venue Detail
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* LEFT COLUMN: Payment details */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* soft lock timer card */}
          <div className="flex items-center justify-between rounded-xl bg-orange-50 border border-orange-200/50 p-4 text-orange-800">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary shrink-0 animate-pulse" />
              <div>
                <p className="text-sm font-semibold">Your reservation slot is temporarily locked</p>
                <p className="text-xs text-orange-700">Complete payment before expiration to guarantee reservation</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-orange-650 uppercase tracking-wider font-semibold">Expires In</p>
              <p className="text-lg font-mono font-bold text-primary">{formatTimeLeft()}</p>
            </div>
          </div>

          <h1 className="font-display text-headline-sm font-bold text-on-surface">Secure Checkout</h1>

          <Card className="rounded-2xl border border-border-subtle bg-surface shadow-elevation-card">
            <CardContent className="p-6">
              <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-6">
                <div>
                  <h2 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Billing & Guest Information
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="guestName">Guest Full Name</Label>
                      <Input
                        id="guestName"
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        required
                        disabled
                        placeholder="John Doe"
                        className="mt-1.5 rounded-xl border-stone-200 focus-visible:ring-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="guestEmail">Email Address</Label>
                      <Input
                        id="guestEmail"
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="mt-1.5 rounded-xl bg-stone-50 border-stone-200 text-stone-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      placeholder="+91 98765 43210"
                      className="mt-1.5 rounded-xl border-stone-200 focus-visible:ring-primary"
                    />
                  </div>
                </div>

                <Separator className="bg-border-subtle" />

                <div className="rounded-xl border border-stone-250 bg-stone-50/40 p-5">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-650 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-stone-850">Protected by Razorpay Secure</p>
                      <p className="text-xs text-stone-600 leading-relaxed mt-1">
                        All payments are processed securely via Razorpay's PCI-DSS compliant payment gateway. You can pay using UPI, Credit/Debit cards, Net Banking, or Wallets in the next step.
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700 flex items-start gap-2">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={payLoading}
                  className="mt-2 w-full rounded-full bg-primary py-6 text-label-md font-bold text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-655 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {payLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Authorizing Secured Fund Transfer...
                    </span>
                  ) : (
                    <>
                      Confirm & Pay {formatVenuePrice(finalTotal)}
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-text-muted flex items-center justify-center gap-1">
                  <Lock className="h-3 w-3" />
                  Your connection is SSL encrypted. Payments processed securely.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Booking Summary Card */}
        {venue && (
          <div className="lg:col-span-5">
            <Card className="sticky top-32 rounded-2xl border border-border-subtle bg-surface shadow-elevation-floating overflow-hidden">
              {/* Venue header thumbnail */}
              <div className="relative aspect-[16/10] w-full bg-stone-100">
                <Image
                  src={venue.images.main}
                  alt={venue.name}
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                  <div>
                    <h3 className="text-base font-bold font-display">{venue.name}</h3>
                    <p className="text-xs text-stone-200 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {venue.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-xs px-2.5 py-1 text-xs font-semibold">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {venue.rating}
                  </div>
                </div>
              </div>

              <CardContent className="p-6 flex flex-col gap-6">
                <div>
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Booking Particulars</h4>
                  <div className="flex flex-col gap-3.5">
                    <div className="flex items-start gap-3 text-sm text-stone-800">
                      <Calendar className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Event Date</p>
                        <p className="text-xs text-text-muted">{formatDate(booking.bookingDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-stone-800">
                      <Clock className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Selected Hours</p>
                        <p className="text-xs text-text-muted">
                          {formatTimeSlot(booking.startTime, booking.endTime)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-border-subtle" />

                {/* Risk scoring policy alert */}
                <div className="rounded-xl border border-stone-200/60 bg-stone-50/50 p-4 text-xs">
                  <p className="font-bold text-stone-800 mb-1">Planner Cancellation Policy</p>
                  <p className="text-stone-600 leading-relaxed">
                    Based on your verified account history and risk index, this reservation is assigned:{" "}
                    <strong className="text-primary font-bold">{Number(booking.refundPercentage)}% Refund Eligibility</strong> if cancelled up to 24h beforehand.
                  </p>
                </div>

                <Separator className="bg-border-subtle" />

                {/* Final Cost Summary */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>Base Rent ({venue.pricingType === "PER_SESSION" ? "Session" : "Hourly Selection"})</span>
                    <span className="font-medium text-stone-800">{formatVenuePrice(calculatedBasePrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>Service Fee (5%)</span>
                    <span className="font-medium text-stone-800">{formatVenuePrice(serviceFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>Tax (18% GST)</span>
                    <span className="font-medium text-stone-800">{formatVenuePrice(totalTax)}</span>
                  </div>
                  <Separator className="my-1.5 bg-border-subtle" />
                  <div className="flex justify-between text-base font-bold text-on-surface">
                    <span>Total Cost Due</span>
                    <span className="text-lg text-primary">{formatVenuePrice(finalTotal)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-body-md text-text-muted">Loading secure checkout environment...</p>
      </div>
    }>
      <CheckoutContent />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </Suspense>
  );
}
