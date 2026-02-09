import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import { UserModel } from '@/app/lib/models';

// Helper to simulate token generation (JWT Mock)
const generateMockToken = (id: number | string) => {
  return `ey_tripai_token_${id}_${Date.now()}`;
};

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, email, password } = body;

    // --- 1. Input Validation ---
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, Email, and Password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // --- 2. Duplicate Check ---
    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists." },
        { status: 409 } // 409 Conflict
      );
    }

    // --- 3. User Creation ---
    const newUser = await UserModel.create({
      id: Date.now(), // Generate a numeric ID for compatibility
      name,
      email,
      password, // In prod, use bcrypt.hash(password)
      role: 'user',
      status: 'Active',
      walletBalance: 500, // ✨ Welcome Bonus logic
      joinedAt: new Date().toISOString().split('T')[0],
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`
    });

    // --- 4. Response Preparation ---
    const userObject = newUser.toObject();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, _id, __v, ...userWithoutPassword } = userObject;

    return NextResponse.json({
      success: true,
      message: "Account created successfully!",
      token: generateMockToken(newUser.id),
      user: userWithoutPassword
    });

  } catch (error) {
    console.error("Signup API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error. Please try again later." },
      { status: 500 }
    );
  }
}