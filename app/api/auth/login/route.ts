import { NextResponse } from 'next/server';
import { USERS_DB } from '@/app/lib/store';

// Helper to simulate a secure token generation
const generateMockToken = (id: number | string, role: string) => {
  return `ey_mock_token_${role}_${id}_${Date.now()}`;
};

export async function POST(req: Request) {
  try {
    // 1. Parse Request Body
    const body = await req.json();
    const { email, password } = body;

    // 2. Input Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // Simulate Database/Network Delay (300ms) for realism
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 3. ADMIN CHECK (Hardcoded for Demo)
    if (email === 'admin@tripai.com' && password === 'admin123') {
      return NextResponse.json({
        success: true,
        role: 'admin',
        token: generateMockToken('admin', 'admin'),
        user: {
          id: 'admin_01',
          name: 'Super Admin',
          email: 'admin@tripai.com',
          avatar: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff'
        }
      });
    }

    // 4. USER CHECK (Search in Mock DB)
    // In a real app, you would hash the password here before comparing
    const user = USERS_DB.find((u) => u.email === email && u.password === password);

    if (user) {
      // Remove sensitive data (password) before sending back
      const { password: _, ...userWithoutPassword } = user;
      
      return NextResponse.json({
        success: true,
        role: 'user',
        token: generateMockToken(user.id, 'user'),
        user: userWithoutPassword
      });
    }

    // 5. Auth Failed
    return NextResponse.json(
      { error: "Invalid email or password. Please try again." },
      { status: 401 }
    );

  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error. Please contact support." },
      { status: 500 }
    );
  }
}