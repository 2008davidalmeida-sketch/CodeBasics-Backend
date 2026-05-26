import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import passport from './config/passport'
import authRoutes from './routes/auth'
import challengeRoutes from './routes/challenges'
import submissionRoutes from './routes/submissions'
import userRoutes from './routes/users'
import turmaRoutes from './routes/turmas'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'

const app = express()

// Configure trust proxy for Render
app.set('trust proxy', 1)

// Enforce HTTPS in production
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect(`https://${req.header('host')}${req.url}`)
        } else {
            next()
        }
    })
}

// middleware
app.use(helmet())
app.use(helmet.strictTransportSecurity({ maxAge: 31536000, includeSubDomains: true }))
app.use(helmet.frameguard({ action: 'deny' }))
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
    }
}))
app.use(cookieParser())

const allowedOrigins = [
    process.env.CLIENT_URL
]

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('CORS not allowed'))
        }
    },
    credentials: true
}))
app.use(express.json({ limit: '100kb' }))
app.use(passport.initialize())

// routes
app.use('/auth', authRoutes)
app.use('/challenges', challengeRoutes)
app.use('/submissions', submissionRoutes)
app.use('/users', userRoutes)
app.use('/turmas', turmaRoutes)

// health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Error handling middleware
app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
    // determines status code
    const status = typeof err === 'object' && err !== null && 'status' in err 
        ? (err as { status: number }).status 
        : 500

    // determines error message
    const message = status >= 500 ? 'Internal Server Error' : (err instanceof Error ? err.message : 'An error occurred');
  
    // Log only non-sensitive error details in production
    console.error('GLOBAL ERROR:', { 
        message: err instanceof Error ? err.message : String(err),
        path: req.path,
        method: req.method
    });

    res.status(status).json({ error: message });
});

export default app