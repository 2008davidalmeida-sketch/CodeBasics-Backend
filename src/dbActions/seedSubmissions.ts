import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import Challenge from '../models/Challenge'
import Submission from '../models/Submission'

async function seedSubmissions() {
  const userIdArg = process.argv[2]

  if (!userIdArg) {
    console.error('Por favor, forneça um User ID como argumento.')
    console.log('Exemplo: npx ts-node src/dbActions/seedSubmissions.ts 69ef586e7e788ff1d80cbaf9')
    process.exit(1)
  }

  try {
    await mongoose.connect(process.env.MONGO_URI as string)

    // Get all challenges
    const challenges = await Challenge.find({})
    
    if (challenges.length === 0) {
      console.log('No challenges found. Run seed.ts first.')
      process.exit(1)
    }

    // Clear existing submissions for this user
    const deleteResult = await Submission.deleteMany({ userId: new mongoose.Types.ObjectId(userIdArg) })
    console.log(`Deleted ${deleteResult.deletedCount} existing submissions for user ${userIdArg}`)

    // Create a submission for each challenge with passed: true
    const submissions = challenges.map(challenge => ({
      userId: new mongoose.Types.ObjectId(userIdArg),
      challengeId: challenge._id,
      code: '# Solution for ' + challenge.title + '\nprint("Completed")',
      feedback: 'Correct solution!',
      passed: true
    }))

    await Submission.insertMany(submissions)

    console.log(`Created ${submissions.length} submissions with passed: true for user ${userIdArg}`)
    process.exit(0)
  } catch (error) {
    console.error('Seed error:', error)
    process.exit(1)
  }
}

seedSubmissions()