// ============================================================================
// 1. TYPE DEFINITIONS (STRICT SCHEMA)
// ============================================================================

export interface User {
  id: number | string;
  name: string;
  email: string;
  password?: string; // Note: In production, never store plain text passwords
  role: 'user' | 'admin';
  walletBalance: number;
  joinedAt: string;
  avatar?: string;
  status: 'Active' | 'Banned';
}

export interface Review {
  id: number;
  userId: number;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
}

export interface ItineraryItem {
  day: number;
  title: string;
  activities: string[];
  meals?: string[];
}

export interface Destination {
  id: number;
  name: string;
  country: string;
  description: string;
  price: number;
  priceDisplay: string;
  type: 'Beach' | 'Mountain' | 'City' | 'Nature' | 'Adventure' | 'Honeymoon';
  rating: number;
  reviewsCount: number;
  image: string;
  gallery: string[];
  amenities: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryItem[];
  isFeatured?: boolean;
}

export interface Booking {
  id: number;
  userId: number | string | null;
  customerName: string;
  email: string;
  phone?: string;
  destinationId?: number;
  destinationName: string;
  date: string;
  guests: number;
  totalPrice: number;
  pointsUsed: number;
  pointsEarned: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
  paymentMethod: 'Credit Card' | 'Wallet' | 'UPI' | 'Net Banking' | 'Card + Wallet';
  createdAt: string;
}

// ============================================================================
// 3. INITIAL SEED DATA
// ============================================================================

const INITIAL_USERS: User[] = [
  {
    id: 1,
    name: "Demo User",
    email: "user@demo.com",
    password: "password",
    role: "user",
    walletBalance: 2500,
    joinedAt: "2024-01-15",
    status: "Active",
    avatar: "https://ui-avatars.com/api/?name=Demo+User&background=0D8ABC&color=fff"
  },
  {
    id: 999,
    name: "System Admin",
    email: "admin@tripai.com",
    password: "admin123",
    role: "admin",
    walletBalance: 1000000,
    joinedAt: "2023-11-01",
    status: "Active",
    avatar: "https://ui-avatars.com/api/?name=Admin&background=111827&color=fff"
  }
];

