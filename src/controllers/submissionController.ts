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
        const submissions = await Submission.find({ userId: req.userId })
            .populate('challengeId', 'title topic order')
            .sort({ createdAt: -1 })

        res.json(submissions)
    } catch {
        res.status(500).json({ error: 'Failed to fetch submissions' })
    }
}

// get submissions for a specific challenge by the logged in student
export async function getChallengeSubmissions(req: AuthRequest, res: Response): Promise<void> {
    try {
        const submissions = await Submission.find({
            userId: req.userId,
            challengeId: req.params.challengeId
        }).sort({ createdAt: -1 })

        res.json(submissions)
    } catch {
        res.status(500).json({ error: 'Failed to fetch submissions' })
    }
}

// get all submissions from all students (teacher only)
export async function getAllSubmissions(req: AuthRequest, res: Response): Promise<void> {
    try {
        const submissions = await Submission.find()
            .populate('userId', 'name email')
            .populate('challengeId', 'title topic')
            .sort({ createdAt: -1 })

        res.json(submissions)
    } catch {
        res.status(500).json({ error: 'Failed to fetch submissions' })
    }
}