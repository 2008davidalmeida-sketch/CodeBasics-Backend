import { Router } from 'express'
import { getChallenges, getChallenge, createChallenge, updateChallenge, deleteChallenge } from '../controllers/challengeController'
import { verifyToken, verifyRole } from '../middleware/auth'

const router = Router()

// get all challenges
router.get('/', getChallenges)
// get a single challenge
router.get('/:id', getChallenge)

// create a new challenge
router.post('/', verifyToken, verifyRole('teacher'), createChallenge)
// update a challenge
router.put('/:id', verifyToken, verifyRole('teacher'), updateChallenge)
// delete a challenge
router.delete('/:id', verifyToken, verifyRole('teacher'), deleteChallenge)

export default router