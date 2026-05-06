import { Router } from 'express'
import { createSubmission, deleteSubmission, getMySubmissions, getChallengeSubmissions, getAllSubmissions, getSubmission } from '../controllers/submissionController'
import { verifyToken, verifyRole } from '../middleware/auth'
import { submissionLimiter } from '../middleware/rateLimiter'
import { validate } from '../middleware/validate'
import { createSubmissionSchema } from '../validations/submissionValidation'

const router = Router()

// submit code and get AI feedback
router.post('/', verifyToken, submissionLimiter, validate(createSubmissionSchema), createSubmission)

// delete submission
router.delete('/:id', verifyToken, verifyRole('teacher'), deleteSubmission)

// get all submissions for the logged in student
router.get('/me', verifyToken, getMySubmissions)

// get submissions for a specific challenge
router.get('/challenge/:challengeId', verifyToken, getChallengeSubmissions)

// get all submissions (teacher only)
router.get('/', verifyToken, verifyRole('teacher'), getAllSubmissions)

// get a single submission by ID (must be after /me and /challenge/:id)
router.get('/:id', verifyToken, getSubmission)

export default router