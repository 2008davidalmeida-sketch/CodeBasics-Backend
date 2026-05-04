import { Response } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import Submission from '../models/Submission'
import Challenge from '../models/Challenge'
import { AuthRequest } from '../middleware/auth'
import { REVIEW_SYSTEM_PROMPT } from '../config/prompts'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)

// submit code and get AI feedback
export async function createSubmission(req: AuthRequest, res: Response): Promise<void> {
    const { challengeId, code } = req.body

    // validate input
    if (!challengeId || typeof challengeId !== 'string') {
        res.status(400).json({ error: 'Valid challengeId is required' })
        return
    }

    if (!code || typeof code !== 'string' || code.trim() === '') {
        res.status(400).json({ error: 'Code is required' })
        return
    }

    if (code.length > 50000) {
        res.status(400).json({ error: 'Code submission exceeds maximum length of 50,000 characters' })
        return
    }

    // check if challenge exists
    const challenge = await Challenge.findById(challengeId)
    if (!challenge) {
        res.status(404).json({ error: 'Challenge not found' })
        return
    }

    try {
        // build the prompt
        const prompt = `
Challenge: ${challenge.title}
Description: ${challenge.description}

Student code:
\`\`\`python
${code}
\`\`\`
        `

        // call Gemini API
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash-lite',
            systemInstruction: REVIEW_SYSTEM_PROMPT
        })

        const result = await model.generateContent(prompt)
        const raw = result.response.text()

        // strip markdown backticks if Gemini wraps the response
        const cleaned = raw.replace(/```json|```/g, '').trim()

        // parse structured response
        const parsed = JSON.parse(cleaned)
        const feedback = parsed.feedback
        const passed = parsed.passed === true

        // save submission to database
        const submission = await Submission.create({
            userId: req.userId,
            challengeId,
            code,
            feedback,
            passed
        })

        res.status(201).json(submission)
    } catch (error) {
        console.error('Gemini error:', error)
        res.status(500).json({ error: 'Failed to get AI feedback' })
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
    } catch {
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