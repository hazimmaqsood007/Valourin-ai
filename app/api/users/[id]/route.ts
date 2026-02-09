import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import { UserModel } from '@/app/lib/models';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await req.json();

        let query: any;
        if (!isNaN(Number(id))) {
            query = { id: Number(id) };
        } else if (id.match(/^[0-9a-fA-F]{24}$/)) {
            query = { _id: id };
        } else {
            return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
        }

        const updatedUser = await UserModel.findOneAndUpdate(
            query,
            body,
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Update User Error:", error);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;

        const result = await UserModel.deleteOne({ id: id });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "User deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
