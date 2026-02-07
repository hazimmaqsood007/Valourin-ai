"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// --- TYPES ---
interface Trip {
  id: number;
  name: string;
  country: string;
  price: number;
  image: string;
  type: string;
  description: string;
}

interface Booking {
  id: number;
  customerName: string;
  email: string;
  destinationName: string;
  totalPrice: number;
  date: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  pointsEarned: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  walletBalance: number;
  joinedAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  
  // --- STATE ---
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'trips' | 'bookings' | 'users'>('overview');
  
  // Data
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Stats
  const [stats, setStats] = useState({ revenue: 0, totalBookings: 0, activeUsers: 0 });

  // Forms
  const [newTrip, setNewTrip] = useState<Partial<Trip>>({ type: 'Beach' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- INITIALIZATION ---
  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const isAdmin = localStorage.getItem('isAdmin');
      if (!isAdmin) {
        router.push('/login');
        return;
      }

      try {
        // Parallel Fetch for Speed
        const [tripsRes, bookingsRes, usersRes] = await Promise.all([
          fetch('/api/destinations'),
          fetch('/api/bookings'),
          fetch('/api/users')
        ]);

        const tripsData = await tripsRes.json();
        const bookingsData = await bookingsRes.json();
        const usersData = await usersRes.json();

        setTrips(tripsData);
        setBookings(bookingsData);
        setUsers(usersData);

        // Calculate Stats
        const totalRev = bookingsData.reduce((acc: number, b: Booking) => acc + b.totalPrice, 0);
        setStats({
          revenue: totalRev,
          totalBookings: bookingsData.length,
          activeUsers: usersData.length
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Admin Load Error:", error);
        alert("Failed to load admin data.");
      }
    };

    checkAuthAndFetch();
  }, [router]);

  // --- HANDLERS ---
  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    router.push('/login');
  };

