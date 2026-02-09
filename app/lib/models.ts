
import mongoose, { Schema, Model } from "mongoose";
import { User, Destination, Booking } from "./store";

// ============================================================================
// USER MODEL
// ============================================================================

const UserSchema = new Schema<User>(
    {
        id: { type: Schema.Types.Mixed, required: true, unique: true },
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: false },
        role: { type: String, enum: ["user", "admin"], default: "user" },
        walletBalance: { type: Number, default: 0 },
        joinedAt: { type: String, default: () => new Date().toISOString().split("T")[0] },
        avatar: { type: String },
        status: { type: String, enum: ["Active", "Banned"], default: "Active" },
    },
    { timestamps: true }
);

// ============================================================================
// DESTINATION MODEL
// ============================================================================

const DestinationSchema = new Schema<Destination>(
    {
        id: { type: Number, required: true, unique: true },
        name: { type: String, required: true },
        country: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        priceDisplay: { type: String, required: true },
        type: {
            type: String,
            enum: ["Beach", "Mountain", "City", "Nature", "Adventure", "Honeymoon"],
            required: true,
        },
        rating: { type: Number, default: 0 },
        reviewsCount: { type: Number, default: 0 },
        image: { type: String, required: true },
        gallery: { type: [String], default: [] },
        amenities: { type: [String], default: [] },
        inclusions: { type: [String], default: [] },
        exclusions: { type: [String], default: [] },
        itinerary: [
            {
                day: { type: Number, required: true },
                title: { type: String, required: true },
                activities: { type: [String], required: true },
                meals: { type: [String] },
            },
        ],
        isFeatured: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// ============================================================================
// BOOKING MODEL
// ============================================================================

const BookingSchema = new Schema<Booking>(
    {
        id: { type: Number, required: true, unique: true },
        userId: { type: Schema.Types.Mixed, required: false },
        customerName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String },
        destinationId: { type: Number },
        destinationName: { type: String, required: true },
        date: { type: String, required: true },
        guests: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
        pointsUsed: { type: Number, default: 0 },
        pointsEarned: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ["Confirmed", "Pending", "Cancelled", "Completed"],
            default: "Pending",
        },
        paymentMethod: {
            type: String,
            // NO ENUM VALIDATION TO FIX 500 ERROR
            required: true,
        },
        createdAt: { type: String, default: () => new Date().toISOString() },
    },
    { timestamps: true }
);

// Prevent overwriting models during hot reload
export const UserModel: Model<User> =
    mongoose.models.User || mongoose.model<User>("User", UserSchema);
export const DestinationModel: Model<Destination> =
    mongoose.models.Destination || mongoose.model<Destination>("Destination", DestinationSchema);

// USE FRESH MODEL NAME
export const BookingFinalModel: Model<Booking> =
    mongoose.models.BookingFinal || mongoose.model<Booking>("BookingFinal", BookingSchema, "bookings");

export const BookingModel = BookingFinalModel;
