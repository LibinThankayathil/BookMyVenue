import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, CreditCard, Landmark, Smartphone, Check, Ban, Star, Building2 } from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getVenueById } from "@/lib/venues/api";

type ReservePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ReservePageProps): Promise<Metadata> {
  const { id } = await params;
  const venue = await getVenueById(id);
  if (!venue) return { title: "Not Found" };
  return {
    title: `Confirm and pay | ${venue.name}`,
  };
}

export default async function ReservePage({ params }: ReservePageProps) {
  const { id } = await params;
  const venue = await getVenueById(id);

  if (!venue) {
    notFound();
  }

  // Format currency
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const days = 1;
  const venuePrice = venue.pricePerDay * days;
  const cleaningFee = 5000;
  const serviceFee = 2500;
  const gst = Math.round((venuePrice + cleaningFee + serviceFee) * 0.18);
  const total = venuePrice + cleaningFee + serviceFee + gst;

  return (
    <div className="flex min-h-screen flex-col bg-[#F9F9F9] font-sans antialiased">
      {/* Minimal Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border-subtle px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary-container">
            <Building2 className="size-4 fill-white text-white" />
          </div>
          <span className="text-xl font-bold text-on-surface">
            BookMy<span className="text-primary-container">Venue</span>
          </span>
        </Link>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-12 md:px-8">
        <div className="mb-8">
          <Link 
            href={`/venues/${venue.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 hover:underline mb-6"
          >
            <ChevronLeft className="size-4" />
            Back to venue
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Confirm and pay</h1>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left Column */}
          <div className="flex flex-col gap-8 lg:col-span-7">
            {/* Your Trip */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">Your Trip</h2>
              
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Dates</h3>
                  <p className="text-gray-500">Oct 24, 2024</p>
                </div>
                <button className="text-sm font-semibold text-gray-900 underline underline-offset-2 hover:text-gray-700">
                  Edit
                </button>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Guests</h3>
                  <p className="text-gray-500">150 guests</p>
                </div>
                <button className="text-sm font-semibold text-gray-900 underline underline-offset-2 hover:text-gray-700">
                  Edit
                </button>
              </div>
            </section>

            {/* Pay with */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">Pay with</h2>

              <div className="flex flex-col gap-4">
                {/* Credit Card Option - Expanded */}
                <div className="rounded-xl border border-primary-container bg-primary-container/5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-4 items-center justify-center rounded-full border-[5px] border-primary-container bg-white"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Credit or Debit Card</p>
                      <p className="text-xs text-gray-500">Visa, Mastercard, Amex</p>
                    </div>
                    <CreditCard className="size-6 text-gray-400" />
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                    <Input 
                      placeholder="Card number" 
                      className="bg-white border-gray-200"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input 
                        placeholder="Expiration (MM/YY)" 
                        className="bg-white border-gray-200"
                      />
                      <Input 
                        placeholder="CVV" 
                        className="bg-white border-gray-200"
                      />
                    </div>
                  </div>
                </div>

                {/* UPI Option */}
                <div className="rounded-xl border border-gray-200 p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="size-4 rounded-full border border-gray-300 bg-white"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">UPI</p>
                      <p className="text-xs text-gray-500">Google Pay, PhonePe, Paytm</p>
                    </div>
                    <Smartphone className="size-6 text-gray-400" />
                  </div>
                </div>

                {/* Net Banking Option */}
                <div className="rounded-xl border border-gray-200 p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="size-4 rounded-full border border-gray-300 bg-white"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Net Banking</p>
                      <p className="text-xs text-gray-500">All major banks supported</p>
                    </div>
                    <Landmark className="size-6 text-gray-400" />
                  </div>
                </div>
              </div>
            </section>

            {/* Cancellation Policy */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Cancellation Policy</h2>
              <p className="text-gray-700 mb-2 leading-relaxed">
                <span className="font-semibold text-gray-900">Free cancellation before Oct 10.</span> Cancel before check-in on Oct 24 for a partial refund. Review the host&apos;s full cancellation policy for details on non-refundable fees.
              </p>
              <button className="text-sm font-semibold text-gray-900 underline underline-offset-2 hover:text-gray-700">
                Read more
              </button>
            </section>

            {/* Ground Rules */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Ground Rules</h2>
              <p className="text-gray-700 mb-6">
                We ask every guest to remember a few simple things about what makes a great guest.
              </p>
              <ul className="flex flex-col gap-4 text-gray-700">
                <li className="flex items-center gap-3">
                  <Check className="size-5" />
                  Follow the house rules
                </li>
                <li className="flex items-center gap-3">
                  <Check className="size-5" />
                  Treat your host&apos;s home like your own
                </li>
                <li className="flex items-center gap-3">
                  <Ban className="size-5" />
                  No smoking inside the premises
                </li>
              </ul>
            </section>
          </div>

          {/* Right Column - Summary Card */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              {/* Venue Summary */}
              <div className="flex gap-4 mb-6">
                <img 
                  src={venue.images.main} 
                  alt={venue.name} 
                  className="size-24 rounded-lg object-cover"
                />
                <div className="flex flex-col justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{venue.name}</h3>
                    <p className="text-sm text-gray-500">Entire Venue</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-gray-900">
                    <Star className="size-3.5 fill-current text-gray-900" />
                    {venue.rating} <span className="font-normal text-gray-500">({venue.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>

              <Separator className="mb-6 border-gray-200" />

              {/* Price Details */}
              <h3 className="mb-4 text-xl font-semibold text-gray-900">Price details</h3>
              <div className="flex flex-col gap-4 text-gray-700">
                <div className="flex justify-between">
                  <span>{formatINR(venue.pricePerDay)} x {days} day</span>
                  <span>{formatINR(venuePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cleaning Fee</span>
                  <span>{formatINR(cleaningFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span>{formatINR(serviceFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span>{formatINR(gst)}</span>
                </div>
              </div>

              <Separator className="my-6 border-gray-200" />

              {/* Total */}
              <div className="mb-6 flex justify-between items-center text-gray-900">
                <span className="text-2xl font-bold">Total (INR)</span>
                <span className="text-2xl font-bold">{formatINR(total)}</span>
              </div>

              <Button size="lg" className="w-full rounded-full bg-primary-container py-6 text-label-md text-white shadow-lg shadow-primary-container/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-secondary-container active:scale-[0.98]">
                Confirm & Pay
              </Button>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
