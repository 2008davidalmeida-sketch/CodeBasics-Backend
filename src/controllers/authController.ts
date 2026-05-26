import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { IUser } from '../models/User'
import User from '../models/User'
import { AuthRequest } from '../middleware/auth'


export function handleGoogleCallback(req: Request, res: Response): void {
    const user = req.user as IUser
    
    // Generate JWT token
    const token = jwt.sign(
        { id: user._id.toString(), role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
    )

    // For same-domain: also set as httpOnly cookie as fallback
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    // Pass token in redirect URL for cross-domain frontend
    // Frontend will extract and store in localStorage/sessionStorage
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`)
}



export function getMe(req: Request, res: Response): void {
    const authReq = req as AuthRequest
    
    // Since verifyToken middleware ran, authReq.userId is guaranteed to exist and be valid
    User.findById(authReq.userId).then(user => {
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }
        res.json(user)
    }).catch(err => {
        res.status(500).json({ error: 'Database error' })
    })
}


export function logout(req: Request, res: Response): void {
    res.clearCookie('token')
    res.json({ message: 'Logged out' })
}