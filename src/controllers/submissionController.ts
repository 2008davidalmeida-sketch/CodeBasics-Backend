import { Response } from 'express'
import Submission from '../models/Submission'
import Challenge from '../models/Challenge'
import { AuthRequest } from '../middleware/auth'
import { submissionQueue } from '../queues/submissionQueue'


// submit code and get AI feedback
export async function createSubmission(req: AuthRequest, res: Response): Promise<void> {
    const { challengeId, code } = req.body

    // check if challenge exists
    const challenge = await Challenge.findById(challengeId)
    if (!challenge) {
        res.status(404).json({ error: 'Challenge not found' })
        return
    }

    try {
        // save submission to database as pending
        const submission = await Submission.create({
            userId: req.userId,
            challengeId,
            code,
            status: 'pending'
        })

        // add job to the queue
        await submissionQueue.add('evaluate-submission', {
            submissionId: submission._id,
            challengeId,
            code
        })

        res.status(201).json(submission)
    } catch (error) {
        console.error('Submission error:', error)
        res.status(500).json({ error: 'Failed to process submission' })
    }
}

// delete submission
export async function deleteSubmission(req: AuthRequest, res: Response): Promise<void> {
    try {
        const submission = await Submission.findById(req.params.id)
        if (!submission) {
            res.status(404).json({ error: 'Submission not found' })
            return
        }

        // Only the user who created it or a teacher can delete it
        if (submission.userId.toString() !== req.userId && req.userRole !== 'teacher') {
            res.status(403).json({ error: 'Not authorized to delete this submission' })
            return
        }

        await submission.deleteOne()
        console.log('Submission with ID ' + req.params.id + ' deleted successfully')
        res.json({ message: 'Submission deleted successfully' })
    } catch (error) {
        console.error('Error in deleteSubmission:', error)
        res.status(500).json({ error: 'Failed to delete submission' })
    }
}

// get all submissions for the logged in student
export async function getMySubmissions(req: AuthRequest, res: Response): Promise<void> {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 20
        const skip = (page - 1) * limit

        const submissions = await Submission.find({ userId: req.userId })
            .populate('challengeId', 'title topic order')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        const total = await Submission.countDocuments({ userId: req.userId })

        res.json({
            data: submissions,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Error in getMySubmissions:', error)
        res.status(500).json({ error: 'Failed to fetch submissions' })
    }
}

// get submissions for a specific challenge by the logged in student
export async function getChallengeSubmissions(req: AuthRequest, res: Response): Promise<void> {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 20
        const skip = (page - 1) * limit

        const query = {
            userId: req.userId,
            challengeId: req.params.challengeId as any
        }

        const submissions = await Submission.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        const total = await Submission.countDocuments(query)

        res.json({
            data: submissions,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        })
    } catch {
        res.status(500).json({ error: 'Failed to fetch submissions' })
    }
}

// get all submissions from all students (teacher only)
export async function getAllSubmissions(req: AuthRequest, res: Response): Promise<void> {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 20
        const skip = (page - 1) * limit

        const submissions = await Submission.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        const total = await Submission.countDocuments()

        res.json({
            data: submissions,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        })
    } catch {
        res.status(500).json({ error: 'Failed to fetch submissions' })
    }
}

// get a single submission by ID
export async function getSubmission(req: AuthRequest, res: Response): Promise<void> {
    try {
        // 
        const submission = await Submission.findById(req.params.id)
            .populate('challengeId', 'title topic order')

        if (!submission) {
            res.status(404).json({ error: 'Submission not found' })
            return
        }

        // Only the user who created it or a teacher can view it
        if (submission.userId.toString() !== req.userId && req.userRole !== 'teacher') {
            res.status(403).json({ error: 'Not authorized to view this submission' })
            return
        }

        res.json(submission)
    } catch {
        res.status(500).json({ error: 'Failed to fetch submission' })
    }
}
