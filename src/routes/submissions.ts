import { Router } from 'express'
import { createSubmission, getMySubmissions, getChallengeSubmissions, getAllSubmissions } from '../controllers/submissionController'
import { verifyToken } from '../middleware/auth'

const router = Router()

// submit code and get AI feedback
router.post('/', verifyToken, createSubmission)

// get all submissions for the logged in student
router.get('/me', verifyToken, getMySubmissions)

// get submissions for a specific challenge
router.get('/challenge/:challengeId', verifyToken, getChallengeSubmissions)

// get all submissions
router.get('/students', verifyToken, getAllSubmissions)

export default router