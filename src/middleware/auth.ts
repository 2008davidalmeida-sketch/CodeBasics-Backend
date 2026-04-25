import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: string
  userRole?: string
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction): void {
  // get token from header
  const authHeader = req.headers.authorization

  // check if token exists
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' })
    return
  }

  // extract token
  const token = authHeader.split(' ')[1]

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