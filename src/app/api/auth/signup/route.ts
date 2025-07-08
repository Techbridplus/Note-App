import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/User"
import { sendOTP } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email || !name) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 })
    }

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser && existingUser.isVerified) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    if (existingUser) {
      // Update existing unverified user
      existingUser.name = name
      existingUser.otp = otp
      existingUser.otpExpires = otpExpires
      await existingUser.save()
    } else {
      // Create new user
      await User.create({
        email,
        name,
        otp,
        otpExpires,
        isVerified: false,
      })
    }

    // Send OTP email
    const emailSent = await sendOTP(email, otp)
    if (!emailSent) {
      return NextResponse.json({ error: "Failed to send OTP email" }, { status: 500 })
    }

    return NextResponse.json({
      message: "OTP sent successfully",
      email,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
