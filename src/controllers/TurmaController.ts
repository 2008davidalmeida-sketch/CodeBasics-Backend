import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import mongoose from 'mongoose'
import Turma from '../models/Turma'
import User from '../models/User'

// Create a new turma
export async function createTurma(req: AuthRequest, res: Response) {
    try {
        // get name from req.body
        const { name } = req.body
        if (!name) {
            return res.status(400).json({ message: 'Turma name is required' })
        }

        // create turma
        const turma = new Turma({
            name,
            createdBy: req.userId,
            members: []
        })

        // save turma
        await turma.save()

        // add turma to user
        await User.findByIdAndUpdate(req.userId, { $push: { turmas: turma._id } })

        res.status(201).json(turma)
    } catch (error) {
        res.status(500).json({ message: 'Failed to create turma' })
    }
}

export async function deleteTurma(req: AuthRequest, res: Response) {
    try {
        // get turmaId from req.params
        const { turmaId } = req.params

        // find turma
        const turma = await Turma.findById(turmaId)

        // if turma not found, return error
        if (!turma) {
            return res.status(404).json({ message: 'Turma not found' })
        }

        // convert turmaId to ObjectId
        const turmaObjectId = new mongoose.Types.ObjectId(turmaId as string)

        // remove the turma from all users that belong to it
        await User.updateMany(
            { turmas: turmaObjectId },
            { $pull: { turmas: turmaObjectId } }
        )

        // delete turma
        await turma.deleteOne()

        res.status(200).json({ message: 'Turma deleted successfully' })
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete turma' })
    }
}

// Add a member to the turma
export async function addMember(req: AuthRequest, res: Response) {
    try {
        // get turmaId and userId from req.body
        const { turmaId, userId } = req.body

        // find turma
        const turma = await Turma.findById(turmaId)

        // if turma not found, return error
        if (!turma) {
            return res.status(404).json({ message: 'Turma not found' })
        }

        // find user
        const user = await User.findById(userId)

        // if user not found, return error
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        // add user to turma (using $addToSet to prevent duplicates)
        const updatedTurma = await Turma.findByIdAndUpdate(
            turmaId,
            { $addToSet: { members: userId } },
            { new: true }
        )
        
        // add turma to user's turmas array
        await User.findByIdAndUpdate(userId, { $addToSet: { turmas: turmaId } })

        res.status(200).json(updatedTurma)
    } catch (error) {
        res.status(500).json({ message: 'Failed to add member' })
    }
}

export async function removeMember(req: AuthRequest, res: Response) {
    try {
        // get turmaId and userId from req.body
        const { turmaId, userId } = req.body

        // find user
        const user = await User.findById(userId)

        // if user not found, return error
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        // remove user from turma
        const turma = await Turma.findByIdAndUpdate(
            turmaId,
            { $pull: { members: userId } },
            { new: true }
        )

        // if turma not found, return error
        if (!turma) {
            return res.status(404).json({ message: 'Turma not found' })
        }

        // remove turma from user's turmas array
        await User.findByIdAndUpdate(userId, { $pull: { turmas: turmaId } })

        res.status(200).json(turma)
    } catch (error) {
        res.status(500).json({ message: 'Failed to remove member' })
    }
}

// Get all turmas
export async function getAllTurmas(req: AuthRequest, res: Response) {
    try {
        // get all turmas
        const turmas = await Turma.find()

        // return turmas
        res.status(200).json(turmas)
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch turmas' })
    }
}

// Get a single turma
export async function getTurma(req: AuthRequest, res: Response) {
    try {
        // get turmaId from req.params
        const { turmaId } = req.params

        // find turma
        const turma = await Turma.findById(turmaId)
            .populate('members', 'name email photo')
            .populate('createdBy', 'name email photo')

        // if turma not found, return error
        if (!turma) {
            return res.status(404).json({ message: 'Turma not found' })
        }
        
        // Check authorization
        // Check authorization
        const isMember = turma.members.some((member: any) => {
            const memberId = member._id ? member._id.toString() : member.toString()
            return memberId === req.userId
        })
        const creatorId = turma.createdBy._id ? turma.createdBy._id.toString() : turma.createdBy.toString()
        const isCreator = creatorId === req.userId
        if (!isMember && !isCreator) {
            return res.status(403).json({ message: 'Unauthorized to view this turma' })
        }

        // return turma
        res.status(200).json(turma)
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch turma' })
    }
}
