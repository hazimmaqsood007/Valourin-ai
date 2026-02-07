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
      // 1. Prepare Payload
      const payload = {
        userId: user?.id || null,
        customerName: formData.name,
        email: formData.email,
        destinationName: tripName,
        totalPrice: finalPrice,
        date: formData.date,
        guests: formData.guests,
        
        // Logic: If paying later, status is Pending and no points used
        status: type === 'paid' ? 'Confirmed' : 'Pending',
        paymentMethod: type === 'paid' 
          ? (walletDiscount > 0 ? `${selectedMethod === 'card' ? 'Credit Card' : 'UPI'} + Wallet` : (selectedMethod === 'card' ? 'Credit Card' : 'UPI')) 
          : 'Pay Later',
        pointsUsed: type === 'paid' ? walletDiscount : 0
      };

      // 2. API Call
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Booking API Failed");

      // 3. Update Local Wallet (Only if Paid Now)
      if (user && type === 'paid') {
        const updatedUser = { 
          ...user, 
          walletBalance: user.walletBalance - walletDiscount + pointsToEarn 
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

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
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition focus:bg-white"
                        placeholder="John Doe"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Phone Number</label>
                    <input 
                        type="tel" 
                        value={formData.phone} 
                        onChange={e => setFormData({...formData, phone: e.target.value})} 
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
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition focus:bg-white"
                    placeholder="john@example.com"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Travel Date</label>
                    <input 
                        type="date" 
                        onChange={e => setFormData({...formData, date: e.target.value})} 
                        className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition focus:bg-white"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Guests</label>
                    <select 
                        className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition focus:bg-white appearance-none"
                        onChange={e => setFormData({...formData, guests: parseInt(e.target.value)})}
                    >
                        {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Person{n > 1 ? 's' : ''}</option>)}
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

        {/* --- STEP 2: PAYMENT --- */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-8">
            
            {/* 1. Wallet Toggle */}
            {user && user.walletBalance > 0 && (
                <div 
                    onClick={() => setUseWallet(!useWallet)}
                    className={`cursor-pointer border-2 p-5 rounded-2xl flex items-center justify-between transition-all duration-200 ${useWallet ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${useWallet ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-500'}`}>💎</div>
                        <div>
                            <p className={`font-bold ${useWallet ? 'text-indigo-900' : 'text-gray-900'}`}>Redeem Wallet Points</p>
                            <p className="text-xs text-gray-500">Balance: ₹{user.walletBalance.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${useWallet ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}`}>
                        {useWallet && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>}
                    </div>
                </div>
            )}

            {/* 2. Payment Method Selector (Visual Only) */}
            <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 ml-1">Select Payment Method</h3>
                <div className="grid grid-cols-2 gap-4">
                    {/* Card Option */}
                    <div 
                        onClick={() => setSelectedMethod('card')}
                        className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedMethod === 'card' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                        <div className="text-2xl mb-2">💳</div>
                        <p className={`font-bold text-sm ${selectedMethod === 'card' ? 'text-blue-900' : 'text-gray-600'}`}>Credit Card</p>
                        {selectedMethod === 'card' && <div className="absolute top-3 right-3 w-4 h-4 bg-blue-600 rounded-full"></div>}
                    </div>

                    {/* UPI Option */}
                    <div 
                        onClick={() => setSelectedMethod('upi')}
                        className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedMethod === 'upi' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                        <div className="text-2xl mb-2">📱</div>
                        <p className={`font-bold text-sm ${selectedMethod === 'upi' ? 'text-blue-900' : 'text-gray-600'}`}>UPI / Netbanking</p>
                        {selectedMethod === 'upi' && <div className="absolute top-3 right-3 w-4 h-4 bg-blue-600 rounded-full"></div>}
                    </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 text-center italic">
                    * Payment gateway is currently in Demo Mode. No real money will be deducted.
                </p>
            </div>

            {/* 3. Cost Breakdown */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-3">
                <div className="flex justify-between text-sm text-gray-500">
                    <span>Base Fare (x{formData.guests})</span>
                    <span>₹{basePrice.toLocaleString()}</span>
                </div>
                {useWallet && walletDiscount > 0 && (
                    <div className="flex justify-between text-sm text-indigo-600 font-bold animate-pulse">
                        <span>Wallet Discount</span>
                        <span>- ₹{walletDiscount.toLocaleString()}</span>
                    </div>
                )}
                <div className="border-t border-gray-200 pt-3 mt-1 flex justify-between items-end">
                    <span className="text-gray-900 font-bold">Total to Pay</span>
                    <span className="text-2xl font-bold text-gray-900">₹{finalPrice.toLocaleString()}</span>
                </div>
            </div>

            {/* 4. Action Buttons */}
            <div className="flex flex-col gap-3">
                {/* PRIMARY: Pay Now (Mock Success) */}
                <button 
                    onClick={() => processBooking('paid')}
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 shadow-lg active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading && bookingType === 'paid' ? (
                        <>Processing Payment...</>
                    ) : (
                        <>Complete Booking <span className="text-green-200 text-sm font-normal ml-1">(Demo)</span></>
                    )}
                </button>

                {/* SECONDARY: Pay Later (Pending Status) */}
                <button 
                    onClick={() => processBooking('reserved')}
                    disabled={loading}
                    className="w-full bg-white text-gray-700 border-2 border-gray-200 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading && bookingType === 'reserved' ? "Reserving..." : "Reserve Now, Pay Later"}
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
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-sm ${bookingType === 'paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                {bookingType === 'paid' ? '✓' : '⏳'}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {bookingType === 'paid' ? "Booking Confirmed!" : "Reservation Saved"}
            </h1>
            
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                {bookingType === 'paid' 
                    ? `Thank you, ${formData.name}. We've sent the tickets to ${formData.email}.`
                    : `Your spot is held, ${formData.name}. Please complete payment within 24 hours.`
                }
            </p>

            {bookingType === 'paid' && pointsToEarn > 0 && (
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-2xl mb-8 shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-xs uppercase font-bold text-blue-200 mb-1">Rewards Earned</p>
                        <p className="text-3xl font-bold">+{pointsToEarn} Points</p>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3">
                <Link href="/dashboard" className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-900 shadow-xl transition">
                    Go to Dashboard
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