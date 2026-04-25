import mongoose, { Document, Schema } from 'mongoose'

export interface IChallenge extends Document {
  title: string
  description: string
  topic: string
  order: number
  starterCode?: string
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const ChallengeSchema = new Schema<IChallenge>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    topic: { type: String, required: true },
    order: { type: Number, required: true },
    starterCode: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

export default mongoose.model<IChallenge>('Challenge', ChallengeSchema)