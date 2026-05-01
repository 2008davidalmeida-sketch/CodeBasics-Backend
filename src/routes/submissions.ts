import { Router } from 'express'
import { createSubmission, getMySubmissions, getChallengeSubmissions, getAllSubmissions } from '../controllers/submissionController'
import { verifyToken, verifyRole } from '../middleware/auth'
import { submissionLimiter } from '../middleware/rateLimiter'

const router = Router()

// submit code and get AI feedback
router.post('/', verifyToken, submissionLimiter, createSubmission)

// get all submissions for the logged in student
router.get('/me', verifyToken, getMySubmissions)

// get submissions for a specific challenge
router.get('/challenge/:challengeId', verifyToken, getChallengeSubmissions)

// get all submissions (teacher only)
router.get('/', verifyToken, verifyRole('teacher'), getAllSubmissions)

export default router