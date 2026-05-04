import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import passport from './config/passport'
import authRoutes from './routes/auth'
import challengeRoutes from './routes/challenges'
import submissionRoutes from './routes/submissions'
import userRoutes from './routes/users'

const app = express()

// middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}))
app.use(express.json({ limit: '100kb' }))
app.use(passport.initialize())

// routes
app.use('/auth', authRoutes)
app.use('/challenges', challengeRoutes)
app.use('/submissions', submissionRoutes)
app.use('/users', userRoutes)

// health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

export default app
