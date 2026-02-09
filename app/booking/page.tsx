"use client";

import React, { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// --- TYPES ---
interface User {
  id: number;
  name: string;
  email: string;
  walletBalance: number;
}

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- URL PARAMS ---
  const tripName = searchParams.get('name') || "Mystery Trip";
  // Default price if missing
  const basePrice = parseInt(searchParams.get('price') || '15000');

  // --- STATE ---
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Success
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Payment State
  const [useWallet, setUseWallet] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'upi'>('card');
  const [bookingType, setBookingType] = useState<'paid' | 'reserved'>('paid');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    guests: 1
  });

  // --- INITIALIZATION ---
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Pre-fill known data
        setFormData(prev => ({
          ...prev,
          name: parsedUser.name || '',
          email: parsedUser.email || ''
        }));
      } catch (e) {
        console.error("User Parse Error");
      }
    }
  }, []);

  // --- CALCULATIONS ---
  // Discount is only applied if paying now (not reserve later)
  const walletDiscount = (useWallet && user) ? Math.min(user.walletBalance, basePrice) : 0;
  const finalPrice = Math.max(0, basePrice - walletDiscount);
  const pointsToEarn = Math.floor(finalPrice * 0.05); // 5% Reward

  // --- HANDLERS ---
  const handleNext = () => {
    if (!formData.name || !formData.email || !formData.date || !formData.phone) {
      alert("Please fill in all details to continue.");
      return;
    }
    setStep(2);
  };

  const processBooking = async (type: 'paid' | 'reserved') => {
    setLoading(true);
    setBookingType(type);

    // Simulate Processing Delay
    await new Promise(r => setTimeout(r, 1500));

    try {
      const destinationId = searchParams.get('id');

      // 1. Prepare Payload
      const payload = {
        userId: user?.id || null,
        customerName: formData.name,
        email: formData.email,
        phone: formData.phone,
        destinationName: tripName,
        destinationId: destinationId ? parseInt(destinationId) : 0,
        totalPrice: finalPrice,
        date: formData.date,
        guests: formData.guests,

        status: 'Pending',
        paymentMethod: 'Pay at Property',
        pointsUsed: 0
      };

      // 2. API Call
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Booking API Failed");

      // 3. Success (No local wallet update needed for Pay at Property)

      setStep(3);

    } catch (error) {
      console.error(error);
      alert("Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4 pb-20 font-sans text-gray-900">

      <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-[2rem] shadow-xl border border-gray-100 relative overflow-hidden">

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
          <div
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
          ></div>
        </div>

        {/* --- HEADER --- */}
        <div className="mb-10 mt-2">
          <h1 className="text-3xl font-bold text-gray-900">
            {step === 1 ? "Traveler Details" : step === 2 ? "Confirm & Pay" : "You're Going!"}
          </h1>
          <p className="text-gray-500 mt-1">
            {step === 1 ? "Who is going on this trip?" : step === 2 ? "Choose how you'd like to pay." : "Get your bags ready."}
          </p>
        </div>

        {/* --- STEP 1: FORM --- */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-6">

            {/* Trip Summary Mini-Card */}
            <div className="bg-blue-50 p-5 rounded-2xl flex items-center justify-between border border-blue-100">
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Destination</p>
                <p className="font-bold text-xl text-blue-900">{tripName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Total</p>
                <p className="font-bold text-xl text-blue-900">₹{basePrice.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition focus:bg-white"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition focus:bg-white"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition focus:bg-white"
                placeholder="john@example.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Travel Date</label>
                <input
                  type="date"
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition focus:bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Guests</label>
                <select
                  className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition focus:bg-white appearance-none"
                  onChange={e => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                >
                  {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Person{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 shadow-xl transition transform hover:-translate-y-1"
            >
              Continue to Payment →
            </button>
          </div>
        )}

        {/* --- STEP 2: CONFIRM --- */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-8">

            <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100 flex items-start gap-4">
              <div className="text-2xl">ⓘ</div>
              <div>
                <h3 className="font-bold text-yellow-800">Booking Confirmation</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  You are about to book <strong>{tripName}</strong> for <strong>{formData.guests} guests</strong> on <strong>{new Date(formData.date).toLocaleDateString()}</strong>.
                  <br /><br />
                  No payment is required now. Your booking status will be <strong>Pending</strong> until confirmed by an admin. You can pay at the property.
                </p>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-3">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Base Fare (x{formData.guests})</span>
                <span>₹{basePrice.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-1 flex justify-between items-end">
                <span className="text-gray-900 font-bold">Total Payable at Property</span>
                <span className="text-2xl font-bold text-gray-900">₹{finalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => processBooking('reserved')}
                disabled={loading}
                className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 shadow-xl active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Confirming..." : "Confirm Booking"}
              </button>
            </div>

            <button onClick={() => setStep(1)} className="w-full text-center text-sm text-gray-400 hover:text-gray-600 font-bold mt-2">
              ← Go Back
            </button>
          </div>
        )}

        {/* --- STEP 3: SUCCESS --- */}
        {step === 3 && (
          <div className="text-center py-10 animate-in zoom-in duration-500">
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-sm bg-green-100 text-green-600">
              ✓
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Booking Request Sent!
            </h1>

            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Thank you, {formData.name}. Your booking for <strong>{tripName}</strong> has been placed.
              <br />
              Current Status: <strong>Pending Approval</strong>
            </p>

            <div className="flex flex-col gap-3">
              <Link href="/dashboard" className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-900 shadow-xl transition">
                View in Dashboard
              </Link>
              <Link href="/" className="text-gray-400 font-bold text-sm hover:text-gray-600 p-2">
                Back to Home
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Suspense Wrapper for useSearchParams
export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}