const INITIAL_DESTINATIONS: Destination[] = [
  {
    id: 101,
    name: "Goa Beach Paradise",
    country: "India",
    type: "Beach",
    price: 18500,
    priceDisplay: "₹18,500",
    rating: 4.8,
    reviewsCount: 342,
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",
    gallery: ["https://images.unsplash.com/photo-1544234033-d922650ee47b?w=800"],
    description: "Experience the perfect blend of Portuguese culture and Indian heritage. Our AI has curated a mix of hidden beaches, vibrant night markets, and historical forts just for you.",
    amenities: ["WiFi", "Pool", "Beach Access", "Bar", "Spa"],
    inclusions: ["4 Star Accommodation", "Daily Breakfast", "Airport Transfers"],
    exclusions: ["Airfare", "Personal Expenses", "Lunch & Dinner"],
    itinerary: [
      { day: 1, title: "Arrival", activities: ["Airport Pickup", "Check-in at Taj Resort"] },
      { day: 2, title: "North Goa Beaches", activities: ["Anjuna Beach", "Baga Beach Water Sports"] },
      { day: 3, title: "South Goa Culture", activities: ["Basilica of Bom Jesus", "Miramar Beach"] },
      { day: 4, title: "Departure", activities: ["Breakfast", "Airport Transfer"] }
    ],
    isFeatured: true
  },
  {
    id: 102,
    name: "Manali Snow Peaks",
    country: "India",
    type: "Mountain",
    price: 12999,
    priceDisplay: "₹12,999",
    rating: 4.6,
    reviewsCount: 128,
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80",
    gallery: [],
    description: "Snow-capped mountains, river adventures, and cozy cafes await you in Manali.",
    amenities: ["Heater", "Bonfire", "Trekking Guide"],
    inclusions: ["3 Star Hotel", "Breakfast & Dinner", "Sightseeing Cab"],
    exclusions: ["Rohtang Permit", "Lunch"],
    itinerary: [
      { day: 1, title: "Arrival", activities: ["Volvo Stand Pickup", "Check-in"] },
      { day: 2, title: "Solang Valley", activities: ["Skiing", "Paragliding", "ATV Ride"] },
      { day: 3, title: "Departure", activities: ["Mall Road", "Bus to Delhi"] }
    ]
  },
  {
    id: 103,
    name: "Royal Jaipur",
    country: "India",
    type: "City",
    price: 9500,
    priceDisplay: "₹9,500",
    rating: 4.5,
    reviewsCount: 512,
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80",
    gallery: [],
    description: "The Pink City offers a royal experience with its majestic forts and palaces.",
    amenities: ["Heritage Stay", "Guide", "Cultural Show"],
    inclusions: ["Heritage Hotel", "Guide Fees"],
    exclusions: ["Entry Tickets", "Lunch"],
    itinerary: [
      { day: 1, title: "City Palace", activities: ["Check-in", "City Palace Tour"] },
      { day: 2, title: "Amber Fort", activities: ["Elephant Ride", "Fort Tour"] },
      { day: 3, title: "Departure", activities: ["Hawa Mahal", "Airport Drop"] }
    ]
  },
  {
    id: 104,
    name: "Kerala Backwaters",
    country: "India",
    type: "Nature",
    price: 22000,
    priceDisplay: "₹22,000",
    rating: 4.9,
    reviewsCount: 89,
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80",
    gallery: [],
    description: "Relax in a luxury houseboat as you cruise through the serene backwaters of Alleppey.",
    amenities: ["Houseboat", "Ayurvedic Spa", "All Meals"],
    inclusions: ["Houseboat Stay", "All Meals", "Canoe Ride"],
    exclusions: ["Airfare", "Massage"],
    itinerary: [
      { day: 1, title: "Alleppey", activities: ["Check-in Houseboat", "Lunch on Board"] },
      { day: 2, title: "Cruise", activities: ["Village Walk", "Sunset Cruise"] }
    ]
  },
  {
    id: 105,
    name: "Bali Tropical Escape",
    country: "Indonesia",
    type: "Honeymoon",
    price: 45000,
    priceDisplay: "₹45,000",
    rating: 4.9,
    reviewsCount: 1024,
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    gallery: [],
    description: "Experience the magic of Bali with private pool villas, floating breakfasts, and sunset temple tours.",
    amenities: ["Private Pool", "Spa", "WiFi", "Bar"],
    inclusions: ["Villa Stay", "Floating Breakfast", "Airport Transfers"],
    exclusions: ["Flights", "Visa", "Lunch"],
    itinerary: [
      { day: 1, title: "Arrival", activities: ["Airport Pickup", "Villa Check-in"] },
      { day: 2, title: "Ubud Tour", activities: ["Monkey Forest", "Rice Terraces"] },
      { day: 3, title: "Nusa Penida", activities: ["Speedboat", "Kelingking Beach"] },
      { day: 4, title: "Departure", activities: ["Souvenir Shopping", "Airport Drop"] }
    ]
  },
  {
    id: 106,
    name: "Paris Romantic Getaway",
    country: "France",
    type: "City",
    price: 85000,
    priceDisplay: "₹85,000",
    rating: 4.7,
    reviewsCount: 210,
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    gallery: [],
    description: "Walk the streets of Paris, visit the Eiffel Tower, and enjoy a Seine river cruise.",
    amenities: ["City View", "Metro Access", "Breakfast"],
    inclusions: ["3 Star Hotel", "Seine Cruise Ticket", "Eiffel Access"],
    exclusions: ["Flights", "Visa", "City Tax"],
    itinerary: [
      { day: 1, title: "Arrival", activities: ["Check-in", "Eiffel Tower Night View"] },
      { day: 2, title: "Louvre", activities: ["Museum Tour", "Champs-Élysées"] },
      { day: 3, title: "Departure", activities: ["Montmartre", "Airport Train"] }
    ]
  },
  {
    id: 107,
    name: "Dubai Desert Safari",
    country: "UAE",
    type: "Adventure",
    price: 35000,
    priceDisplay: "₹35,000",
    rating: 4.6,
    reviewsCount: 450,
    image: "https://images.unsplash.com/photo-1512453979798-5ea904ac66de?w=800&q=80",
    gallery: [],
    description: "Skyscrapers, shopping, and sand dunes. The ultimate modern adventure.",
    amenities: ["Pool", "Gym", "WiFi"],
    inclusions: ["4 Star Hotel", "Desert Safari BBQ", "Burj Khalifa Ticket"],
    exclusions: ["Flights", "Visa", "Tourism Dirham"],
    itinerary: [
      { day: 1, title: "Arrival", activities: ["Airport Pickup", "Dhow Cruise Dinner"] },
      { day: 2, title: "City Tour", activities: ["Burj Khalifa", "Dubai Mall"] },
      { day: 3, title: "Desert Safari", activities: ["Dune Bashing", "BBQ Dinner"] },
      { day: 4, title: "Departure", activities: ["Gold Souk", "Airport Drop"] }
    ]
  },
  {
    id: 108,
    name: "Kyoto Cultural Walk",
    country: "Japan",
    type: "Nature",
    price: 95000,
    priceDisplay: "₹95,000",
    rating: 5.0,
    reviewsCount: 150,
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
    gallery: [],
    description: "Immerse yourself in ancient temples, bamboo forests, and tea ceremonies.",
    amenities: ["Ryokan Stay", "Onsen", "Tea Set"],
    inclusions: ["Ryokan Accommodation", "Kaiseki Dinner", "Temple Pass"],
    exclusions: ["Flights", "Visa", "Bullet Train"],
    itinerary: [
      { day: 1, title: "Arrival", activities: ["Check-in Ryokan", "Gion Walk"] },
      { day: 2, title: "Arashiyama", activities: ["Bamboo Grove", "Tenryu-ji"] },
      { day: 3, title: "Fushimi Inari", activities: ["Shrine Hike", "Sake Tasting"] },
      { day: 4, title: "Departure", activities: ["Kyoto Station", "Train to Osaka"] }
    ]
  }
];

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 5001,
    userId: 1,
    customerName: "Demo User",
    email: "user@demo.com",
    phone: "9876543210",
    destinationId: 101,
    destinationName: "Goa Beach Paradise",
    totalPrice: 45000,
    guests: 2,
    date: "2024-12-10",
    status: "Confirmed",
    paymentMethod: "Credit Card",
    pointsUsed: 0,
    pointsEarned: 2250,
    createdAt: "2024-11-20T10:30:00Z"
  },
  {
    id: 5002,
    userId: 1,
    customerName: "Demo User",
    email: "user@demo.com",
    destinationName: "Manali Snow Peaks",
    totalPrice: 25998,
    guests: 2,
    date: "2024-01-15",
    status: "Completed",
    paymentMethod: "UPI",
    pointsUsed: 500,
    pointsEarned: 1299,
    createdAt: "2023-12-25T14:20:00Z"
  },
  {
    id: 5003,
    userId: 999, // Admin testing
    customerName: "Admin User",
    email: "admin@tripai.com",
    destinationName: "Dubai Desert Safari",
    totalPrice: 35000,
    guests: 1,
    date: "2025-03-10",
    status: "Pending",
    paymentMethod: "Credit Card",
    pointsUsed: 0,
    pointsEarned: 1750,
    createdAt: "2025-02-01T09:00:00Z"
  },
  {
    id: 5004,
    userId: 2, // Guest/Deleted user
    customerName: "Rahul Verma",
    email: "rahul@test.com",
    destinationName: "Royal Jaipur",
    totalPrice: 19000,
    guests: 2,
    date: "2025-02-14",
    status: "Cancelled",
    paymentMethod: "Net Banking",
    pointsUsed: 0,
    pointsEarned: 0,
    createdAt: "2025-01-28T09:15:00Z"
  }
];

export const USERS_DB = INITIAL_USERS;
export const DESTINATIONS_DB = INITIAL_DESTINATIONS;
export const BOOKINGS_DB = INITIAL_BOOKINGS;