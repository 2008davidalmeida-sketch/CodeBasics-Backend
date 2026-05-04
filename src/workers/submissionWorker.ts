import { Worker, Job } from 'bullmq';
import { GoogleGenerativeAI } from '@google/generative-ai';
import redis from '../config/redis';
import Submission from '../models/Submission';
import Challenge from '../models/Challenge';
import { REVIEW_SYSTEM_PROMPT } from '../config/prompts';
import { SUBMISSION_QUEUE_NAME } from '../queues/submissionQueue';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const submissionWorker = new Worker(
    SUBMISSION_QUEUE_NAME,
    async (job: Job) => {
        const { submissionId, challengeId, code } = job.data;

        console.log(`Processing submission ${submissionId}...`);

        try {
            // Update status to processing
            await Submission.findByIdAndUpdate(submissionId, { status: 'processing' });

            // Get challenge details
            const challenge = await Challenge.findById(challengeId);
            if (!challenge) {
                throw new Error('Challenge not found');
            }

            // Build the prompt
            const prompt = `
Challenge: ${challenge.title}
Description: ${challenge.description}

Student code:
\`\`\`python
${code}
\`\`\`
      `;

            // Call Gemini API
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.5-flash-lite',
                systemInstruction: REVIEW_SYSTEM_PROMPT,
            });

            const result = await model.generateContent(prompt);
            const raw = result.response.text();

            // Strip markdown backticks if Gemini wraps the response
            const cleaned = raw.replace(/```json|```/g, '').trim();

            // Parse structured response
            const parsed = JSON.parse(cleaned);
            const feedback = parsed.feedback;
            const passed = parsed.passed === true;

            // Update submission with feedback and mark as completed
            await Submission.findByIdAndUpdate(submissionId, {
                feedback,
                passed,
                status: 'completed',
            });

            console.log(`Submission ${submissionId} processed successfully.`);
        } catch (error) {
            console.error(`Error processing submission ${submissionId}:`, error);

            // Mark as failed
            await Submission.findByIdAndUpdate(submissionId, { status: 'failed' });

            throw error; // Re-throw to let BullMQ handle retries if configured
        }
    },
    {
        connection: redis,
        concurrency: 5, // Process up to 5 submissions in parallel
    }
);

submissionWorker.on('completed', (job) => {
    console.log(`Job ${job.id} has completed!`);
});

submissionWorker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} has failed with ${err.message}`);
});

console.log('Submission Worker initialized');
