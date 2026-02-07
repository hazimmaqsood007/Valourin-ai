import { NextResponse } from 'next/server';
import { DESTINATIONS_DB, Destination } from '@/app/lib/store';

/**
 * GET Handler
 * Returns the list of all available destinations.
 * Includes a simulated delay for realistic loading skeleton testing.
 */
export async function GET() {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    return NextResponse.json(DESTINATIONS_DB);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

/**
 * POST Handler (Admin)
 * Adds a new destination to the database.
 * Auto-fills missing rich data (Itinerary, Amenities) to prevent UI crashes.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // --- 1. Validation ---
    if (!body.name || !body.price || !body.country) {
      return NextResponse.json(
        { error: "Name, Price, and Country are required fields." }, 
        { status: 400 }
      );
    }

    // --- 2. Object Construction ---
    // We construct a strictly typed Destination object here.
    const newTrip: Destination = {
      id: Date.now(),
      name: body.name,
      country: body.country,
      price: Number(body.price),
      // Auto-format currency string
      priceDisplay: `₹${Number(body.price).toLocaleString('en-IN')}`,
      image: body.image || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80', // Fallback image
      description: body.description || 'Experience an unforgettable journey with our curated travel package.',
      type: body.type || 'Adventure', // Default category
      
      // Default Stats
      rating: 5.0,
      reviewsCount: 0,
      isFeatured: false,
      
      // Rich Data Defaults (Ensure arrays are never null)
      gallery: [],
      amenities: body.amenities || ["WiFi", "Breakfast", "Pool", "Guide"],
      inclusions: ["Accommodation", "Daily Breakfast", "Airport Transfers", "English Speaking Guide"],
      exclusions: ["International Flights", "Personal Expenses", "Travel Insurance"],
      
      // Default Itinerary Construction
      itinerary: [
        { 
          day: 1, 
          title: "Arrival & Welcome", 
          activities: ["Airport Pickup", "Hotel Check-in", "Welcome Drink", "Relaxation"], 
          meals: ["Dinner"] 
        },
        { 
          day: 2, 
          title: "City Exploration", 
          activities: ["Guided City Tour", "Local Cuisine Lunch", "Visit Famous Landmarks"],
          meals: ["Breakfast", "Lunch"]
        },
        { 
          day: 3, 
          title: "Departure", 
          activities: ["Breakfast Buffet", "Souvenir Shopping", "Airport Transfer"],
          meals: ["Breakfast"]
        }
      ]
    };

    // --- 3. Save Data ---
    DESTINATIONS_DB.push(newTrip);
    
    return NextResponse.json({ 
      success: true, 
      message: "Destination added successfully!",
      data: newTrip 
    });

  } catch (error) {
    console.error("Add Trip Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error. Could not create destination." },
      { status: 500 }
    );
  }
}

/**
 * DELETE Handler (Admin)
 * Removes a destination by ID.
 */
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Trip ID is required." }, { status: 400 });
    }

    const index = DESTINATIONS_DB.findIndex((d) => d.id === Number(id));
    
    if (index !== -1) {
      DESTINATIONS_DB.splice(index, 1);
      return NextResponse.json({ 
        success: true, 
        message: "Trip deleted successfully." 
      });
    } else {
      return NextResponse.json({ error: "Trip not found." }, { status: 404 });
    }

  } catch (error) {
    return NextResponse.json({ error: "Delete operation failed." }, { status: 500 });
  }
}