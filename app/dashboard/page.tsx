"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// --- TYPES ---
interface User {
  id: number;
  name: string;
  email: string;
  walletBalance: number;
}

interface Booking {
  id: number;
  destinationName: string;
  date: string;
  totalPrice: number;
  pointsEarned: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  paymentMethod: string;
}

export default function UserDashboard() {
  const router = useRouter();
  
  // --- STATE ---
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // --- INITIALIZATION ---
  useEffect(() => {
    // 1. Check Authentication
    const storedUser = localStorage.getItem('user');
    
    if (!storedUser) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // 2. Fetch User's Bookings
      fetch(`/api/bookings?userId=${parsedUser.id}`)
        .then(res => res.json())
        .then(data => {
          setBookings(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to load bookings", err);
          setLoading(false);
        });

    } catch (e) {
      console.error("Auth Error", e);
      router.push('/login');
    }
  }, [router]);

  // --- HANDLERS ---
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    router.push('/');
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">Loading your travel hub...</p>
      </div>
    );
  }

  // --- CALCULATED STATS ---
  const totalSpent = bookings.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const totalTrips = bookings.length;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* 1. NAVBAR */}
      <nav className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold group-hover:bg-blue-700 transition">V</div>
            <span className="text-xl font-bold tracking-tight">Valourin<span className="text-blue-600">AI</span></span>
          </Link>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold text-gray-900">{user?.name}</span>
                <span className="text-xs text-gray-500">{user?.email}</span>
            </div>
            <div className="h-8 w-[1px] bg-gray-200 hidden md:block"></div>
            <button 
                onClick={handleLogout} 
                className="text-sm font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-full transition"
            >
                Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* 2. GREETING & WALLET SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            
            {/* Wallet Card */}
            <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[240px]">
                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -translate-x-1/3 translate-y-1/3 blur-2xl"></div>
                
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <p className="text-blue-200 font-medium text-sm uppercase tracking-wider mb-1">Total Balance</p>
                        <h2 className="text-5xl font-bold tracking-tight">₹{user?.walletBalance.toLocaleString('en-IN')}</h2>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl">
                        <span className="text-2xl">💎</span>
                    </div>
                </div>

                <div className="relative z-10 mt-auto pt-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                    <div>
                        <p className="text-blue-100 text-sm opacity-90">1 Point = ₹1.00</p>
                        <p className="text-xs text-blue-200 mt-1">Use points to get discounts on your next adventure.</p>
                    </div>
                    <Link href="/destinations">
                        <button className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-xl font-bold shadow-lg transition transform hover:-translate-y-1 flex items-center gap-2">
                            <span>Book New Trip</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                        </button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-lg">✈️</div>
                        <span className="text-gray-500 font-bold text-xs uppercase tracking-wide">Total Trips</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{totalTrips}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-lg">💰</div>
                        <span className="text-gray-500 font-bold text-xs uppercase tracking-wide">Total Spent</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">₹{totalSpent.toLocaleString('en-IN')}</p>
                </div>
            </div>
        </div>

        {/* 3. BOOKING HISTORY */}
        <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                Your Adventures
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{bookings.length}</span>
            </h3>

            {bookings.length === 0 ? (
                // Empty State
                <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center">
                    <div className="text-6xl mb-4 opacity-50">🗺️</div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">No trips booked yet</h4>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">Your passport is waiting for some stamps! Start exploring destinations and earn rewards.</p>
                    <Link href="/planner">
                        <button className="text-blue-600 font-bold hover:underline">Plan a Trip with AI &rarr;</button>
                    </Link>
                </div>
            ) : (
                // Booking List
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div 
                            key={booking.id} 
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                        >
                            {/* Left: Info */}
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">
                                    📍
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900">{booking.destinationName}</h4>
                                    <p className="text-sm text-gray-500 font-medium">
                                        {new Date(booking.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                                    </p>
                                </div>
                            </div>

                            {/* Middle: Status Badge */}
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                    booking.status === 'Confirmed' 
                                        ? 'bg-green-50 text-green-700 border-green-100' 
                                        : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                }`}>
                                    {booking.status}
                                </span>
                            </div>

                            {/* Right: Price & Points */}
                            <div className="text-left md:text-right">
                                <p className="text-xl font-bold text-gray-900">₹{booking.totalPrice.toLocaleString('en-IN')}</p>
                                <p className="text-xs font-bold text-green-600 flex items-center md:justify-end gap-1">
                                    <span className="bg-green-100 w-4 h-4 rounded-full flex items-center justify-center text-[10px]">+</span>
                                    {booking.pointsEarned} Points Earned
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

      </div>
    </div>
  );
}