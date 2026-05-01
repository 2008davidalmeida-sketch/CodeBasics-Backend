import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import Submission from '../models/Submission'

async function deleteAllSubmissions() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string)

    const result = await Submission.deleteMany({})

    console.log(`Deleted ${result.deletedCount} submissions`)
    process.exit(0)
  } catch (error) {
    console.error('Delete error:', error)
    process.exit(1)
  }
}

deleteAllSubmissions()