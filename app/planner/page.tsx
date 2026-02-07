"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// --- TYPES ---
interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
}

interface AIResponse {
  tripTitle: string;
  summary: string;
  itinerary: ItineraryDay[];
}

interface FormData {
  destination: string;
  days: number;
  budget: 'Cheap' | 'Moderate' | 'Luxury';
  travelers: number;
  interests: string[];
}

export default function AIPlanner() {
  const router = useRouter();

  // --- STATE ---
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiData, setAiData] = useState<AIResponse | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<FormData>({
    destination: '',
    days: 3,
    budget: 'Moderate',
    travelers: 2,
    interests: []
  });

  // --- CONSTANTS ---
  const INTERESTS_LIST = [
    { id: 'History', emoji: '🏛️' },
    { id: 'Food', emoji: '🍜' },
    { id: 'Nature', emoji: '🌿' },
    { id: 'Adventure', emoji: '🪂' },
    { id: 'Relaxation', emoji: '💆' },
    { id: 'Nightlife', emoji: '🍸' },
    { id: 'Shopping', emoji: '🛍️' },
    { id: 'Culture', emoji: '🎨' }
  ];

  // --- HANDLERS ---
  const handleInterestToggle = (interest: string) => {
    setFormData(prev => {
      const exists = prev.interests.includes(interest);
      return {
        ...prev,
        interests: exists 
          ? prev.interests.filter(i => i !== interest)
          : [...prev.interests, interest]
      };
    });
  };

  const handleGenerate = async () => {
    if (formData.interests.length === 0) {
      alert("Please select at least one interest!");
      return;
    }

    setLoading(true);
    
    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Generation failed");

      const data = await res.json();
      setAiData(data);
    } catch (error) {
      console.error(error);
      alert("Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookTrip = () => {
    if (!aiData) return;
    // Redirect to booking with estimated price (Mock calculation: ₹5000 * days * travelers)
    const estimatedPrice = 5000 * formData.days * formData.travelers;
    router.push(`/booking?name=${encodeURIComponent(aiData.tripTitle)}&price=${estimatedPrice}`);
  };

  // --- RENDER HELPERS ---
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-2 mb-8">
      {[1, 2, 3].map((s) => (
        <div 
          key={s} 
          className={`h-2 rounded-full transition-all duration-300 ${
            s === step ? 'w-8 bg-blue-600' : s < step ? 'w-2 bg-blue-600' : 'w-2 bg-gray-200'
          }`} 
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      
      {/* Navbar (Minimal) */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <Link href="/" className="font-bold text-xl tracking-tight">Valourin<span className="text-blue-600">AI</span></Link>
        <Link href="/" className="text-sm font-medium text-gray-500 hover:text-black">Exit Planner</Link>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        
        {/* --- RESULT VIEW (ITINERARY) --- */}
        {aiData ? (
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* Header */}
            <div className="bg-blue-600 p-8 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600 to-purple-700 opacity-90"></div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">{aiData.tripTitle}</h2>
                    <p className="text-blue-100 max-w-xl mx-auto">{aiData.summary}</p>
                </div>
            </div>

            {/* Timeline */}
            <div className="p-8 bg-gray-50 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
                    {aiData.itinerary.map((day, i) => (
                        <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            
                            {/* Icon */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-bold text-sm">
                                {day.day}
                            </div>
                            
                            {/* Card */}
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                                <h3 className="font-bold text-lg text-gray-800 mb-3">{day.title}</h3>
                                <ul className="space-y-2">
                                    {day.activities.map((act, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                                            {act}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-100 flex gap-4 bg-white">
                <button 
                    onClick={() => setAiData(null)} 
                    className="flex-1 py-4 rounded-xl font-bold text-gray-600 hover:bg-gray-50 border border-gray-200 transition"
                >
                    Create New
                </button>
                <button 
                    onClick={handleBookTrip} 
                    className="flex-1 py-4 rounded-xl font-bold text-white bg-black hover:bg-gray-800 shadow-lg transition transform hover:-translate-y-1"
                >
                    Book This Trip
                </button>
            </div>
          </div>
        ) : (
          
          /* --- WIZARD FORM --- */
          <div className="w-full max-w-xl">
            {renderStepIndicator()}

            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 relative transition-all duration-500 min-h-[400px] flex flex-col">
              
              {/* STEP 1: DESTINATION & DATES */}
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-300 flex-1 flex flex-col">
                  <h1 className="text-3xl font-bold mb-2">Where to? 🌍</h1>
                  <p className="text-gray-500 mb-8">Let's start with the basics.</p>
                  
                  <div className="space-y-6 flex-1">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Destination</label>
                        <input 
                            autoFocus
                            placeholder="e.g. Kyoto, Japan" 
                            className="w-full text-2xl font-bold border-b-2 border-gray-200 py-2 focus:border-blue-600 outline-none bg-transparent placeholder-gray-300 transition"
                            value={formData.destination}
                            onChange={(e) => setFormData({...formData, destination: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Duration: {formData.days} Days</label>
                        <input 
                            type="range" 
                            min="1" 
                            max="14" 
                            step="1" 
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            value={formData.days}
                            onChange={(e) => setFormData({...formData, days: parseInt(e.target.value)})}
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                            <span>Quick Trip</span>
                            <span>2 Weeks</span>
                        </div>
                    </div>
                  </div>

                  <button 
                    disabled={!formData.destination}
                    onClick={() => setStep(2)} 
                    className="w-full bg-black text-white py-4 rounded-xl font-bold mt-8 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next Step →
                  </button>
                </div>
              )}

              {/* STEP 2: BUDGET & TRAVELERS */}
              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-300 flex-1 flex flex-col">
                  <h1 className="text-3xl font-bold mb-2">Travel Style 🎒</h1>
                  <p className="text-gray-500 mb-8">Help us tailor the costs.</p>

                  <div className="space-y-8 flex-1">
                    
                    {/* Budget Cards */}
                    <div className="grid grid-cols-3 gap-3">
                        {['Cheap', 'Moderate', 'Luxury'].map((b) => (
                            <button 
                                key={b}
                                onClick={() => setFormData({...formData, budget: b as any})}
                                className={`p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                                    formData.budget === b 
                                    ? 'border-blue-600 bg-blue-50 text-blue-700' 
                                    : 'border-gray-100 hover:border-gray-200 text-gray-600'
                                }`}
                            >
                                <span className="text-2xl">{b === 'Cheap' ? '💵' : b === 'Moderate' ? '💰' : '💎'}</span>
                                <span className="text-sm font-bold">{b}</span>
                            </button>
                        ))}
                    </div>

                    {/* Travelers Counter */}
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                        <span className="font-bold text-gray-700">Travelers</span>
                        <div className="flex items-center gap-4 bg-white px-3 py-2 rounded-xl shadow-sm">
                            <button onClick={() => setFormData(p => ({...p, travelers: Math.max(1, p.travelers - 1)}))} className="w-8 h-8 rounded-lg hover:bg-gray-100 font-bold">-</button>
                            <span className="font-bold w-4 text-center">{formData.travelers}</span>
                            <button onClick={() => setFormData(p => ({...p, travelers: Math.min(10, p.travelers + 1)}))} className="w-8 h-8 rounded-lg hover:bg-gray-100 font-bold">+</button>
                        </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button onClick={() => setStep(1)} className="px-6 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100">Back</button>
                    <button onClick={() => setStep(3)} className="flex-1 bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition">Next Step →</button>
                  </div>
                </div>
              )}

              {/* STEP 3: INTERESTS */}
              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-300 flex-1 flex flex-col">
                  <h1 className="text-3xl font-bold mb-2">What do you like? ❤️</h1>
                  <p className="text-gray-500 mb-8">Select at least one interest.</p>

                  <div className="flex flex-wrap gap-3 flex-1 content-start">
                    {INTERESTS_LIST.map((item) => {
                        const isSelected = formData.interests.includes(item.id);
                        return (
                            <button 
                                key={item.id}
                                onClick={() => handleInterestToggle(item.id)}
                                className={`px-4 py-3 rounded-full border transition-all duration-200 text-sm font-bold flex items-center gap-2 ${
                                    isSelected
                                    ? 'bg-black text-white border-black transform scale-105'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                }`}
                            >
                                <span>{item.emoji}</span>
                                {item.id}
                            </button>
                        );
                    })}
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button onClick={() => setStep(2)} className="px-6 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100">Back</button>
                    <button 
                        onClick={handleGenerate} 
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Dreaming...
                            </>
                        ) : "Generate Plan ✨"}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </main>
    </div>
  );
}