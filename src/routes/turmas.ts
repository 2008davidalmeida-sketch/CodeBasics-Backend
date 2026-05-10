import { Router } from 'express'
import { createTurma, deleteTurma, addMember, removeMember, getAllTurmas, getTurma } from '../controllers/TurmaController'
import { verifyToken, verifyRole } from '../middleware/auth'

const router = Router()

// Create a new turma - Restricted to teachers
router.post('/', verifyToken, verifyRole('teacher'), createTurma)

// Delete a turma - Restricted to teachers
router.delete('/:turmaId', verifyToken, verifyRole('teacher'), deleteTurma)

// Add a member to the turma - Restricted to teachers
router.post('/add-member', verifyToken, verifyRole('teacher'), addMember)

// Remove a member from the turma - Restricted to teachers
router.post('/remove-member', verifyToken, verifyRole('teacher'), removeMember)

// Get all turmas - Restricted to teachers
router.get('/', verifyToken, verifyRole('teacher'), getAllTurmas)

// Get a single turma - Restricted to teachers
router.get('/:turmaId', verifyToken, verifyRole('teacher'), getTurma)

export default router