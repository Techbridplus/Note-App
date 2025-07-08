import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/User"

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 })
    }

    await connectDB()
    const user = await User.findOne({ email })

    if (!user || !user.otp || !user.otpExpires) {
      return NextResponse.json({ error: "No OTP found" }, { status: 400 })
    }

    if (user.otpExpires < new Date()) {
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 })
    }

    if (user.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 })
    }

    // Clear OTP and verify email
    user.otp = undefined
    user.otpExpires = undefined
    user.emailVerified = new Date()
    await user.save()

    return NextResponse.json({
      message: "Login successful",
      success: true,
    })
  } catch (error: any) {
    console.error("Verify OTP error:", error)
    return NextResponse.json({ error: error.message || "OTP verification failed" }, { status: 500 })
  }
}
