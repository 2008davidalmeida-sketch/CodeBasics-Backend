import { Response } from 'express'
import User from '../models/User'
import { AuthRequest } from '../middleware/auth'

/**
 * Get all students (teacher only)
 * Returns a list of users with the 'student' role
 */
export async function getAllStudents(req: AuthRequest, res: Response): Promise<void> {
    try {
        const students = await User.find({ role: 'student' })
            .select('id name email photo role createdAt')
            .sort({ name: 1 })

        res.json(students)
    } catch (error) {
        console.error('Error fetching students:', error)
        res.status(500).json({ error: 'Failed to fetch students' })
    }
}