  const handleAddTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTrip)
      });
      if (!res.ok) throw new Error("Failed");
      
      const data = await res.json();
      setTrips([...trips, data.data]); // Optimistic Update
      setNewTrip({ name: '', country: '', price: 0, image: '', description: '', type: 'Beach' });
      alert("Trip published successfully!");
    } catch (error) {
      alert("Error adding trip.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTrip = async (id: number) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    try {
      await fetch('/api/destinations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      setTrips(trips.filter(t => t.id !== id));
    } catch (error) {
      alert("Error deleting trip.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p>Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* ======================= */}
      {/* SIDEBAR NAVIGATION      */}
      {/* ======================= */}
      <aside className="w-72 bg-gray-900 text-white flex flex-col justify-between fixed h-full z-20 shadow-2xl transition-all">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10 text-white">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-900/50">T</div>
            <div>
                <h1 className="text-xl font-bold tracking-tight">ValourinAI</h1>
                <p className="text-xs text-gray-400 font-medium tracking-wide">ADMIN CONSOLE</p>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'overview', label: 'Dashboard', icon: '📊' },
              { id: 'trips', label: 'Destinations', icon: '🌍' },
              { id: 'bookings', label: 'Bookings', icon: '📅' },
              { id: 'users', label: 'Users', icon: '👥' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20 translate-x-1' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
                }`}
              >
                <span className="text-lg opacity-80">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 border-t border-gray-800">
            <Link href="/" className="flex items-center gap-3 text-sm text-gray-400 hover:text-white mb-4 transition px-2">
                <span>←</span> Back to Website
            </Link>
            <button 
                onClick={handleLogout}
                className="w-full bg-gray-800 hover:bg-red-600/90 text-gray-300 hover:text-white py-3 rounded-xl font-bold text-sm transition-colors duration-300 flex items-center justify-center gap-2"
            >
                Logout
            </button>
        </div>
      </aside>

      {/* ======================= */}
      {/* MAIN CONTENT AREA       */}
      {/* ======================= */}
      <main className="ml-72 flex-1 p-8 lg:p-12">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 capitalize">{activeTab} Overview</h2>
                <p className="text-gray-500 text-sm mt-1">Manage your platform efficiently.</p>
            </div>
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">System Online</span>
            </div>
        </header>

        {/* --- VIEW: OVERVIEW --- */}
        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
                    <div className="text-blue-200 text-sm font-bold uppercase mb-2">Total Revenue</div>
                    <div className="text-4xl font-bold">₹{stats.revenue.toLocaleString('en-IN')}</div>
                    <div className="mt-4 text-xs bg-white/20 inline-block px-2 py-1 rounded">+12% from last month</div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="text-gray-400 text-sm font-bold uppercase mb-2">Total Bookings</div>
                    <div className="text-4xl font-bold text-gray-900">{stats.totalBookings}</div>
                    <p className="text-xs text-gray-400 mt-2">Pending processing: 2</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="text-gray-400 text-sm font-bold uppercase mb-2">Active Users</div>
                    <div className="text-4xl font-bold text-gray-900">{stats.activeUsers}</div>
                    <p className="text-xs text-gray-400 mt-2">New today: 1</p>
                </div>
            </div>
        )}

        {/* --- VIEW: MANAGE TRIPS --- */}
        {activeTab === 'trips' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Add Trip Form */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 mb-10">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">+</span>
                        <h3 className="font-bold text-lg text-gray-800">Add New Destination</h3>
                    </div>
                    <form onSubmit={handleAddTrip} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Trip Name</label>
                            <input className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={newTrip.name || ''} onChange={e => setNewTrip({...newTrip, name: e.target.value})} placeholder="e.g. Paradise Island" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Country</label>
                            <input className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={newTrip.country || ''} onChange={e => setNewTrip({...newTrip, country: e.target.value})} placeholder="e.g. Maldives" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Price (₹)</label>
                            <input type="number" className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={newTrip.price || ''} onChange={e => setNewTrip({...newTrip, price: Number(e.target.value)})} placeholder="0" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
                            <select className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white" value={newTrip.type} onChange={e => setNewTrip({...newTrip, type: e.target.value})}>
                                <option>Beach</option><option>Mountain</option><option>City</option><option>Nature</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Image URL</label>
                            <input className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={newTrip.image || ''} onChange={e => setNewTrip({...newTrip, image: e.target.value})} placeholder="https://..." required />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                            <textarea className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none" value={newTrip.description || ''} onChange={e => setNewTrip({...newTrip, description: e.target.value})} placeholder="Describe the trip..." required />
                        </div>
                        <button disabled={isSubmitting} className="md:col-span-2 bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold shadow-lg transition disabled:opacity-50">
                            {isSubmitting ? 'Publishing...' : 'Publish Trip'}
                        </button>
                    </form>
                </div>

                {/* Trip Grid */}
                <h3 className="font-bold text-xl mb-6 text-gray-800">Active Listings ({trips.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trips.map(t => (
                        <div key={t.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition group">
                            <div className="h-48 w-full rounded-xl overflow-hidden mb-4 relative bg-gray-100">
                                <img src={t.image} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt={t.name} />
                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded text-xs font-bold">{t.type}</div>
                            </div>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-lg text-gray-900 leading-tight">{t.name}</h4>
                                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded">₹{t.price.toLocaleString('en-IN')}</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-4 line-clamp-2">{t.description}</p>
                            <button 
                                onClick={() => handleDeleteTrip(t.id)} 
                                className="w-full py-2 rounded-lg border border-red-100 text-red-500 text-sm font-bold hover:bg-red-50 transition"
                            >
                                Remove Listing
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- VIEW: BOOKINGS --- */}
        {activeTab === 'bookings' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                            <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Trip</th>
                            <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {bookings.map((b) => (
                            <tr key={b.id} className="hover:bg-gray-50 transition">
                                <td className="p-5 font-mono text-xs text-gray-400">#{b.id}</td>
                                <td className="p-5">
                                    <p className="font-bold text-gray-900 text-sm">{b.customerName}</p>
                                    <p className="text-xs text-gray-500">{b.email}</p>
                                </td>
                                <td className="p-5 font-medium text-sm text-gray-700">{b.destinationName}</td>
                                <td className="p-5 text-sm text-gray-500">{b.date}</td>
                                <td className="p-5">
                                    <span className="font-bold text-gray-900">₹{b.totalPrice.toLocaleString('en-IN')}</span>
                                    <span className="block text-[10px] text-green-600 font-bold">+{b.pointsEarned} pts</span>
                                </td>
                                <td className="p-5">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${b.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {b.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {bookings.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-gray-400">No bookings recorded.</td></tr>}
                    </tbody>
                </table>
            </div>
        )}

        {/* --- VIEW: USERS --- */}
        {activeTab === 'users' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                            <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Wallet Balance</th>
                            <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined Date</th>
                            <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50 transition">
                                <td className="p-5 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 text-white flex items-center justify-center font-bold text-xs">
                                        {u.name.charAt(0)}
                                    </div>
                                    <span className="font-bold text-sm text-gray-900">{u.name}</span>
                                </td>
                                <td className="p-5 text-sm text-gray-500">{u.email}</td>
                                <td className="p-5 font-bold text-blue-600">₹{u.walletBalance.toLocaleString('en-IN')}</td>
                                <td className="p-5 text-sm text-gray-500">{u.joinedAt}</td>
                                <td className="p-5"><span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">Active</span></td>
                            </tr>
                        ))}
                        {users.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-gray-400">No registered users.</td></tr>}
                    </tbody>
                </table>
            </div>
        )}

      </main>
    </div>
  );
}