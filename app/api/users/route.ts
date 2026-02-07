import { NextResponse } from 'next/server';
import { USERS_DB } from '@/app/lib/store';

// --- GET: Fetch All Users (Admin Use) ---
export async function GET() {
  try {
    // 1. Simulate Database Latency (300ms)
    // This helps you see loading states in the Admin Dashboard
    await new Promise(resolve => setTimeout(resolve, 300));

    // 2. Data Sanitization (Security Best Practice)
    // Never send passwords to the client, even if hashed.
    const safeUsers = USERS_DB.map(user => {
      // Destructure password out, keep the rest
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    // 3. Return Safe Data
    return NextResponse.json(safeUsers);

  } catch (error) {
    console.error("Fetch Users Error:", error);
    
    return NextResponse.json(
      { error: "Internal Server Error. Could not fetch user list." },
      { status: 500 }
    );
  }
}