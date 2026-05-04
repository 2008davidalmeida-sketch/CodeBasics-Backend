import mongoose, { Document, Schema } from 'mongoose'

export interface ISubmission extends Document {
  userId: mongoose.Types.ObjectId
  challengeId: mongoose.Types.ObjectId
  code: string
  feedback: string
  passed: boolean
  createdAt: Date
  updatedAt: Date
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    challengeId: { type: Schema.Types.ObjectId, ref: 'Challenge', required: true },
    code: { type: String, required: true },
    feedback: { type: String, required: true },
    passed: { type: Boolean, default: false },
  },
  { timestamps: true }
)

SubmissionSchema.index({ userId: 1, challengeId: 1 })

// Sorting indexes for scalability
SubmissionSchema.index({ userId: 1, createdAt: -1 })
SubmissionSchema.index({ challengeId: 1, createdAt: -1 })
SubmissionSchema.index({ createdAt: -1 })

export default mongoose.model<ISubmission>('Submission', SubmissionSchema)