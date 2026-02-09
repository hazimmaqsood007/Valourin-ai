import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import { BookingFinalModel as BookingModel, UserModel } from '@/app/lib/models';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await req.json();

        // 1. Simple Update (Wallet logic handled at creation now)
        const updatedBooking = await BookingModel.findOneAndUpdate(
            { id: Number(id) },
            body,
            { new: true }
        );

        if (!updatedBooking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }



        return NextResponse.json(updatedBooking);
    } catch (error) {
        console.error("Update Booking Error:", error);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;

        const result = await BookingModel.deleteOne({ id: Number(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Booking deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
