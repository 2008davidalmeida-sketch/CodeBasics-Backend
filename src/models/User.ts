import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
    name: string
    email: string
    googleId: string
    role: 'student' | 'teacher'
    createdAt: Date
    updatedAt: Date
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        googleId: { type: String, required: true, unique: true },
        role: { type: String, enum: ['student', 'teacher'], default: 'student' },
    },
    { timestamps: true }
)

export default mongoose.model<IUser>('User', UserSchema)