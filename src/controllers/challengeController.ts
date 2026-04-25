import { Request, Response } from 'express'
import Challenge from '../models/Challenge'
import { AuthRequest } from '../middleware/auth'

// get all challenges ordered by topic and order
export function getChallenges(req: Request, res: Response): void {
    Challenge.find().sort({ order: 1 })
        .then(challenges => res.json(challenges))
        .catch(() => res.status(500).json({ error: 'Failed to fetch challenges' }))
}

// get a single challenge by id
export function getChallenge(req: Request, res: Response): void {
    Challenge.findById(req.params.id)
        .then(challenge => {
        
        // check if challenge was found
        if (!challenge) {
            res.status(404).json({ error: 'Challenge not found' })
            return
        }
        res.json(challenge)
        })
        .catch(() => res.status(500).json({ error: 'Failed to fetch challenge' }))
}

// create a new challenge
export function createChallenge(req: AuthRequest, res: Response): void {
    const { title, description, topic, order, starterCode } = req.body

    Challenge.create({
        title,
        description,
        topic,
        order,
        starterCode,
        createdBy: req.userId
    })
        .then(challenge => res.status(201).json(challenge))
        .catch(() => res.status(500).json({ error: 'Failed to create challenge' }))
}

// update a challenge
export function updateChallenge(req: Request, res: Response): void {
    Challenge.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .then(challenge => {
        
        // check if challenge was found
        if (!challenge) {
            res.status(404).json({ error: 'Challenge not found' })
            return
        }
        res.json(challenge)
        })
        .catch(() => res.status(500).json({ error: 'Failed to update challenge' }))
    }

// delete a challenge
export function deleteChallenge(req: Request, res: Response): void {
    Challenge.findByIdAndDelete(req.params.id)
        .then(challenge => {

        // check if challenge was found
        if (!challenge) {
            res.status(404).json({ error: 'Challenge not found' })
            return
        }
        res.json({ message: 'Challenge deleted' })
        })
        .catch(() => res.status(500).json({ error: 'Failed to delete challenge' }))
}