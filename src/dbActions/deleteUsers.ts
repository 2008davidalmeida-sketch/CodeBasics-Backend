import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import User from '../models/User'

async function deleteUsers() {
  const roleArg = process.argv[2]

  if (!roleArg) {
    console.error('Por favor, forneça um argumento: alunos ou geral')
    console.log('Exemplo: npm run delete-users alunos')
    process.exit(1)
  }

  try {
    await mongoose.connect(process.env.MONGO_URI as string)
    console.log('Conectado à base de dados...')

    let query = {}
    let description = ''

    if (roleArg === 'alunos') {
      query = { role: 'student' }
      description = 'utilizadores com o cargo "aluno" (student)'
    } else if (roleArg === 'geral') {
      query = {}
      description = 'todos os utilizadores'
    } else {
      console.error('Argumento inválido. Use "alunos" para estudantes ou "geral" para todos.')
      process.exit(1)
    }

    const result = await User.deleteMany(query)
    console.log(`Sucesso: Eliminados ${result.deletedCount} ${description}.`)
    
    process.exit(0)
  } catch (error) {
    console.error('Erro ao eliminar utilizadores:', error)
    process.exit(1)
  }
}

deleteUsers()
