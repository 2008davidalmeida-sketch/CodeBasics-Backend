import { rateLimit } from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import redis from '../config/redis'

// limiter for public endpoints (100 requests per 15 minutes per IP)
export const publicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    limit: 100, 
    keyGenerator: (req: any) => req.ip,
    message: { error: 'Muitos pedidos. Tenta novamente mais tarde.' },
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    passOnStoreError: true,
    store: new RedisStore({
        sendCommand: (command: string, ...args: string[]) =>
            redis.call(command, ...args) as any,
    }),
})

// limiter for the submissions endpoint (100 requests per hour per user)
export const submissionLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 100,
    keyGenerator: (req: any) => req.userId || req.ip, // fallback to IP if unauthenticated
    message: { error: 'Demasiadas submissões. Tenta novamente mais tarde.' },
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    passOnStoreError: true,
    store: new RedisStore({
        sendCommand: (command: string, ...args: string[]) =>
            redis.call(command, ...args) as any,
    }),
})
