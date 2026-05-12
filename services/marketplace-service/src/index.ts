import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { errorHandler } from './middleware/errorHandler'

dotenv.config()

const app = express()
const PORT = process.env.PORT ?? 3002

app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'marketplace-service', timestamp: new Date().toISOString() })
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Marketplace service running on port ${PORT}`)
})

export default app