import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
    name: string
    email: string
    photo?: string
    googleId: string
    role: 'student' | 'teacher'
    turmas: mongoose.Types.ObjectId[]
    createdAt: Date
    updatedAt: Date
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        photo: { type: String },
        googleId: { type: String, required: true, unique: true },
        role: { type: String, enum: ['student', 'teacher'], default: 'student' },
        turmas: { type: [Schema.Types.ObjectId], ref: 'Turma', default: [] },
    },
    { timestamps: true }
)

export default mongoose.model<IUser>('User', UserSchema)