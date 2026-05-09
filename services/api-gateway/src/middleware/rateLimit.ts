import { Request, Response, NextFunction } from 'express'

// Lazy-load Redis only if env vars exist
let Ratelimit: any
let Redis: any
let redis: any
let limiters: Record<string, any> = {}

const initRedis = async () => {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return false
  }
  if (!Redis) {
    const upstash = await import('@upstash/redis')
    const ratelimit = await import('@upstash/ratelimit')
    Redis = upstash.Redis
    Ratelimit = ratelimit.Ratelimit
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
  return true
}

export const rateLimitMiddleware = (name: string, requests: number, windowSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ready = await initRedis()
      if (!ready) return next() // Skip rate limiting in dev if no Redis

      const key = `${name}-${requests}-${windowSeconds}`
      if (!limiters[key]) {
        limiters[key] = new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(requests, `${windowSeconds} s`),
          prefix: `templatehub:ratelimit:${name}`,
        })
      }

      const identifier = req.ip ?? 'anonymous'
      const { success, remaining, reset } = await limiters[key].limit(identifier)

      res.setHeader('X-RateLimit-Remaining', remaining)
      res.setHeader('X-RateLimit-Reset', reset)

      if (!success) {
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        })
      }
      next()
    } catch {
      next() // Never block requests due to Redis failure
    }
  }
}
