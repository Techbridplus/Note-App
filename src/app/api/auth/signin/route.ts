import { NextRequest, NextResponse } from "next/server"
import { sendVerificationEmail } from "@/lib/email-verification"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    // Convert email to lowercase before querying
    const normalizedEmail = email.toLowerCase()

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "Account doesn't exists with this email" },
        { status: 400 }
      )
    }

    const result = await sendVerificationEmail(email)
    if (!result.success) {
      return NextResponse.json(result, { status: 500 })
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("[VERIFY_EMAIL]", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 