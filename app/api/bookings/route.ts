import { NextResponse } from 'next/server';
import { BOOKINGS_DB, USERS_DB, Booking, User } from '@/app/lib/store';

/**
 * ============================================================================
 * GET HANDLER
 * ============================================================================
 * Scenarios:
 * 1. Admin Request: Returns ALL bookings sorted by date (Newest First).
 * 2. User Request: Returns only the booking history for a specific user ID.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    // Simulate Network Latency (200ms) for realistic loading states
    await new Promise((resolve) => setTimeout(resolve, 200));

    // --- Scenario A: User Specific History ---
    if (userId) {
      // Filter bookings for the specific user
      // Note: Using loose equality (==) to handle string '1' matching number 1
      // eslint-disable-next-line eqeqeq
      const userBookings = BOOKINGS_DB.filter((b) => b.userId == userId);
      
      // Sort by newest first
      const sortedUserBookings = userBookings.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return NextResponse.json(sortedUserBookings);
    }

    // --- Scenario B: Admin View (All Records) ---
    // Return all bookings sorted by newest first
    const allBookings = [...BOOKINGS_DB].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
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
 * ============================================================================
 * POST HANDLER (CREATE BOOKING)
 * ============================================================================
 * Capabilities:
 * 1. Validates all required fields.
 * 2. Handles "Pay Now" logic (Deducts Wallet, Adds Rewards, Sets Status to Confirmed).
 * 3. Handles "Pay Later" logic (Skips Wallet, Sets Status to Pending).
 * 4. Updates the User's balance in the mock DB.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      userId, 
      customerName, 
      email, 
      destinationName, 
      destinationId, // Optional link
      totalPrice, 
      guests,
      date, 
      pointsUsed = 0,
      // Default to Confirmed if not specified, but UI sends 'Pending' for Pay Later
      status = 'Confirmed', 
      paymentMethod = 'Credit Card' 
    } = body;

    // --- 1. Input Validation Layer ---
    if (!customerName || !email || !destinationName || !date || !totalPrice) {
      return NextResponse.json(
        { error: "Missing required booking details (Name, Email, Trip, Date, Price)." },
        { status: 400 }
      );
    }

    let finalPointsEarned = 0;
    
    // --- 2. Wallet & Reward Logic Engine ---
    // We only process wallet deductions and rewards if the booking is CONFIRMED (Paid Now)
    if (userId && status === 'Confirmed') {
      
      // Find user in the mock database
      // eslint-disable-next-line eqeqeq
      const userIndex = USERS_DB.findIndex((u) => u.id == userId);
      
      if (userIndex !== -1) {
        const user = USERS_DB[userIndex];

        // A. Deduction Logic (Protection Check)
        if (pointsUsed > 0) {
          if (user.walletBalance < pointsUsed) {
            return NextResponse.json(
              { error: "Transaction Failed: Insufficient wallet balance." },
              { status: 400 }
            );
          }
          // Deduct points
          user.walletBalance -= pointsUsed;
        }

        // B. Reward Calculation (5% of total price)
        // Usually rewards are based on cash component, simplified here to total price
        finalPointsEarned = Math.floor(totalPrice * 0.05);

        // C. Credit Rewards
        user.walletBalance += finalPointsEarned;
        
        // Update the User DB Record
        USERS_DB[userIndex] = user;
      }
    }

    // --- 3. Record Creation ---
    // Determine the final status based on the payment intent
    const finalStatus: Booking['status'] = status === 'Pending' ? 'Pending' : 'Confirmed';

    const newBooking: Booking = {
      id: Date.now(), // Generate unique ID based on timestamp
      userId: userId || null,
      customerName,
      email,
      destinationName,
      destinationId: destinationId || 0, // Fallback ID
      guests: guests || 1,
      totalPrice,
      
      // Only record points used if actually confirmed
      pointsUsed: finalStatus === 'Confirmed' ? pointsUsed : 0,
      
      // Only award points if actually confirmed
      pointsEarned: finalStatus === 'Confirmed' ? finalPointsEarned : 0,
      
      date,
      status: finalStatus,
      paymentMethod: paymentMethod, 
      createdAt: new Date().toISOString()
    };

    // Add to top of the list (LIFO)
    BOOKINGS_DB.unshift(newBooking);

    // --- 4. Success Response ---
    return NextResponse.json({
      success: true,
      message: finalStatus === 'Confirmed' ? "Booking confirmed!" : "Reservation saved.",
      booking: newBooking,
      // Return updated balance so frontend can sync immediately
      updatedBalance: userId ? USERS_DB.find(u => u.id == userId)?.walletBalance : null
    });

  } catch (error) {
    console.error("Booking Creation Error:", error);
    return NextResponse.json(
      { error: "System Error: Could not process booking." },
      { status: 500 }
    );
  }
}