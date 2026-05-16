import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import Submission from '../models/Submission'

async function deleteSubmissions() {
  const userIdArg = process.argv[2]

  if (!userIdArg) {
    console.error('Por favor, forneça um User ID como argumento.')
    console.log('Exemplo: npx ts-node src/dbActions/deleteSubmissions.ts 69ef586e7e788ff1d80cbaf9')
    process.exit(1)
  }

  try {
    await mongoose.connect(process.env.MONGO_URI as string)

    const result = await Submission.deleteMany({ userId: new mongoose.Types.ObjectId(userIdArg) })

    console.log(`Deleted ${result.deletedCount} submissions for user ${userIdArg}`)
    process.exit(0)
  } catch (error) {
    console.error('Delete error:', error)
    process.exit(1)
  }
}

deleteSubmissions()