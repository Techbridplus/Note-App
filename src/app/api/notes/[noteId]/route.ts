import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ noteId: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { noteId } = await params
        // Find user
        const user = await prisma.user.findUnique({ where: { email: session.user.email } })
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Find note and check ownership
        const note = await prisma.note.findUnique({ where: { id: noteId } })
        if (!note || note.userId !== user.id) {
            return NextResponse.json({ error: "Note not found or unauthorized" }, { status: 404 })
        }

        // Delete note
        await prisma.note.delete({ where: { id: noteId } })
        return NextResponse.json({ message: "Note deleted" }, { status: 200 })

    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete note", details: error instanceof Error ? error.message : error },
            { status: 500 }
        )
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ noteId: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { noteId } = await params
        const { title, content, isPinned } = await request.json()

        if (!title && !content && isPinned === undefined) {
            return NextResponse.json({ error: "Nothing to update" }, { status: 400 })
        }

        // Find user
        const user = await prisma.user.findUnique({ where: { email: session.user.email } })
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Find note and check ownership
        const note = await prisma.note.findUnique({ where: { id: noteId } })
        if (!note || note.userId !== user.id) {
            return NextResponse.json({ error: "Note not found or unauthorized" }, { status: 404 })
        }

        // Update note
        const updatedNote = await prisma.note.update({
            where: { id: noteId },
            data: {
                ...(title && { title }),
                ...(content && { content }),
                ...(isPinned !== undefined && { isPinned }),
            },
        })

        return NextResponse.json({ note: updatedNote }, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update note", details: error instanceof Error ? error.message : error },
            { status: 500 }
        )
    }
}
