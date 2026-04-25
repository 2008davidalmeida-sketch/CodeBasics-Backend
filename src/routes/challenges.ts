import { Router } from 'express'
import { getChallenges, getChallenge, createChallenge, updateChallenge, deleteChallenge } from '../controllers/challengeController'
import { verifyToken } from '../middleware/auth'

const router = Router()

// get all challenges
router.get('/', getChallenges)
// get a single challenge
router.get('/:id', getChallenge)
// create a new challenge
router.post('/', verifyToken, createChallenge)
// update a challenge
router.put('/:id', verifyToken, updateChallenge)
// delete a challenge
router.delete('/:id', verifyToken, deleteChallenge)

export default router