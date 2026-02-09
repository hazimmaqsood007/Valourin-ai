import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import { BookingFinalModel as BookingModel, UserModel } from '@/app/lib/models'; // Alias for compatibility
import { Booking } from '@/app/lib/store';

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic';

/**
 * GET HANDLER
 * Scenarios:
 * 1. Admin Request: Returns ALL bookings sorted by date (Newest First).
 * 2. User Request: Returns only the booking history for a specific user ID.
 */
export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (userId) {
      // Handle Mixed type (String or Number) for userId
      const query = !isNaN(Number(userId))
        ? { userId: { $in: [userId, Number(userId)] } }
        : { userId };

      console.log("Fetching bookings for query:", JSON.stringify(query));
      const userBookings = await BookingModel.find(query).sort({ createdAt: -1 });
      return NextResponse.json(userBookings);
    }

    // Admin View
    const allBookings = await BookingModel.find({}).sort({ createdAt: -1 });
    return NextResponse.json(allBookings);

  } catch (error) {
    console.error("Booking Fetch Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error. Unable to fetch bookings." },
      { status: 500 }
    );
  }
}

/**
 * POST HANDLER (CREATE BOOKING)
 * Create booking and handle wallet logic.
 */
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    console.log("PAYLOAD RECEIVED:", JSON.stringify(body, null, 2)); // DEBUG LOG
    const {
      userId,
      customerName,
      email,
      destinationName,
      destinationId,
      totalPrice,
      guests,
      date,
      pointsUsed = 0,
      status = 'Confirmed',
      paymentMethod = 'Credit Card'
    } = body;

    // --- 1. Input Validation ---
    if (!customerName || !email || !destinationName || !date || !totalPrice) {
      return NextResponse.json(
        { error: "Missing required booking details." },
        { status: 400 }
      );
    }

    // --- 2. Wallet & Reward Logic (Immediate Processing) ---
    const pointsToDeduct = pointsUsed || 0;
    const pointsEarned = Math.floor(totalPrice * 0.05); // 5% Reward
    let updatedUserBalance = 0;

    if (userId) {
      const user = await UserModel.findOne({ id: userId });
      if (user) {
        if (user.walletBalance < pointsToDeduct) {
          return NextResponse.json(
            { error: "Insufficient wallet balance." },
            { status: 400 }
          );
        }

        // Atomic Update: Deduct used points & Add earned points
        const updatedUser = await UserModel.findOneAndUpdate(
          { id: userId },
          { $inc: { walletBalance: pointsEarned - pointsToDeduct } },
          { new: true }
        );
        updatedUserBalance = updatedUser?.walletBalance || 0;
      }
    }

    // --- 3. Record Creation ---
    const finalStatus: Booking['status'] = 'Confirmed'; // Auto-confirm

    const newBooking = {
      id: Date.now(),
      userId: userId || null,
      customerName,
      phone: body.phone,
      email,
      destinationName,
      destinationId: destinationId || 0,
      guests: guests || 1,
      totalPrice,
      pointsUsed: pointsToDeduct,
      pointsEarned: pointsEarned,
      date,
      status: finalStatus,
      paymentMethod: paymentMethod,
      createdAt: new Date().toISOString()
    };

    const createdBooking = await BookingModel.create(newBooking);

    // --- 4. Success Response ---
    return NextResponse.json({
      success: true,
      message: "Booking confirmed!",
      booking: createdBooking,
      updatedBalance: updatedUserBalance
    });

  } catch (error: any) {
    console.error("Booking Creation Error:", error);
    // Return specific validation error if available
    return NextResponse.json(
      { error: error.message || "System Error: Could not process booking." },
      { status: 500 }
    );
  }
}
