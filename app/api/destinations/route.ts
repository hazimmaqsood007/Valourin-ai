import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import { DestinationModel } from '@/app/lib/models';

/**
 * GET Handler
 * Returns the list of all available destinations from MongoDB.
 */
export async function GET() {
  try {
    await dbConnect();
    const destinations = await DestinationModel.find({});
    return NextResponse.json(destinations);
  } catch (error) {
    console.error("Fetch Destinations Error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

/**
 * POST Handler (Admin)
 * Adds a new destination to MongoDB.
 */
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    // --- 1. Validation ---
    if (!body.name || !body.price || !body.country) {
      return NextResponse.json(
        { error: "Name, Price, and Country are required fields." },
        { status: 400 }
      );
    }

    // --- 2. Object Construction ---
    const newTrip = {
      id: Date.now(), // Consider using MongoDB's _id or a better ID generation strategy
      name: body.name,
      country: body.country,
      price: Number(body.price),
      priceDisplay: `₹${Number(body.price).toLocaleString('en-IN')}`,
      image: body.image || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
      description: body.description || 'Experience an unforgettable journey with our curated travel package.',
      type: body.type || 'Adventure',
      rating: 5.0,
      reviewsCount: 0,
      isFeatured: false,
      gallery: [],
      amenities: body.amenities || ["WiFi", "Breakfast", "Pool", "Guide"],
      inclusions: ["Accommodation", "Daily Breakfast", "Airport Transfers", "English Speaking Guide"],
      exclusions: ["International Flights", "Personal Expenses", "Travel Insurance"],
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
    const createdTrip = await DestinationModel.create(newTrip);

    return NextResponse.json({
      success: true,
      message: "Destination added successfully!",
      data: createdTrip
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
    await dbConnect();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Trip ID is required." }, { status: 400 });
    }

    const result = await DestinationModel.deleteOne({ id: Number(id) });

    if (result.deletedCount > 0) {
      return NextResponse.json({
        success: true,
        message: "Trip deleted successfully."
      });
    } else {
      return NextResponse.json({ error: "Trip not found." }, { status: 404 });
    }

  } catch (error) {
    console.error("Delete Trip Error:", error);
    return NextResponse.json({ error: "Delete operation failed." }, { status: 500 });
  }
}
