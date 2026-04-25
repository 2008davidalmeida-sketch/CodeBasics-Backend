import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { IUser } from '../models/User'


export function handleGoogleCallback(req: Request, res: Response): void {
    const user = req.user as IUser

    // Generate JWT token
    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
    )

    // Redirect to client with token
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`)
}
 
export function getMe(req: Request, res: Response): void {
    const authHeader = req.headers.authorization

    // check if token exists
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No token provided' })
        return
    }

    // verify token
    const token = authHeader.split(' ')[1]

    try {
        // get user from token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string, role: string }
        // return user
        res.json(decoded)
    } catch {
        // if token is invalid, return error
        res.status(401).json({ error: 'Invalid token' })
    }
}

export function logout(req: Request, res: Response): void {
    res.clearCookie('token')
    res.json({ message: 'Logged out' })
}