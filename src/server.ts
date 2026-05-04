import connectDB from './config/db'
import app from './app'

const PORT = process.env.PORT || 5000

// connect to database
connectDB()

// start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})