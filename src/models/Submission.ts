import mongoose, { Document, Schema } from 'mongoose'

export interface ISubmission extends Document {
    userId: mongoose.Types.ObjectId
    challengeId: mongoose.Types.ObjectId
    code: string
    feedback?: string
    passed?: boolean
    status: 'pending' | 'processing' | 'completed' | 'failed'
    createdAt: Date
    updatedAt: Date
}

const SubmissionSchema = new Schema<ISubmission>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        challengeId: { type: Schema.Types.ObjectId, ref: 'Challenge', required: true },
        code: { type: String, required: true },
        feedback: { type: String },
        passed: { type: Boolean },
        status: { 
            type: String, 
            enum: ['pending', 'processing', 'completed', 'failed'], 
            default: 'pending' 
        },
    },
    { timestamps: true }
)

//Indexes for scalability
SubmissionSchema.index({ userId: 1, challengeId: 1 })
SubmissionSchema.index({ userId: 1, createdAt: -1 })
SubmissionSchema.index({ challengeId: 1, createdAt: -1 })
SubmissionSchema.index({ createdAt: -1 })

export default mongoose.model<ISubmission>('Submission', SubmissionSchema)