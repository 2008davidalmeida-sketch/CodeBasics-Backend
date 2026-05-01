import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import Challenge from '../models/Challenge'
import Submission from '../models/Submission'

async function seedSubmissions() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string)

    // Get all challenges
    const challenges = await Challenge.find({})
    
    if (challenges.length === 0) {
      console.log('No challenges found. Run seed.ts first.')
      process.exit(1)
    }

    // Clear existing submissions
    await Submission.deleteMany({})

    // Create a test user ID (use existing or create new)
    const testUserId = new mongoose.Types.ObjectId()

    // Create a submission for each challenge with passed: true
    const submissions = challenges.map(challenge => ({
      userId: new mongoose.Types.ObjectId('69ef586e7e788ff1d80cbaf9'),
      challengeId: challenge._id,
      code: '# Solution for ' + challenge.title + '\nprint("Completed")',
      feedback: 'Correct solution!',
      passed: true
    }))

    await Submission.insertMany(submissions)

    console.log(`Created ${submissions.length} submissions with passed: true`)
    process.exit(0)
  } catch (error) {
    console.error('Seed error:', error)
    process.exit(1)
  }
}

seedSubmissions()