import connectDB from './config/db'
import app from './app'
import './workers/submissionWorker'

const PORT = process.env.PORT || 5000

// connect to database
connectDB()

// start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})