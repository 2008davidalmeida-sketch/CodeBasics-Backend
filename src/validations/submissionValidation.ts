import { z } from 'zod';

export const createSubmissionSchema = z.object({
    body: z.object({
        challengeId: z.string().min(24, 'Invalid Challenge ID format'),
        code: z.string()
            .min(1, 'Code is required')
            .max(50000, 'Code exceeds maximum length of 50,000 characters'),
    }),
});
