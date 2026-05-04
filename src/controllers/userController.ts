import { Response } from 'express'
import User from '../models/User'
import { AuthRequest } from '../middleware/auth'

/**
 * Get all students (teacher only)
 * Returns a list of users with the 'student' role
 */
export async function getAllStudents(req: AuthRequest, res: Response): Promise<void> {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 20
        const skip = (page - 1) * limit

        // Fetch all students, selecting only necessary fields
        const students = await User.find({ role: 'student' })
            .select('id name email photo role createdAt')
            .sort({ name: 1 })
            .skip(skip)
            .limit(limit)

        const total = await User.countDocuments({ role: 'student' })

        res.json({
            data: students,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching students:', error)
        res.status(500).json({ error: 'Failed to fetch students' })
    }
}
