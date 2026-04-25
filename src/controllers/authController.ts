import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { IUser } from '../models/User'


export function handleGoogleCallback(req: Request, res: Response): void {
    const user = req.user as IUser

    console.log('--- Handle Google Callback ---')
    console.log('User found:', user._id)

    // Generate JWT token
    const token = jwt.sign(
        { id: user._id.toString(), role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
    )

    const redirectUrl = `${process.env.CLIENT_URL}/auth/callback?token=${token}`
    console.log('Redirecting to:', redirectUrl)

    // Redirect to client with token
    res.redirect(redirectUrl)
}
 
import User from '../models/User'

export function getMe(req: Request, res: Response): void {
    const authHeader = req.headers.authorization
    console.log('--- Get Me ---')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No token provided' })
        return
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string, role: string }
        
        // Fetch full user from database
        User.findById(decoded.id).then(user => {
            if (!user) {
                return res.status(404).json({ error: 'User not found' })
            }
            res.json(user)
        }).catch(err => {
            res.status(500).json({ error: 'Database error' })
        })
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' })
    }
}

export function logout(req: Request, res: Response): void {
    res.clearCookie('token')
    res.json({ message: 'Logged out' })
}