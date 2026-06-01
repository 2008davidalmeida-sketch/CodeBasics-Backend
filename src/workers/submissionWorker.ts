import { Worker, Job } from 'bullmq';
import { GoogleGenerativeAI } from '@google/generative-ai';
import redis from '../config/redis';
import Submission from '../models/Submission';
import Challenge from '../models/Challenge';
import { REVIEW_SYSTEM_PROMPT } from '../config/prompts';
import { SUBMISSION_QUEUE_NAME } from '../queues/submissionQueue';

// Validate API key exists
if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

            try {
                // Call Gemini API with timeout
                const model = genAI.getGenerativeModel({
                    model: 'gemini-2.5-flash-lite',
                    systemInstruction: REVIEW_SYSTEM_PROMPT,
                });

                console.log(`[Submission ${submissionId}] Calling Gemini API...`);
                
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
            } catch (apiError: any) {
                const errorMessage = apiError?.message || String(apiError);
                const errorStatus = apiError?.status || apiError?.code;
                
                console.error(`[Submission ${submissionId}] Gemini API Error:`, {
                    status: errorStatus,
                    message: errorMessage,
                    environment: process.env.NODE_ENV,
                    hasApiKey: !!process.env.GEMINI_API_KEY,
                });
                
                // Check if it's an auth error
                if (apiError?.status === 403 || apiError?.code === 'PERMISSION_DENIED') {
                    throw new Error(
                        `Gemini API Permission Denied (403). ` +
                        `Check if: 1) API key is correct, 2) API key has no IP/domain restrictions, 3) API is enabled in Google Cloud Console. ` +
                        `Error: ${errorMessage}`
                    );
                }
                throw apiError;
            }
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

// Event listeners for debugging
submissionWorker.on('completed', (job) => {
    console.log(`Job ${job.id} has completed!`);
});

submissionWorker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} has failed with ${err.message}`);
});

console.log('Submission Worker initialized');
