import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth" // Adjust the path as needed

export async function GET() {
    // 1. Get the user session
    const session = await getServerSession(authOptions);

    // 2. If not authenticated, return 401
    if (!session || !session.user?.email) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        // 3. Find the user in the database
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // 4. Fetch notes for the authenticated user
        const notes = await prisma.note.findMany({
            where: { userId: user.id },
            include: { user: true },
        });

        return NextResponse.json({ notes }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch notes", details: error instanceof Error ? error.message : error },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    // 1. Get the user session
    const session = await getServerSession(authOptions);

    // 2. If not authenticated, return 401
    if (!session || !session.user?.email) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        // 3. Parse request body
        const { title, content } = await request.json();

        if (!content) {
            return NextResponse.json(
                { error: "content are required" },
                { status: 400 }
            );
        }


        // 4. Find the user in the database
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // 5. Create the note
        const note = await prisma.note.create({
            data: {
                title,
                content,
                userId: user.id,
            },
        });

        return NextResponse.json({ note }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create note", details: error instanceof Error ? error.message : error },
            { status: 500 }
        );
    }
}
