import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/User"
import { sendOTP } from "@/lib/email-config"

export async function POST(request: Request) {
  try {
    const { email, name, isSignup } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    if (isSignup && !name) {
      return NextResponse.json({ error: "Name is required for signup" }, { status: 400 })
    }

    await connectDB()

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    let user = await User.findOne({ email })

    if (!user && isSignup) {
      user = await User.create({
        email,
        name,
        otp,
        otpExpires,
        emailVerified: null,
      })
    } else if (user) {
      user.otp = otp
      user.otpExpires = otpExpires
      if (name && !user.name) {
        user.name = name
      }
      await user.save()
    } else {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Send OTP email
    const emailSent = await sendOTP(email, otp)
    if (!emailSent) {
      throw new Error("Failed to send OTP")
    }

    return NextResponse.json({
      message: "OTP sent successfully",
      email,
    },{status: 200})
  } catch (error: any) {
    console.error("Send OTP error:", error)
    return NextResponse.json({ error: error.message || "Failed to send OTP" }, { status: 500 })
  }
}
