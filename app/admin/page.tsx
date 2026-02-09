"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// --- TYPES & INTERFACES ---
// --- TYPES & INTERFACES ---
interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
  meals: string[];
}

interface Trip {
  id: number;
  _id?: string; // MongoDB ID
  name: string;
  country: string;
  price: number;
  image: string;
  type: string;
  description: string;
  rating: number;
  // New Fields
  gallery: string[];
  amenities: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryDay[];
  isFeatured: boolean;
  reviewsCount: number;
}

interface Booking {
  id: number;
  customerName: string;
  email: string;
  destinationName: string;
  totalPrice: number;
  date: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  paymentMethod: string;
  pointsEarned: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  walletBalance: number;
  joinedAt: string;
  role: 'user' | 'admin';
  status: 'Active' | 'Banned';
}

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: React.ReactNode;
  color: string;
}

// --- MOCK DATA GENERATORS ---
const generateMockHistory = () => {
  return Array.from({ length: 12 }).map((_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    revenue: Math.floor(Math.random() * 500000) + 100000,
    users: Math.floor(Math.random() * 50) + 10,
  }));
};

// --- COMPONENTS ---

// 1. Stat Card Component
const StatCard = ({ title, value, trend, trendUp, icon, color }: StatCardProps) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <span className={`text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {trend}
      </span>
    </div>
    <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">{title}</h3>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

// 2. Simple Line Chart (SVG)
const RevenueChart = ({ data }: { data: any[] }) => {
  const maxVal = Math.max(...data.map(d => d.revenue));
  const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - (d.revenue / maxVal) * 100}`).join(' ');

  return (
    <div className="w-full h-64 relative mt-4">
      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        {[0, 25, 50, 75, 100].map(y => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#f3f4f6" strokeWidth="0.5" />
        ))}
        <polyline
          fill="none"
          stroke="#2563eb"
          strokeWidth="2"
          points={points}
          vectorEffect="non-scaling-stroke"
        />
        <path d={`M0,100 ${points} V100 H0`} fill="url(#blueGradient)" opacity="0.2" />
        <defs>
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        {data.map((d, i) => (i % 2 === 0 ? <span key={i}>{d.month}</span> : null))}
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function AdminDashboard() {
  const router = useRouter();

  // --- STATE ---
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'trips' | 'bookings' | 'users'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // NEW STATE FOR MOBILE

  // Data State
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [historyData, setHistoryData] = useState(generateMockHistory());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'basic' | 'details' | 'itinerary'>('basic');
  const [editingTrip, setEditingTrip] = useState<Partial<Trip> | null>(null);

  const [searchTerm, setSearchTerm] = useState('');

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    const initDashboard = async () => {
      // Auth Check
      const isAdmin = localStorage.getItem('isAdmin');
      if (!isAdmin) {
        router.push('/login');
        return;
      }

      try {
        setIsLoading(true);
        // Parallel Fetching
        const [tripsRes, bookingsRes, usersRes] = await Promise.all([
          fetch('/api/destinations'),
          fetch('/api/bookings'),
          fetch('/api/users')
        ]);

        if (tripsRes.ok) setTrips(await tripsRes.json());
        if (bookingsRes.ok) setBookings(await bookingsRes.json());
        if (usersRes.ok) setUsers(await usersRes.json());

      } catch (error) {
        console.error("Dashboard Load Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initDashboard();
  }, [router]);

  // --- HANDLERS ---
  const handleSaveTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrip) return;
    const isNew = !editingTrip.id;

    try {
      let res;
      if (isNew) {
        res = await fetch('/api/destinations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingTrip)
        });
        const data = await res.json();
        if (data.success) {
          setTrips([...trips, data.data]);
        }
      } else {
        res = await fetch(`/api/destinations/${editingTrip.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingTrip)
        });
        const data = await res.json();
        if (res.ok) {
          setTrips(trips.map(t => (t.id === editingTrip.id ? data : t)));
        }
      }

      setIsModalOpen(false);
      setEditingTrip(null);
      alert("Changes saved successfully!");
    } catch (e) {
      console.error(e);
      alert("Operation failed");
    }
  };

  const handleDeleteTrip = async (id: number) => {
    if (!confirm("Are you sure you want to remove this destination?")) return;
    try {
      await fetch(`/api/destinations/${id}`, {
        method: 'DELETE',
      });
      setTrips(trips.filter(t => t.id !== id));
    } catch (e) {
      console.error(e);
      alert("Delete failed");
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: Booking['status']) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        const updatedBooking = await res.json();
        setBookings(bookings.map(b => b.id === id ? updatedBooking : b));
      } else {
        const err = await res.json();
        alert(`Failed to update status: ${err.error}`);
        console.error("Status Update Failed", err);
      }
    } catch (error) {
      console.error("Status Update Failed", error);
      alert("Failed to update status. Check console for details.");
    }
  };

  const handleBanUser = async (id: number) => {
    if (!confirm("Ban this user?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Banned' })
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUsers(users.map(u => u.id === id ? updatedUser : u));
      }
    } catch (error) {
      console.error("Ban User Failed", error);
      alert("Failed to ban user");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const filteredTrips = trips.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalRevenue = bookings.reduce((acc, b) => acc + b.totalPrice, 0);

  // --- RENDER ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-bold animate-pulse">Initializing Admin Portal...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">

      {/* --------------------- */}
      {/* MOBILE BACKDROP OVERLAY */}
      {/* --------------------- */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* --------------------- */}
      {/* SIDEBAR (Responsive)  */}
      {/* --------------------- */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-slate-900 text-white flex flex-col z-40 shadow-2xl transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Brand & Close Button */}
        <div className="p-8 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20">T</div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">TripAI</h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Admin</p>
            </div>
          </div>
          {/* Close Button (Mobile Only) */}
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {[
            { id: 'overview', label: 'Dashboard', icon: '📊' },
            { id: 'trips', label: 'Destinations', icon: '🌍' },
            { id: 'bookings', label: 'Bookings', icon: '📅' },
            { id: 'users', label: 'Users', icon: '👥' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as any); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-semibold transition-all duration-200 group ${activeTab === item.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <span className={`text-xl transition-transform group-hover:scale-110 ${activeTab === item.id ? 'scale-110' : ''}`}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-900">
          <Link href="/" className="flex items-center gap-3 text-xs text-slate-400 hover:text-white mb-4 transition px-2">
            <span>←</span> Back to Website
          </Link>
          <button
            onClick={handleLogout}
            className="w-full bg-slate-800 hover:bg-red-600 hover:text-white text-slate-300 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 border border-slate-700 hover:border-red-500"
          >
            Logout Securely
          </button>
        </div>
      </aside>

      {/* --------------------- */}
      {/* MAIN CONTENT          */}
      {/* --------------------- */}
      {/* md:ml-72 ensures content isn't covered on desktop, but takes full width on mobile */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 min-h-screen md:ml-72 w-full transition-all">

        {/* Top Header */}
        <header className="flex justify-between items-center mb-10 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-4 z-20">
          <div className="flex items-center gap-4">
            {/* Hamburger Button (Mobile Only) */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>

            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 capitalize">{activeTab}</h2>
              <p className="text-gray-500 text-xs md:text-sm hidden sm:block">Welcome back, Admin.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">System Operational</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center text-blue-700 font-bold">
              A
            </div>
          </div>
        </header>

        {/* --- TAB: OVERVIEW --- */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} trend="+12.5%" trendUp={true} icon="💰" color="bg-blue-100 text-blue-600" />
              <StatCard title="Total Bookings" value={bookings.length.toString()} trend="+5.2%" trendUp={true} icon="📅" color="bg-purple-100 text-purple-600" />
              <StatCard title="Active Users" value={users.length.toString()} trend="+8.1%" trendUp={true} icon="👥" color="bg-orange-100 text-orange-600" />
              <StatCard title="Avg. Trip Price" value="₹18,500" trend="-2.4%" trendUp={false} icon="🏷️" color="bg-green-100 text-green-600" />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-gray-800">Revenue Analytics</h3>
                  <select className="bg-gray-50 border-none text-xs font-bold text-gray-500 rounded-lg"><option>This Year</option></select>
                </div>
                <RevenueChart data={historyData} />
              </div>

              {/* Recent Activity Feed */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 mb-6">Recent Activity</h3>
                <div className="space-y-6">
                  {bookings.slice(0, 5).map(b => (
                    <div key={b.id} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">NEW</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          <span className="font-bold">{b.customerName}</span> booked <span className="text-blue-600">{b.destinationName}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(b.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB: TRIPS --- */}
        {activeTab === 'trips' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <input
                placeholder="Search destinations..."
                className="p-3 pl-10 border border-gray-200 rounded-xl w-full sm:w-96 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <button
                onClick={() => {
                  setEditingTrip({
                    type: 'Beach',
                    itinerary: [],
                    amenities: [],
                    inclusions: [],
                    exclusions: [],
                    isFeatured: false
                  });
                  setActiveModalTab('basic');
                  setIsModalOpen(true);
                }}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>+</span> Add Destination
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map((t: any, index: number) => (
                <div key={t._id || t.id || index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition group">
                  <div className="h-48 relative">
                    <img src={t.image} className="w-full h-full object-cover" alt={t.name} />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold uppercase">{t.type}</div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg text-gray-900 truncate w-2/3">{t.name}</h4>
                      <span className="text-blue-600 font-bold">₹{t.price.toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-4 line-clamp-2">{t.description}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingTrip(t); setActiveModalTab('basic'); setIsModalOpen(true); }}
                        className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-2 rounded-lg text-xs transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTrip(t.id)}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 rounded-lg text-xs transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB: BOOKINGS --- */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['ID', 'Customer', 'Trip', 'Date', 'Amount', 'Status', 'Actions'].map(h => (
                    <th key={h} className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-mono text-xs text-gray-400">#{b.id}</td>
                    <td className="p-4">
                      <p className="font-bold text-sm text-gray-900">{b.customerName}</p>
                      <p className="text-xs text-gray-500">{b.email}</p>
                    </td>
                    <td className="p-4 text-sm font-medium">{b.destinationName}</td>
                    <td className="p-4 text-xs text-gray-500">{new Date(b.date).toLocaleDateString()}</td>
                    <td className="p-4 font-bold text-gray-900">₹{b.totalPrice.toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${b.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                        b.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {b.status === 'Pending' && (
                        <button onClick={() => handleStatusUpdate(b.id, 'Confirmed')} className="text-xs font-bold text-blue-600 hover:underline">Confirm</button>
                      )}
                      {b.status === 'Confirmed' && (
                        <button onClick={() => handleStatusUpdate(b.id, 'Cancelled')} className="text-xs font-bold text-red-600 hover:underline">Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- TAB: USERS --- */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">User</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Email</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Wallet</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u, index) => (
                  <tr key={u.id || `user-${index}`} className="hover:bg-gray-50 transition">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 text-white flex items-center justify-center font-bold text-xs">{u.name.charAt(0)}</div>
                      <span className="font-bold text-sm">{u.name}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{u.email}</td>
                    <td className="p-4 font-bold text-blue-600">₹{u.walletBalance.toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${u.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.status || 'Active'}</span>
                    </td>
                    <td className="p-4">
                      <button onClick={() => handleBanUser(u.id)} className="text-red-500 hover:bg-red-50 p-2 rounded transition" title="Ban User">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>

      {/* --------------------- */}
      {/* MODAL: EDIT TRIP      */}
      {/* --------------------- */}
      {isModalOpen && editingTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{editingTrip.id ? 'Edit Destination' : 'New Destination'}</h3>
                <p className="text-xs text-gray-500">Fill in the details below. Use tabs to navigate.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl transition hover:rotate-90">&times;</button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-6 gap-6 overflow-x-auto">
              {['basic', 'details', 'itinerary'].map((tab) => (
                <button
                  key={tab}
                  className={`py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${activeModalTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                  onClick={() => setActiveModalTab(tab as any)}
                >
                  {tab} Info
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="overflow-y-auto p-8 flex-1">
              <form id="tripForm" onSubmit={handleSaveTrip} className="space-y-6">

                {/* --- TAB: BASIC --- */}
                {activeModalTab === 'basic' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                        <input className="w-full border bg-gray-50 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" value={editingTrip.name || ''} onChange={e => setEditingTrip({ ...editingTrip, name: e.target.value })} required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Country</label>
                        <input className="w-full border bg-gray-50 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" value={editingTrip.country || ''} onChange={e => setEditingTrip({ ...editingTrip, country: e.target.value })} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price (₹)</label>
                        <input type="number" className="w-full border bg-gray-50 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" value={editingTrip.price || ''} onChange={e => setEditingTrip({ ...editingTrip, price: Number(e.target.value) })} required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                        <select className="w-full border bg-gray-50 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" value={editingTrip.type || 'Beach'} onChange={e => setEditingTrip({ ...editingTrip, type: e.target.value })}>
                          {['Beach', 'Mountain', 'City', 'Nature', 'Adventure', 'Honeymoon'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cover Image URL</label>
                      <input className="w-full border bg-gray-50 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" value={editingTrip.image || ''} onChange={e => setEditingTrip({ ...editingTrip, image: e.target.value })} required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                      <textarea className="w-full border bg-gray-50 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none transition" value={editingTrip.description || ''} onChange={e => setEditingTrip({ ...editingTrip, description: e.target.value })} required />
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <input
                        type="checkbox"
                        id="isFeatured"
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        checked={editingTrip.isFeatured || false}
                        onChange={e => setEditingTrip({ ...editingTrip, isFeatured: e.target.checked })}
                      />
                      <label htmlFor="isFeatured" className="text-sm font-bold text-gray-700 select-none cursor-pointer">Mark as Featured Destination</label>
                    </div>
                  </div>
                )}

                {/* --- TAB: DETAILS --- */}
                {activeModalTab === 'details' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amenities <span className="text-gray-400 font-normal normal-case">(Comma separated)</span></label>
                      <textarea
                        className="w-full border bg-gray-50 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24 transition"
                        placeholder="WiFi, Pool, Breakfast, Spa..."
                        value={editingTrip.amenities?.join(', ') || ''}
                        onChange={e => setEditingTrip({ ...editingTrip, amenities: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Inclusions <span className="text-gray-400 font-normal normal-case">(Comma separated)</span></label>
                      <textarea
                        className="w-full border bg-gray-50 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24 transition"
                        placeholder="Flights, Hotels, Meals..."
                        value={editingTrip.inclusions?.join(', ') || ''}
                        onChange={e => setEditingTrip({ ...editingTrip, inclusions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Exclusions <span className="text-gray-400 font-normal normal-case">(Comma separated)</span></label>
                      <textarea
                        className="w-full border bg-gray-50 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24 transition"
                        placeholder="Personal Expenses, Visa, Insurance..."
                        value={editingTrip.exclusions?.join(', ') || ''}
                        onChange={e => setEditingTrip({ ...editingTrip, exclusions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      />
                    </div>
                  </div>
                )}

                {/* --- TAB: ITINERARY --- */}
                {activeModalTab === 'itinerary' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingTrip({
                          ...editingTrip,
                          itinerary: [
                            ...(editingTrip.itinerary || []),
                            { day: (editingTrip.itinerary?.length || 0) + 1, title: '', activities: [], meals: [] }
                          ]
                        })}
                        className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold py-2 px-4 rounded-lg transition"
                      >
                        + Add Day
                      </button>
                    </div>

                    {(editingTrip.itinerary || []).map((day, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50 relative group">
                        <button
                          type="button"
                          onClick={() => {
                            const newItinerary = [...(editingTrip.itinerary || [])];
                            newItinerary.splice(idx, 1);
                            // Re-index days
                            newItinerary.forEach((d, i) => d.day = i + 1);
                            setEditingTrip({ ...editingTrip, itinerary: newItinerary });
                          }}
                          className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition"
                          title="Remove Day"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>

                        <div className="flex gap-4 items-center mb-4">
                          <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {day.day}
                          </span>
                          <input
                            placeholder="Day Title (e.g., Arrival in Bali)"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                            value={day.title}
                            onChange={(e) => {
                              const newItinerary = [...(editingTrip.itinerary || [])];
                              newItinerary[idx].title = e.target.value;
                              setEditingTrip({ ...editingTrip, itinerary: newItinerary });
                            }}
                          />
                        </div>

                        <div className="space-y-3 pl-12">
                          <input
                            placeholder="Activities (comma separated)"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={day.activities.join(', ')}
                            onChange={(e) => {
                              const newItinerary = [...(editingTrip.itinerary || [])];
                              newItinerary[idx].activities = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                              setEditingTrip({ ...editingTrip, itinerary: newItinerary });
                            }}
                          />
                          <input
                            placeholder="Meals (comma separated)"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={day.meals.join(', ')}
                            onChange={(e) => {
                              const newItinerary = [...(editingTrip.itinerary || [])];
                              newItinerary[idx].meals = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                              setEditingTrip({ ...editingTrip, itinerary: newItinerary });
                            }}
                          />
                        </div>
                      </div>
                    ))}

                    {(!editingTrip.itinerary || editingTrip.itinerary.length === 0) && (
                      <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                        No itinerary days added yet.
                      </div>
                    )}
                  </div>
                )}

              </form>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-100 transition">Cancel</button>
              <button type="submit" form="tripForm" className="flex-1 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/30 transition transform hover:-translate-y-1">Save Changes</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}