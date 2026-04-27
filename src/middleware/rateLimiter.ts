import { rateLimit } from 'express-rate-limit'

// limiter for the submissions endpoint
export const submissionLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    keyGenerator: (req: any) => req.userId, // use userId instead of IP
    message: { error: 'Demasiadas submissões. Tenta novamente mais tarde.' },
    standardHeaders: 'draft-8',
    legacyHeaders: false,
})