import mongoose, { type Document, Schema } from "mongoose"

export interface IUser extends Document {
  name?: string
  email: string
  emailVerified?: Date
  image?: string
  accounts?: any[]
  sessions?: any[]
  // Custom fields for OTP
  otp?: string
  otpExpires?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    emailVerified: {
      type: Date,
    },
    image: {
      type: String,
    },
    // Custom fields for OTP authentication
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
