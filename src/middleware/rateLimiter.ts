import { rateLimit } from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import redis from '../config/redis'

// limiter for the submissions endpoint
export const submissionLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 100,
    keyGenerator: (req: any) => req.userId, // use userId instead of IP
    message: { error: 'Demasiadas submissões. Tenta novamente mais tarde.' },
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    store: new RedisStore({
        // @ts-expect-error - Known issue: ioredis and rate-limit-redis type mismatch
        sendCommand: (...args: string[]) => redis.call(...args),
    }),
})