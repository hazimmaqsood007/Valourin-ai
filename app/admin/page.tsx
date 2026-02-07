"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// --- TYPES & INTERFACES ---
interface Trip {
  id: number;
  name: string;
  country: string;
  price: number;
  image: string;
  type: string;
  description: string;
  rating: number;
  bookingsCount: number;
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
    const url = '/api/destinations';

    try {
      if (isNew) {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingTrip)
        });
        const data = await res.json();
        setTrips([...trips, data.data]);
      } else {
        setTrips(trips.map(t => (t.id === editingTrip.id ? { ...t, ...editingTrip } as Trip : t)));
      }
      setIsModalOpen(false);
      setEditingTrip(null);
      alert("Changes saved successfully!");
    } catch (e) {
      alert("Operation failed");
    }
  };

  const handleDeleteTrip = async (id: number) => {
    if (!confirm("Are you sure you want to remove this destination?")) return;
    try {
      await fetch('/api/destinations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      setTrips(trips.filter(t => t.id !== id));
    } catch (e) {
      alert("Delete failed");
    }
  };

  const handleStatusUpdate = (id: number, newStatus: Booking['status']) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };

  const handleBanUser = (id: number) => {
    if (!confirm("Ban this user?")) return;
    setUsers(users.map(u => u.id === id ? { ...u, status: 'Banned' } : u));
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
        className={`fixed top-0 left-0 h-full w-72 bg-slate-900 text-white flex flex-col z-40 shadow-2xl transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
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
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
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
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                activeTab === item.id 
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
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
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
                onClick={() => { setEditingTrip({ type: 'Beach' }); setIsModalOpen(true); }}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>+</span> Add Destination
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map(t => (
                <div key={t.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition group">
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
                            onClick={() => { setEditingTrip(t); setIsModalOpen(true); }}
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
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                            b.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 
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
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
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
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
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
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-bold text-gray-900">{editingTrip.id ? 'Edit Destination' : 'New Destination'}</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSaveTrip} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                            <input className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={editingTrip.name || ''} onChange={e => setEditingTrip({...editingTrip, name: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Country</label>
                            <input className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={editingTrip.country || ''} onChange={e => setEditingTrip({...editingTrip, country: e.target.value})} required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price (₹)</label>
                            <input type="number" className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={editingTrip.price || ''} onChange={e => setEditingTrip({...editingTrip, price: Number(e.target.value)})} required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                            <select className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white" value={editingTrip.type || 'Beach'} onChange={e => setEditingTrip({...editingTrip, type: e.target.value})}>
                                {['Beach', 'Mountain', 'City', 'Nature', 'Adventure'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Image URL</label>
                        <input className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={editingTrip.image || ''} onChange={e => setEditingTrip({...editingTrip, image: e.target.value})} required />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                        <textarea className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none" value={editingTrip.description || ''} onChange={e => setEditingTrip({...editingTrip, description: e.target.value})} required />
                    </div>
                    
                    <div className="pt-4 flex gap-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="flex-1 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}