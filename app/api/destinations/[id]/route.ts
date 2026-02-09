import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import { DestinationModel } from '@/app/lib/models';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;

        let query: any = { id: Number(id) };

        // If id is not a valid number, try searching by _id
        if (isNaN(Number(id))) {
            query = { _id: id };
        }

        // Handle explicit "undefined" string case just to be safe/clean
        if (id === 'undefined' || id === 'null') {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        let destination = await DestinationModel.findOne(query);

        // Fallback: If searching by number failed, try _id as a backup just in case collision or string usage
        if (!destination && !isNaN(Number(id))) {
            // It's possible the URL passed an ObjectId but it looked like a number (unlikely) or we just want to be thorough
            // Actually, the main case is: URL has an ObjectId (string), so isNaN is true -> query is {_id: id}.
            // If URL has Number, query is {id: Number}.
        }

        // If simple check failed, try to be smart? No, simple is better. 
        // But wait, if I run findOne({id: NaN}) it might fail. The isNaN check handles that.
        // If isNaN is true, we set query to {_id: id}. But if 'undefined' is passed, _id search will be {_id: "undefined"}, which will also fail (cast error mostly for ObjectId).

        // Better logic:
        if (id === 'undefined' || id === 'null') {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        if (!isNaN(Number(id))) {
            destination = await DestinationModel.findOne({ id: Number(id) });
        } else {
            // Try valid ObjectId
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                destination = await DestinationModel.findById(id);
            }
        }

        if (!destination) {
            return NextResponse.json({ error: "Destination not found" }, { status: 404 });
        }

        return NextResponse.json(destination);
    } catch (error) {
        console.error("Fetch Destination Error:", error);
        return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await req.json();

        const updatedDestination = await DestinationModel.findOneAndUpdate(
            { id: Number(id) },
            body,
            { new: true }
        );

        if (!updatedDestination) {
            return NextResponse.json({ error: "Destination not found" }, { status: 404 });
        }

        return NextResponse.json(updatedDestination);
    } catch (error) {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;

        const result = await DestinationModel.deleteOne({ id: Number(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: "Destination not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Destination deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
