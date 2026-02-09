"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  // --- STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // NEW: Mobile Menu State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search State
  const [searchData, setSearchData] = useState({
    destination: '',
    date: '',
    budget: 'moderate'
  });

  // Featured Destinations State
  const [featuredDestinations, setFeaturedDestinations] = useState<any[]>([]);

  // --- EFFECTS ---
  useEffect(() => {
    // Fetch Featured Destinations
    fetch('/api/destinations')
      .then(res => res.json())
      .then(data => {
        // Filter featured or take first 3
        const featured = data.filter((d: any) => d.isFeatured).slice(0, 3);
        setFeaturedDestinations(featured.length > 0 ? featured : data.slice(0, 3));
      })
      .catch(err => console.error("Failed to load featured destinations", err));

    // 1. Auth Check
    const user = localStorage.getItem('user');
    const admin = localStorage.getItem('isAdmin');

    if (user) setIsLoggedIn(true);
    if (admin) {
      setIsLoggedIn(true);
      setIsAdmin(true);
    }

    // 2. Scroll Listener
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/destinations');
  };

  return (
    <main className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100">

      {/* ========================================= */}
      {/* 1. NAVIGATION BAR                         */}
      {/* ========================================= */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${isScrolled || mobileMenuOpen ? 'bg-white/95 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group z-50">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg transition-colors ${isScrolled || mobileMenuOpen ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'
              }`}>
              V
            </div>
            <span className={`text-xl font-bold tracking-tight transition-colors ${isScrolled || mobileMenuOpen ? 'text-gray-900' : 'text-white'
              }`}>
              Valourin<span className={(isScrolled || mobileMenuOpen) ? 'text-blue-600' : 'text-blue-200'}>AI</span>
            </span>
          </Link>

          {/* --- DESKTOP MENU (Hidden on Mobile) --- */}
          <div className="hidden md:flex items-center gap-8">
            {['Destinations', 'Packages', 'About'].map((item) => (
              <Link
                key={item}
                href="/destinations"
                className={`text-sm font-medium transition hover:-translate-y-0.5 ${isScrolled ? 'text-gray-600 hover:text-blue-600' : 'text-gray-200 hover:text-white'
                  }`}
              >
                {item}
              </Link>
            ))}
            <Link
              href="/planner"
              className={`text-sm font-bold flex items-center gap-1 ${isScrolled ? 'text-indigo-600' : 'text-indigo-200 hover:text-white'
                }`}
            >
              AI Planner ✨
            </Link>
          </div>

          {/* --- DESKTOP AUTH BUTTON (Hidden on Mobile) --- */}
          <div className="hidden md:block">
            {isLoggedIn ? (
              <Link
                href={isAdmin ? "/admin" : "/dashboard"}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition shadow-lg ${isScrolled
                  ? 'bg-gray-900 text-white hover:bg-gray-800'
                  : 'bg-white text-gray-900 hover:bg-gray-100'
                  }`}
              >
                {isAdmin ? 'Admin Panel' : 'Dashboard'}
              </Link>
            ) : (
              <Link
                href="/login"
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition shadow-lg ${isScrolled
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white text-blue-600 hover:bg-blue-50'
                  }`}
              >
                Login
              </Link>
            )}
          </div>

          {/* --- MOBILE HAMBURGER BUTTON (Visible on Mobile) --- */}
          <button
            className="md:hidden z-50 p-2 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className={`w-6 h-0.5 mb-1.5 transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2 bg-gray-900' : (isScrolled ? 'bg-gray-900' : 'bg-white')}`}></div>
            <div className={`w-6 h-0.5 mb-1.5 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : (isScrolled ? 'bg-gray-900' : 'bg-white')}`}></div>
            <div className={`w-6 h-0.5 transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2 bg-gray-900' : (isScrolled ? 'bg-gray-900' : 'bg-white')}`}></div>
          </button>
        </div>

        {/* --- MOBILE MENU OVERLAY --- */}
        <div className={`md:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 transition-all duration-300 ease-in-out overflow-hidden ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="flex flex-col p-6 space-y-4">
            {['Destinations', 'Packages', 'About'].map((item) => (
              <Link
                key={item}
                href="/destinations"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-bold text-gray-700 hover:text-blue-600"
              >
                {item}
              </Link>
            ))}
            <Link
              href="/planner"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-bold text-indigo-600 flex items-center gap-2"
            >
              AI Planner ✨
            </Link>
            <div className="h-px bg-gray-100 my-2"></div>
            {isLoggedIn ? (
              <Link
                href={isAdmin ? "/admin" : "/dashboard"}
                onClick={() => setMobileMenuOpen(false)}
                className="bg-gray-900 text-white text-center py-3 rounded-xl font-bold"
              >
                Go to {isAdmin ? 'Admin Panel' : 'Dashboard'}
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-blue-600 text-white text-center py-3 rounded-xl font-bold"
              >
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ========================================= */}
      {/* 2. HERO SECTION                           */}
      {/* ========================================= */}
      <div className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden">

        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop"
            alt="Travel Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center w-full">
          <div className="animate-in fade-in zoom-in duration-700 slide-in-from-bottom-8">
            <span className="inline-block py-1 px-4 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold mb-6 backdrop-blur-md uppercase tracking-wider">
              🚀 The Future of Travel Planning
            </span>
            <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
              Plan your dream trip <br className="hidden md:block" />
              with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">Artificial Intelligence</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-12 max-w-2xl mx-auto font-medium drop-shadow-md">
              Stop researching for hours. Tell our AI your budget and interests, and get a complete, personalized itinerary in seconds.
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-3 rounded-3xl shadow-2xl max-w-4xl mx-auto transform hover:-translate-y-1 transition duration-300 animate-in fade-in slide-in-from-bottom-10 delay-200">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">

              <div className="flex-1 px-6 py-3 bg-gray-50 rounded-2xl border border-transparent focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 transition text-left group">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 group-focus-within:text-blue-600 transition">Where to?</label>
                <input
                  type="text"
                  placeholder="e.g. Bali, Indonesia"
                  className="w-full bg-transparent outline-none text-gray-900 font-bold placeholder-gray-400"
                  value={searchData.destination}
                  onChange={(e) => setSearchData({ ...searchData, destination: e.target.value })}
                />
              </div>

              <div className="flex-1 px-6 py-3 bg-gray-50 rounded-2xl border border-transparent focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 transition text-left group">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 group-focus-within:text-blue-600 transition">When?</label>
                <input
                  type="date"
                  className="w-full bg-transparent outline-none text-gray-900 font-bold uppercase"
                  value={searchData.date}
                  onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
                />
              </div>

              <div className="flex-1 px-6 py-3 bg-gray-50 rounded-2xl border border-transparent focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 transition text-left group">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 group-focus-within:text-blue-600 transition">Budget</label>
                <select
                  className="w-full bg-transparent outline-none text-gray-900 font-bold cursor-pointer"
                  value={searchData.budget}
                  onChange={(e) => setSearchData({ ...searchData, budget: e.target.value })}
                >
                  <option value="cheap">$ Economy</option>
                  <option value="moderate">$$ Moderate</option>
                  <option value="luxury">$$$ Luxury</option>
                </select>
              </div>

              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-2xl transition shadow-xl flex items-center justify-center gap-2 min-w-[160px]">
                <span>Search</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* 3. TRENDING DESTINATIONS                  */}
      {/* ========================================= */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Trending Destinations</h2>
            <p className="text-gray-500">The most booked places by our community this month.</p>
          </div>
          <Link href="/destinations" className="text-blue-600 font-bold hover:text-blue-800 transition flex items-center gap-1 group">
            View all destinations <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredDestinations.map((dest, index) => (
            <Link key={dest._id || dest.id || index} href={`/destinations/${dest.id || dest._id}`} className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 block h-96">
              <img src={dest.image} alt={dest.name} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                <div className="transform translate-y-2 group-hover:translate-y-0 transition duration-300">
                  <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block border border-white/30">{dest.type}</span>
                  <h3 className="text-white text-2xl font-bold mb-1">{dest.name}</h3>
                  <p className="text-gray-300 text-sm mb-4">Starting from <span className="text-white font-bold text-lg">₹{dest.price.toLocaleString('en-IN')}</span></p>
                  <span className="inline-block text-white text-sm font-bold border-b border-white opacity-0 group-hover:opacity-100 transition duration-300">View Details</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================= */}
      {/* 4. VALUE PROPOSITION                      */}
      {/* ========================================= */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="text-blue-600 font-bold tracking-wider text-xs uppercase mb-2 block">Why Choose Valourin</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-16">Travel Planning Reimagined</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm">⚡</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Instant Itineraries</h3>
              <p className="text-gray-500 leading-relaxed">Don't waste weeks planning. Our AI builds a detailed, hour-by-hour plan in under 30 seconds based on your vibe.</p>
            </div>
            <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm">💰</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Best Price Guarantee</h3>
              <p className="text-gray-500 leading-relaxed">Our algorithm scans millions of flights and hotels to find hidden deals and error fares humans often miss.</p>
            </div>
            <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm">🎨</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">100% Personalized</h3>
              <p className="text-gray-500 leading-relaxed">Whether you love food, history, or adventure, the trip is tailored exactly to your personal taste profile.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* 5. AI PLANNER CTA                         */}
      {/* ========================================= */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto bg-gradient-to-r from-blue-900 to-indigo-900 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
          {/* Abstract Shapes */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-indigo-500/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
              Ready to generate <br /> your dream trip?
            </h2>
            <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Join 50,000+ travelers who are saving time and money using our AI planner. No hidden fees, cancel anytime.
            </p>
            <Link href="/planner">
              <button className="bg-white text-blue-900 font-bold py-5 px-12 rounded-full hover:bg-gray-100 transition shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-lg">
                Start Planning for Free
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* 6. TESTIMONIALS                           */}
      {/* ========================================= */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">Loved by Travelers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { text: "I planned a 2-week trip to Italy in 5 minutes. The restaurant recommendations were spot on!", name: "Sarah J.", role: "Solo Traveler", color: "bg-pink-100 text-pink-600" },
              { text: "The budget tracker feature saved me over $500 on my family vacation. Highly recommend for dads.", name: "Mike T.", role: "Family of 4", color: "bg-blue-100 text-blue-600" },
              { text: "Finally, an AI that actually understands 'hidden gems'. I saw things no other tourist guide mentioned.", name: "Elena R.", role: "Digital Nomad", color: "bg-purple-100 text-purple-600" }
            ].map((review, i) => (
              <div key={i} className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:border-gray-200 transition">
                <div className="flex text-yellow-400 mb-4 gap-1">★★★★★</div>
                <p className="text-gray-600 mb-8 italic text-lg">"{review.text}"</p>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${review.color}`}>
                    {review.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{review.name}</h4>
                    <span className="text-gray-400 text-sm">{review.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* 7. FOOTER                                 */}
      {/* ========================================= */}
      <footer className="bg-gray-900 text-gray-400 py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          <div>
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
              <span className="text-2xl font-bold text-white">Trip<span className="text-blue-500">AI</span></span>
            </Link>
            <p className="text-sm leading-relaxed opacity-80">
              Revolutionizing travel with advanced AI. We help you explore the world smarter, faster, and cheaper.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Company</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="#" className="hover:text-white transition">About Us</Link></li>
              <li><Link href="#" className="hover:text-white transition">Careers</Link></li>
              <li><Link href="#" className="hover:text-white transition">Blog</Link></li>
              <li><Link href="#" className="hover:text-white transition">Press</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Support</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="#" className="hover:text-white transition">Help Center</Link></li>
              <li><Link href="#" className="hover:text-white transition">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Newsletter</h4>
            <p className="text-xs mb-4 opacity-70">Get the latest travel deals sent to your inbox weekly.</p>
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

        {/* Footer Bottom */}
        <div className="max-w-7xl mx-auto px-6 border-t border-gray-800 pt-8 text-center text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span>&copy; 2025 Valourin Inc. All rights reserved.</span>
            {/* SECRET ADMIN ACCESS: Hidden visual cue */}
            <Link href="/login" className="opacity-20 hover:opacity-100 transition-opacity duration-300 text-gray-500 hover:text-white" title="Admin Login">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-white transition">Twitter</Link>
            <Link href="#" className="hover:text-white transition">Instagram</Link>
            <Link href="#" className="hover:text-white transition">LinkedIn</Link>
          </div>
        </div>
      </footer>

    </main>
  );
}