import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { jwtMiddleware } from './middleware/jwt'
import { rateLimitMiddleware } from './middleware/rateLimit'
import { errorHandler } from './middleware/errorHandler'

dotenv.config()

const app = express()
const PORT = process.env.PORT ?? 3000

app.use(helmet())
app.use(cors({ origin: process.env.NEXT_PUBLIC_APP_URL, credentials: true }))
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api-gateway', timestamp: new Date().toISOString() })
})

const AUTH_URL = process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001'
const MARKETPLACE_URL = process.env.MARKETPLACE_SERVICE_URL ?? 'http://localhost:3002'
const SELLER_URL = process.env.SELLER_SERVICE_URL ?? 'http://localhost:3003'
const PAYMENT_URL = process.env.PAYMENT_SERVICE_URL ?? 'http://localhost:3004'
const LICENSE_URL = process.env.LICENSE_SERVICE_URL ?? 'http://localhost:3005'
const AI_URL = process.env.AI_SERVICE_URL ?? 'http://localhost:3006'
const NOTIFICATION_URL = process.env.NOTIFICATION_SERVICE_URL ?? 'http://localhost:3007'

const proxy = (target: string, pathRewrite?: Record<string, string>) =>
  createProxyMiddleware({ target, changeOrigin: true, pathRewrite })

app.use('/api/auth', rateLimitMiddleware('auth', 20, 60), proxy(AUTH_URL))

app.use('/api/templates', rateLimitMiddleware('marketplace', 100, 60), proxy(MARKETPLACE_URL))
app.use('/api/categories', rateLimitMiddleware('marketplace', 100, 60), proxy(MARKETPLACE_URL))
app.use('/api/search', rateLimitMiddleware('search', 60, 60), proxy(MARKETPLACE_URL))
app.use('/api/reviews', rateLimitMiddleware('reviews', 30, 60), jwtMiddleware, proxy(MARKETPLACE_URL))
app.use('/api/wishlists', jwtMiddleware, proxy(MARKETPLACE_URL))
app.use('/api/collections', proxy(MARKETPLACE_URL))

app.use('/api/seller', jwtMiddleware, proxy(SELLER_URL))

app.use('/api/payments', proxy(PAYMENT_URL))
app.use('/api/webhooks', proxy(PAYMENT_URL))

app.use('/api/licenses', jwtMiddleware, proxy(LICENSE_URL))

app.use('/api/ai', rateLimitMiddleware('ai', 10, 60), jwtMiddleware, proxy(AI_URL))

app.use('/api/notifications', jwtMiddleware, proxy(NOTIFICATION_URL))

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`)
})

export default app
