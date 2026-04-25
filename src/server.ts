import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import passport from './config/passport'
import connectDB from './config/db'
import authRoutes from './routes/auth'
import challengeRoutes from './routes/challenges'
import submissionRoutes from './routes/submissions'

const app = express()
const PORT = process.env.PORT || 5000

// connect to database
connectDB()

// middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}))
app.use(express.json())
app.use(passport.initialize())

// routes
app.use('/auth', authRoutes)
app.use('/challenges', challengeRoutes)
app.use('/submissions', submissionRoutes)

// health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app