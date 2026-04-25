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
 
export function getMe(req: Request, res: Response): void {
    const authHeader = req.headers.authorization
    console.log('--- Get Me ---')
    console.log('Auth Header:', authHeader)

    // check if token exists
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Get Me - No token provided')
        res.status(401).json({ error: 'No token provided' })
        return
    }

    // verify token
    const token = authHeader.split(' ')[1]

    try {
        // get user from token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string, role: string }
        console.log('Get Me - Token verified for user:', decoded.id)
        // return user
        res.json(decoded)
    } catch (error) {
        // if token is invalid, return error
        console.error('Get Me - Token verification failed:', error)
        res.status(401).json({ error: 'Invalid token' })
    }
}

export function logout(req: Request, res: Response): void {
    res.clearCookie('token')
    res.json({ message: 'Logged out' })
}