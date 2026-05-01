import { Router } from 'express'
import { getAllStudents } from '../controllers/userController'
import { verifyToken, verifyRole } from '../middleware/auth'

const router = Router()

// Get all students - Restricted to teachers
router.get('/students', verifyToken, verifyRole('teacher'), getAllStudents)

export default router
