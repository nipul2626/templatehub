import { Router } from 'express'
import { register, login, refreshToken, logout, getMe } from '../controllers/authController'
import { validateBody } from '../middleware/validate'
import { RegisterSchema, LoginSchema } from '../schemas/auth'

export const authRouter = Router()

authRouter.post('/api/auth/register', validateBody(RegisterSchema), register)
authRouter.post('/api/auth/login', validateBody(LoginSchema), login)
authRouter.post('/api/auth/refresh', refreshToken)
authRouter.post('/api/auth/logout', logout)
authRouter.get('/api/auth/me', getMe)


