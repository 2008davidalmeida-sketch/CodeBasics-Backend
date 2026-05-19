import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
    userId?: string
    userRole?: string
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction): void {
    // 1. Try to read token from HTTP-only cookie first
    let token = req.cookies?.token

    // 2. Fallback to Authorization Header if cookies aren't used (e.g. API clients)
    if (!token) {
        const authHeader = req.headers.authorization
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1]
        }
    }

    // Check if token exists
    if (!token) {
        res.status(401).json({ error: 'No token provided' })
        return
    }

    try {
        // verify and decode token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string, role: string }

        // attach user info to request
        req.userId = decoded.id
        req.userRole = decoded.role

        next()
    } catch {
        res.status(401).json({ error: 'Invalid token' })
    }
}


export function verifyRole(role: string) {
    return function (req: AuthRequest, res: Response, next: NextFunction): void {
        if (req.userRole !== role) {
            res.status(403).json({ error: 'Access denied' })
            return
        }
        next()
    }
}