import mongoose, { Document, Schema } from 'mongoose'

export interface ITurma extends Document {
    name: string
    members: mongoose.Types.ObjectId[]
    createdBy: mongoose.Types.ObjectId
    createdAt: Date
    updatedAt: Date
}

const TurmaSchema = new Schema<ITurma>(
    {
        name: { type: String, required: true },
        members: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
)

export default mongoose.model<ITurma>('Turma', TurmaSchema)
