import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { WebSocket } from 'ws'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@templatehub/database'

;(globalThis as any).WebSocket = WebSocket

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
)

const signAccessToken = (payload: { id: string; email: string; role: string }) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET as string,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    } as jwt.SignOptions
  )
}

const signRefreshToken = (payload: { id: string }) => {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET as string,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    } as jwt.SignOptions
  )
}

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const { data: supabaseUser, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error || !supabaseUser.user) {
      return res.status(400).json({ error: error?.message ?? 'Failed to create user' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        id: supabaseUser.user.id,
        email,
        name,
        passwordHash: hashedPassword,
        role: 'BUYER',
      },
    })

    const accessToken = signAccessToken({ id: user.id, email: user.email, role: user.role })
    const refreshTokenValue = signRefreshToken({ id: user.id })

    return res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken,
      refreshToken: refreshTokenValue,
    })
  } catch (err) {
    console.error('[register]', err)
    return res.status(500).json({ error: 'Registration failed' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const accessToken = signAccessToken({ id: user.id, email: user.email, role: user.role })
    const refreshTokenValue = signRefreshToken({ id: user.id })

    return res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken,
      refreshToken: refreshTokenValue,
    })
  } catch (err) {
    console.error('[login]', err)
    return res.status(500).json({ error: 'Login failed' })
  }
}

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body
    if (!token) return res.status(401).json({ error: 'Refresh token required' })

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { id: string }
    const user = await prisma.user.findUnique({ where: { id: decoded.id } })
    if (!user) return res.status(401).json({ error: 'User not found' })

    const accessToken = signAccessToken({ id: user.id, email: user.email, role: user.role })
    return res.json({ accessToken })
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token' })
  }
}

export const logout = async (_req: Request, res: Response) => {
  return res.json({ message: 'Logged out successfully' })
}

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, avatar: true, createdAt: true },
    })

    if (!user) return res.status(404).json({ error: 'User not found' })
    return res.json({ user })
  } catch {
    return res.status(500).json({ error: 'Failed to get user' })
  }
}
