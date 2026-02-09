"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

// --- TYPES ---
interface Destination {
  id: number;
  name: string;
  country: string;
  price: number;
  priceDisplay?: string;
  image: string;
  rating: number;
  reviewsCount?: number;
  type: string;
  amenities?: string[];
  description?: string;
  isFeatured?: boolean;
}

// --- CONSTANTS ---
const TRAVEL_TYPES = ['Beach', 'Mountain', 'City', 'Nature', 'Adventure', 'Honeymoon', 'Safari', 'Cruise'];
const AMENITIES_LIST = ['Pool', 'WiFi', 'Spa', 'Gym', 'Bar', 'Hiking', 'Breakfast', 'Parking', 'Ocean View', 'Pet Friendly'];

// --- 1. THE MAIN LOGIC COMPONENT ---
function DestinationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- STATE: DATA ---
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- STATE: AUTH ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // --- STATE: FILTERS ---
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState(150000);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);

  // --- STATE: SORTING & UI ---
  const [sortBy, setSortBy] = useState('recommended');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState(6);

  // --- INITIALIZATION ---
  useEffect(() => {
    // 1. Auth Check (Immediate)
    const user = localStorage.getItem('user');
    const admin = localStorage.getItem('isAdmin');
    if (user || admin) {
      setIsLoggedIn(true);
      if (admin) setIsAdmin(true);
    }

    // 2. Parse URL Params (Deep Linking)
    const typeParam = searchParams.get('type');
    if (typeParam) setSelectedType(typeParam);

    const qParam = searchParams.get('q');
    if (qParam) setSearchQuery(qParam);

    // 3. Fetch Data
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate network delay for skeleton showcase
        await new Promise(r => setTimeout(r, 600));

        const res = await fetch('/api/destinations');
        if (!res.ok) throw new Error("Failed to load destinations");

        const data = await res.json();
        setDestinations(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load destinations. Please try refreshing.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  // --- FILTERING ENGINE (MEMOIZED) ---
  const filteredDestinations = useMemo(() => {
    return destinations
      .filter((dest) => {
        // Search Query
        if (searchQuery && !dest.name.toLowerCase().includes(searchQuery.toLowerCase()) && !dest.country.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        // Price
        if (dest.price > priceRange) return false;
        // Type
        if (selectedType && dest.type !== selectedType) return false;
        // Rating
        if (dest.rating < minRating) return false;
        // Amenities
        if (selectedAmenities.length > 0) {
          if (!dest.amenities) return false;
          const hasAll = selectedAmenities.every(a => dest.amenities!.includes(a));
          if (!hasAll) return false;
        }
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price_low': return a.price - b.price;
          case 'price_high': return b.price - a.price;
          case 'rating': return b.rating - a.rating;
          default: return 0; // Recommended (DB Order)
        }
      });
  }, [destinations, searchQuery, priceRange, selectedType, selectedAmenities, minRating, sortBy]);

  // --- HANDLERS ---
  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setPriceRange(150000);
    setSelectedType(null);
    setSelectedAmenities([]);
    setMinRating(0);
    setSearchQuery('');
    setSortBy('recommended');
  };

  const loadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">

      {/* 1. NAVIGATION BAR */}
      <nav className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-50 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto flex justify-between items-center">

          <Link href="/" className="flex items-center gap-2 group hover:opacity-80 transition">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm group-hover:bg-blue-700">V</div>
            <span className="text-xl font-bold tracking-tight">Valourin<span className="text-blue-600">AI</span></span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search destinations (e.g. Bali, Paris)..."
                className="w-full bg-gray-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link
                href={isAdmin ? "/admin" : "/dashboard"}
                className={`px-5 py-2.5 rounded-full text-sm font-bold border transition flex items-center gap-2 ${isAdmin ? 'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'}`}
              >
                {isAdmin ? '🛡️ Admin' : '👤 Dashboard'}
              </Link>
            ) : (
              <Link
                href="/login"
                className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-black transition shadow-lg"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* 2. HERO HEADER */}
      <header className="bg-blue-600 text-white pt-12 pb-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600 to-indigo-800 opacity-90"></div>
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-10 -translate-x-10"></div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-end">
          <div>
            <span className="inline-block py-1 px-3 rounded-full bg-white/20 border border-white/30 text-xs font-bold mb-4 backdrop-blur-md">
              ✈️ {destinations.length} Available Trips
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Explore the World</h1>
            <p className="text-blue-100 text-lg max-w-2xl opacity-90 leading-relaxed">
              Discover hand-picked holiday packages, exclusive deals, and hidden gems.
            </p>
          </div>
          {/* View Mode Toggles */}
          <div className="hidden md:flex bg-white/10 backdrop-blur-sm p-1 rounded-lg mt-6 md:mt-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-100 hover:bg-white/10'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-100 hover:bg-white/10'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
      </header>

      {/* 3. MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-4 w-full flex-1 flex flex-col lg:flex-row gap-8 -mt-16 pb-20 relative z-20">

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4 w-full">
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="w-full bg-white border border-gray-200 py-4 rounded-xl font-bold text-gray-700 flex justify-center items-center gap-2 shadow-lg active:scale-95 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            {mobileFiltersOpen ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {/* SIDEBAR FILTERS */}
        <aside className={`w-full lg:w-72 flex-shrink-0 ${mobileFiltersOpen ? 'block' : 'hidden'} lg:block transition-all duration-300`}>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xl sticky top-24 h-auto max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">

            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h2 className="font-bold text-lg text-gray-900">Filters</h2>
              <button onClick={clearFilters} className="text-xs text-blue-600 hover:text-blue-800 font-bold uppercase tracking-wide hover:underline transition">
                Reset All
              </button>
            </div>

            {/* 1. Travel Type */}
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 tracking-wider">Travel Type</h3>
              <div className="space-y-2">
                {TRAVEL_TYPES.map((type) => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer group hover:bg-gray-50 p-2 rounded-lg transition -mx-2">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${selectedType === type ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'}`}>
                      {selectedType === type && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <input
                      type="radio"
                      name="travelType"
                      className="hidden"
                      checked={selectedType === type}
                      onChange={() => setSelectedType(type)}
                    />
                    <span className={`text-sm ${selectedType === type ? 'font-bold text-blue-600' : 'text-gray-600'}`}>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. Price Range */}
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 tracking-wider">Max Budget</h3>
              <div className="space-y-4">
                <input
                  type="range"
                  min="5000"
                  max="200000"
                  step="5000"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:bg-gray-300 transition"
                />
                <div className="flex justify-between text-xs font-medium text-gray-500">
                  <span>₹5k</span>
                  <span className="text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded">₹{priceRange.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* 3. Amenities */}
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 tracking-wider">Amenities</h3>
              <div className="grid grid-cols-2 gap-2">
                {AMENITIES_LIST.map((item) => (
                  <label key={item} className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition ${selectedAmenities.includes(item) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                      {selectedAmenities.includes(item) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selectedAmenities.includes(item)}
                      onChange={() => handleAmenityToggle(item)}
                    />
                    <span className="text-xs text-gray-600 font-medium">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. Rating */}
            <div>
              <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 tracking-wider">Minimum Rating</h3>
              <div className="space-y-1">
                {[5, 4, 3, 2].map((star) => (
                  <label key={star} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded -mx-2 transition">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${minRating === star ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'}`}>
                      {minRating === star && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                    </div>
                    <input
                      type="radio"
                      name="rating"
                      className="hidden"
                      checked={minRating === star}
                      onChange={() => setMinRating(star)}
                    />
                    <div className="flex text-yellow-400 text-sm">
                      {"★".repeat(star)}{"☆".repeat(5 - star)}
                      <span className="text-gray-400 ml-2 text-xs font-bold">& Up</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* MAIN LISTINGS AREA */}
        <main className="flex-1">

          {/* Sorting Bar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center mb-6">
            <h2 className="font-bold text-gray-800 text-lg mb-2 sm:mb-0 flex items-center gap-2">
              {selectedType ? `${selectedType} Destinations` : 'All Destinations'}
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{filteredDestinations.length}</span>
            </h2>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select
                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none transition"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recommended">Recommended</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* ERROR STATE */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-bold border border-red-100 mb-6 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          {/* LOADING SKELETON */}
          {loading ? (
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className={`bg-white rounded-2xl border border-gray-100 p-4 ${viewMode === 'grid' ? 'h-[400px]' : 'h-64 flex gap-4'} animate-pulse`}>
                  <div className={`${viewMode === 'grid' ? 'w-full h-48' : 'w-64 h-full'} bg-gray-200 rounded-xl mb-4`}></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-10 bg-gray-200 rounded w-full mt-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* EMPTY STATE */}
              {filteredDestinations.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-300">
                  <div className="text-6xl mb-4 opacity-30">🏔️</div>
                  <h3 className="text-xl font-bold text-gray-900">No matching trips found</h3>
                  <p className="text-gray-500 mt-2 max-w-sm mx-auto mb-8">We couldn't find any destinations matching your current filters. Try adjusting your budget or clearing filters.</p>
                  <button
                    onClick={clearFilters}
                    className="bg-black text-white font-bold hover:bg-gray-800 px-6 py-3 rounded-xl transition shadow-lg hover:shadow-xl"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                /* GRID/LIST LAYOUT */
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>

                  {filteredDestinations.slice(0, visibleCount).map((dest, index) => (

                    <div
                      key={dest.id || index}
                      className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex ${viewMode === 'grid' ? 'flex-col h-full' : 'flex-row h-64'}`}
                    >

                      {/* Image Area */}
                      <Link href={`/destinations/${dest.id || dest._id}`} className={`relative overflow-hidden block ${viewMode === 'grid' ? 'h-56 w-full' : 'w-72 h-full'}`}>
                        <img
                          src={dest.image}
                          alt={dest.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className="bg-white/95 backdrop-blur-md text-[10px] font-bold px-3 py-1 rounded-full text-gray-800 uppercase tracking-wide border border-white/50 shadow-sm">
                            {dest.type}
                          </span>
                          {dest.isFeatured && (
                            <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wide">
                              Featured
                            </span>
                          )}
                        </div>

                        {/* Like Button */}
                        <button className="absolute top-3 right-3 bg-white/30 backdrop-blur-md hover:bg-white text-white hover:text-red-500 p-2 rounded-full transition-all duration-300 shadow-sm">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                        </button>
                      </Link>

                      {/* Content Area */}
                      <div className="p-5 flex flex-col flex-1">

                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 min-w-0 pr-4">
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition truncate">{dest.name}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              {dest.country}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100 flex-shrink-0">
                            <span className="text-yellow-500 text-sm">★</span>
                            <span className="text-xs font-bold text-gray-700">{dest.rating}</span>
                          </div>
                        </div>

                        {/* Amenities (Grid View Only) */}
                        {viewMode === 'grid' && (
                          <div className="flex flex-wrap gap-1 mb-4 h-6 overflow-hidden">
                            {dest.amenities?.slice(0, 3).map((am, i) => (
                              <span key={i} className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">{am}</span>
                            ))}
                            {dest.amenities && dest.amenities.length > 3 && (
                              <span className="text-[10px] text-gray-400 px-1">+{dest.amenities.length - 3}</span>
                            )}
                          </div>
                        )}

                        {/* Description (List View Only) */}
                        {viewMode === 'list' && (
                          <p className="text-sm text-gray-500 line-clamp-2 mb-4">{dest.description}</p>
                        )}

                        {/* Price Block */}
                        <div className="mt-auto pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Starting From</p>
                              <div className="flex items-baseline gap-1">
                                <p className="font-bold text-gray-900 text-xl">
                                  {dest.priceDisplay || `₹${dest.price.toLocaleString('en-IN')}`}
                                </p>
                                <span className="text-xs text-gray-400 font-normal">/ person</span>
                              </div>
                            </div>

                            <Link
                              href={`/destinations/${dest.id || dest._id}`}
                              className="bg-gray-900 text-white hover:bg-blue-600 px-4 py-3 rounded-xl transition duration-300 shadow-md group-hover:scale-105 flex items-center gap-2"
                            >
                              <span className="text-xs font-bold">Details</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {filteredDestinations.length > visibleCount && (
                <div className="mt-12 flex justify-center">
                  <button
                    onClick={loadMore}
                    className="bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 hover:text-black hover:border-black px-8 py-3 rounded-full transition flex items-center gap-2 group shadow-sm"
                  >
                    <span>Show More Results</span>
                    <svg className="w-4 h-4 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* 4. FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          <div>
            <span className="text-2xl font-bold text-white block mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-xs">V</div>
              Valourin<span className="text-blue-500">AI</span>
            </span>
            <p className="text-sm leading-relaxed opacity-80">
              We are revolutionizing the way people travel by combining advanced AI with real-time travel data.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-white transition">About Us</Link></li>
              <li><Link href="#" className="hover:text-white transition">Careers</Link></li>
              <li><Link href="#" className="hover:text-white transition">Press & Media</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">Support</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-white transition">Help Center</Link></li>
              <li><Link href="#" className="hover:text-white transition">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">Stay Updated</h4>
            <p className="text-xs mb-4 opacity-80">Get the latest travel deals sent directly to your inbox.</p>
            <div className="flex">
              <input
                type="email"
                placeholder="email@example.com"
                className="bg-gray-800 border-none text-white px-4 py-3 rounded-l-lg w-full focus:ring-1 focus:ring-blue-500 outline-none text-sm transition placeholder-gray-500"
              />
              <button className="bg-blue-600 text-white px-4 py-3 rounded-r-lg hover:bg-blue-700 transition font-bold text-sm">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 border-t border-gray-800 pt-8 text-center text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <span>&copy; 2025 Valourin Inc. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-white transition">Twitter</Link>
            <Link href="#" className="hover:text-white transition">Instagram</Link>
            <Link href="#" className="hover:text-white transition">LinkedIn</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

// --- 2. WRAPPER COMPONENT FOR SUSPENSE ---
export default function DestinationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
      </div>
    }>
      <DestinationsContent />
    </Suspense>
  );
}