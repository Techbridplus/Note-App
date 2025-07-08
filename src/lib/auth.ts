import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { MongoClient } from "mongodb"
import connectDB from "@/lib/db"
import User from "@/models/User"
import { sendOTP } from "@/lib/email"

const client = new MongoClient(process.env.MONGODB_URI!)

export default NextAuth({
  adapter: MongoDBAdapter(client),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: "email-otp",
      name: "Email OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
        action: { label: "Action", type: "text" }, // 'send-otp' or 'verify-otp'
        name: { label: "Name", type: "text" }, // For signup
      },
      async authorize(credentials) {
        if (!credentials?.email) return null

        await connectDB()

        if (credentials.action === "send-otp") {
          // Generate and send OTP
          const otp = Math.floor(100000 + Math.random() * 900000).toString()
          const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

          let user = await User.findOne({ email: credentials.email })

          if (!user && credentials.name) {
            // Create new user for signup
            user = await User.create({
              email: credentials.email,
              name: credentials.name,
              otp,
              otpExpires,
              emailVerified: null,
            })
          } else if (user) {
            // Update existing user with new OTP
            user.otp = otp
            user.otpExpires = otpExpires
            if (credentials.name && !user.name) {
              user.name = credentials.name
            }
            await user.save()
          } else {
            return null // User doesn't exist and no name provided
          }

          // Send OTP email
          const emailSent = await sendOTP(credentials.email, otp)
          if (!emailSent) {
            throw new Error("Failed to send OTP")
          }

          // Return a temporary user object to indicate OTP was sent
          return {
            id: "otp-sent",
            email: credentials.email,
            name: user.name || credentials.name || "",
          }
        } else if (credentials.action === "verify-otp") {
          // Verify OTP
          const user = await User.findOne({ email: credentials.email })

          if (!user || !user.otp || !user.otpExpires) {
            throw new Error("No OTP found")
          }

          if (user.otpExpires < new Date()) {
            throw new Error("OTP has expired")
          }

          if (user.otp !== credentials.otp) {
            throw new Error("Invalid OTP")
          }

          // Clear OTP and verify email
          user.otp = undefined
          user.otpExpires = undefined
          user.emailVerified = new Date()
          await user.save()

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified,
          }
        }

        return null
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        await connectDB()

        // Check if user exists and update with Google info
        const existingUser = await User.findOne({ email: user.email })

        if (existingUser && !existingUser.emailVerified) {
          existingUser.emailVerified = new Date()
          existingUser.image = user.image
          await existingUser.save()
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user && user.id !== "otp-sent") {
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token.userId && session.user) {
        session.user.id = token.userId as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
})
