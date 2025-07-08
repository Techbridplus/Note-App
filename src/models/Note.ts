import mongoose, { type Document, Schema } from "mongoose"

export interface INote extends Document {
  title: string
  content: string
  userId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const NoteSchema = new Schema<INote>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Note || mongoose.model<INote>("Note", NoteSchema)
