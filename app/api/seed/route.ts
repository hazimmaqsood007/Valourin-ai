
import mongoose from "mongoose";
import dbConnect from "@/app/lib/db";
import { UserModel, DestinationModel, BookingModel } from "@/app/lib/models";
import { USERS_DB, DESTINATIONS_DB, BOOKINGS_DB } from "@/app/lib/store";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await dbConnect();

        // 1. Seed Users
        const userCount = await UserModel.countDocuments();
        if (userCount === 0) {
            await UserModel.insertMany(USERS_DB);
            console.log("Users seeded");
        }

        // 2. Seed Destinations
        const destCount = await DestinationModel.countDocuments();
        if (destCount === 0) {
            await DestinationModel.insertMany(DESTINATIONS_DB);
            console.log("Destinations seeded");
        }

        // 3. Seed Bookings
        const bookingCount = await BookingModel.countDocuments();
        if (bookingCount === 0) {
            await BookingModel.insertMany(BOOKINGS_DB);
            console.log("Bookings seeded");
        }

        return NextResponse.json({ message: "Database seeded successfully (if it was empty)" });
    } catch (error) {
        console.error("Seeding Error:", error);
        return NextResponse.json({ error: "Seeding failed" }, { status: 500 });
    }
}
