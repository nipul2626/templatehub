import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
  }
}

export const jwtMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET not configured')

    const decoded = jwt.verify(token, secret) as { id: string; email: string; role: string }
    req.user = decoded
    req.headers['x-user-id'] = decoded.id
    req.headers['x-user-email'] = decoded.email
    req.headers['x-user-role'] = decoded.role
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
