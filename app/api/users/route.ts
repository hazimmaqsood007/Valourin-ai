import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import { UserModel } from '@/app/lib/models';

export async function GET() {
  try {
    await dbConnect();
    // Fetch all users, sorted by join date (newest first)
    const users = await UserModel.find({}).sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Fetch Users Error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}