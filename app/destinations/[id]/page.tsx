"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// --- TYPES ---
interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
}

interface Trip {
  id: number;
  name: string;
  country: string;
  price: number;
  image: string;
  description: string;
  rating: number;
  reviewsCount: number;
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  amenities: string[];
}

export default function DestinationDetail() {
  const { id } = useParams();
  
  // --- STATE ---
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'inclusions' | 'policies'>('itinerary');
  
  // Interactive UI State
  const [expandedDay, setExpandedDay] = useState<number | null>(1); // Default Day 1 open
  const [guests, setGuests] = useState(2); // Default 2 guests

  // --- DATA FETCHING ---
  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);

    fetch('/api/destinations')
      .then(res => res.json())
      .then(data => {
        // Loose equality (==) to match string URL param with numeric DB ID
        // eslint-disable-next-line eqeqeq
        const found = data.find((d: any) => d.id == id);
        
        // Simulate a slight delay for smooth transition feel
        setTimeout(() => {
            setTrip(found);
            setLoading(false);
        }, 300);
      })
      .catch(err => {
        console.error("Error fetching trip details:", err);
        setLoading(false);
      });
  }, [id]);

  // --- HANDLERS ---
  const toggleDay = (day: number) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  const handleGuestChange = (delta: number) => {
    const newCount = guests + delta;
    if (newCount >= 1 && newCount <= 10) {
        setGuests(newCount);
    }
  };

  // --- LOADING STATE (SKELETON) ---
  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4 pt-24 max-w-7xl mx-auto">
        <div className="h-8 bg-gray-200 w-1/3 rounded mb-4 animate-pulse"></div>
        <div className="h-[400px] bg-gray-200 rounded-2xl w-full mb-8 animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
                <div className="h-6 bg-gray-200 w-3/4 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 w-full rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 w-full rounded animate-pulse"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  // --- NOT FOUND STATE ---
  if (!trip) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Trip Not Found</h1>
            <p className="text-gray-500 mb-8">The destination you are looking for does not exist or has been removed.</p>
            <Link href="/destinations" className="bg-black text-white px-6 py-3 rounded-full font-bold">Back to Destinations</Link>
        </div>
    );
  }

  // Calculate Dynamic Total
  const totalAmount = trip.price * guests;

  return (
    <main className="min-h-screen bg-white font-sans text-gray-900 pb-24 lg:pb-12">
      
      {/* 1. NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-4 sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 hover:opacity-80 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">V</div>
                <span>Valourin<span className="text-blue-600">AI</span></span>
            </Link>
            <Link href="/destinations" className="text-sm font-semibold text-gray-500 hover:text-black transition flex items-center gap-1 group">
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Back
            </Link>
        </div>
      </nav>

      {/* 2. BREADCRUMBS & GALLERY */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4 flex gap-2">
            <Link href="/" className="hover:text-blue-600">Home</Link> / 
            <Link href="/destinations" className="hover:text-blue-600">Destinations</Link> / 
            <span className="text-gray-800">{trip.country}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-3 h-[400px] md:h-[500px] rounded-3xl overflow-hidden relative group">
          {/* Main Hero Image */}
          <div className="md:col-span-2 md:row-span-2 relative cursor-pointer overflow-hidden">
            <img src={trip.image} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" alt={trip.name} />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition"></div>
          </div>
          
          {/* Side Images (Mocked/Placeholder logic for layout demo) */}
          <div className="hidden md:block overflow-hidden bg-gray-100 relative">
             <img src={trip.image} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition grayscale hover:grayscale-0" alt="Gallery 1" />
          </div>
          <div className="hidden md:block overflow-hidden bg-gray-100 relative">
             <img src={trip.image} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition grayscale hover:grayscale-0" alt="Gallery 2" />
          </div>
          <div className="hidden md:block overflow-hidden md:col-span-2 bg-gray-900 relative flex items-center justify-center cursor-pointer hover:bg-gray-800 transition">
             <span className="text-white font-bold flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                View Gallery
             </span>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* --- LEFT COLUMN: DETAILS --- */}
        <div className="lg:col-span-2">
            
            {/* Header Info */}
            <div className="mb-8 border-b border-gray-100 pb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{trip.name}</h1>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><span className="text-lg">📍</span> {trip.country}</span>
                            <span className="flex items-center gap-1 text-yellow-500 font-bold"><span className="text-lg">★</span> {trip.rating} ({trip.reviewsCount} reviews)</span>
                        </div>
                    </div>
                </div>
                
                <h3 className="text-lg font-bold mt-8 mb-3">About this trip</h3>
                <p className="text-gray-600 leading-relaxed text-lg">{trip.description}</p>
                
                {/* Amenities Tags */}
                <div className="flex flex-wrap gap-2 mt-6">
                    {trip.amenities?.map((item, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-wide">{item}</span>
                    ))}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-8 border-b border-gray-200 mb-8 sticky top-[72px] bg-white z-40 pt-2">
                {[
                    { id: 'itinerary', label: 'Itinerary' },
                    { id: 'inclusions', label: 'What\'s Included' },
                    { id: 'policies', label: 'Policies' }
                ].map((tab) => (
                    <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id as any)} 
                        className={`pb-4 text-sm font-bold uppercase tracking-wide transition border-b-2 ${
                            activeTab === tab.id 
                            ? 'border-black text-black' 
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* TAB: ITINERARY */}
            {activeTab === 'itinerary' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {trip.itinerary?.map((item, i) => (
                        <div key={i} className={`border rounded-2xl overflow-hidden transition-all duration-300 ${expandedDay === item.day ? 'border-blue-200 shadow-md bg-blue-50/30' : 'border-gray-200 hover:border-blue-200 bg-white'}`}>
                            <button 
                                onClick={() => toggleDay(item.day)} 
                                className="w-full flex justify-between items-center p-5 text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${expandedDay === item.day ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        {item.day}
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Day {item.day}</span>
                                        <span className="font-bold text-lg text-gray-900">{item.title}</span>
                                    </div>
                                </div>
                                <div className={`transform transition-transform duration-300 ${expandedDay === item.day ? 'rotate-180' : ''}`}>
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                                </div>
                            </button>
                            
                            {/* Expandable Content */}
                            <div className={`transition-[max-height] duration-300 ease-in-out overflow-hidden ${expandedDay === item.day ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="p-5 pt-0 pl-[4.5rem]">
                                    <div className="space-y-3 relative border-l-2 border-gray-200 ml-2 pl-6 py-2">
                                        {item.activities.map((act, idx) => (
                                            <div key={idx} className="relative">
                                                <span className="absolute -left-[31px] top-1.5 w-3 h-3 bg-white border-2 border-blue-400 rounded-full"></span>
                                                <p className="text-gray-600 leading-relaxed">{act}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* TAB: INCLUSIONS */}
            {activeTab === 'inclusions' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                        <h3 className="font-bold mb-4 text-green-900 flex items-center gap-2">
                            <span className="bg-green-200 text-green-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">✓</span> Included
                        </h3>
                        <ul className="space-y-3">
                            {trip.inclusions?.map((inc, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-700 text-sm">
                                    <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                                    {inc}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                        <h3 className="font-bold mb-4 text-red-900 flex items-center gap-2">
                            <span className="bg-red-200 text-red-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">✕</span> Not Included
                        </h3>
                        <ul className="space-y-3">
                            {trip.exclusions?.map((exc, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-700 text-sm">
                                    <span className="mt-1.5 w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0"></span>
                                    {exc}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* TAB: POLICIES */}
            {activeTab === 'policies' && (
                <div className="bg-gray-50 p-8 rounded-2xl animate-in fade-in">
                    <h4 className="font-bold text-gray-900 mb-2">Cancellation Policy</h4>
                    <p className="text-gray-600 text-sm mb-6">Full refund if cancelled at least 48 hours before the trip start date. 50% refund if cancelled within 24 hours.</p>
                    
                    <h4 className="font-bold text-gray-900 mb-2">Important Notes</h4>
                    <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                        <li>Valid ID proof is required for all travelers.</li>
                        <li>Prices may vary on public holidays.</li>
                        <li>Please inform us of any dietary restrictions in advance.</li>
                    </ul>
                </div>
            )}
        </div>

        {/* --- RIGHT COLUMN: STICKY BOOKING CARD --- */}
        <div className="lg:col-span-1 relative hidden lg:block">
            <div className="sticky top-28 bg-white p-6 rounded-3xl border border-gray-200 shadow-2xl transition-all duration-300">
                
                {/* Price Header */}
                <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-6">
                    <div>
                        <p className="text-gray-400 text-xs line-through decoration-red-400 font-medium">₹{(trip.price + 5000).toLocaleString('en-IN')}</p>
                        <div className="flex items-baseline gap-1">
                            <p className="text-3xl font-bold text-gray-900">₹{trip.price.toLocaleString('en-IN')}</p>
                            <span className="text-gray-500 text-sm font-medium">/ person</span>
                        </div>
                    </div>
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                        Best Value
                    </span>
                </div>

                {/* Guest Counter */}
                <div className="space-y-4 mb-6">
                    <div className="p-4 border border-gray-200 rounded-2xl bg-gray-50 flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Travelers</span>
                            <span className="font-bold text-gray-900">{guests} Guest{guests > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-xl shadow-sm border border-gray-100">
                            <button 
                                onClick={() => handleGuestChange(-1)} 
                                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg transition ${guests <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                                disabled={guests <= 1}
                            >-</button>
                            <span className="font-bold text-gray-900 w-4 text-center">{guests}</span>
                            <button 
                                onClick={() => handleGuestChange(1)} 
                                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg text-blue-600 hover:bg-blue-50 transition"
                            >+</button>
                        </div>
                    </div>
                </div>

                {/* Total Calc */}
                <div className="bg-blue-50 rounded-xl p-4 mb-6 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>₹{trip.price.toLocaleString('en-IN')} x {guests}</span>
                        <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Service Fee</span>
                        <span className="text-green-600 font-bold">Free</span>
                    </div>
                    <div className="border-t border-blue-100 my-2 pt-2 flex justify-between text-lg font-bold text-gray-900">
                        <span>Total</span>
                        <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                </div>

                {/* CTA Button */}
                <Link 
                    href={`/booking?id=${trip.id}&name=${encodeURIComponent(trip.name)}&price=${totalAmount}`} 
                    className="block w-full bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition transform active:scale-95 text-center flex items-center justify-center gap-2"
                >
                    <span>Reserve Now</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </Link>
                
                <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                    Secure Payment • No Booking Fees
                </p>
            </div>
        </div>
      </div>

      {/* 4. MOBILE STICKY BOTTOM BAR (Visible only on mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 px-6 flex items-center justify-between z-50 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] pb-safe">
        <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-bold uppercase">Total for {guests} guests</span>
            <p className="text-2xl font-bold text-gray-900">₹{totalAmount.toLocaleString('en-IN')}</p>
        </div>
        <Link 
            href={`/booking?id=${trip.id}&name=${encodeURIComponent(trip.name)}&price=${totalAmount}`} 
            className="bg-black text-white font-bold py-3 px-8 rounded-full shadow-lg active:scale-95 transition"
        >
            Check Availability
        </Link>
      </div>

    </main>
  );
}