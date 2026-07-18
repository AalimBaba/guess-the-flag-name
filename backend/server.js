import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'
import { connectDB } from './config/db.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import gameRoutes from './routes/game.js'
import leaderboardRoutes from './routes/leaderboard.js'
import { errorHandler, notFound } from './middleware/error.js'

dotenv.config()

const PRODUCTION_CLIENT_URL = 'https://aalimbaba.github.io'

function getClientUrl() {
  const clientUrl = process.env.CLIENT_URL?.trim() || 'http://localhost:5173'
  if (process.env.NODE_ENV === 'production' && clientUrl !== PRODUCTION_CLIENT_URL) {
    throw new Error(`CLIENT_URL must be exactly ${PRODUCTION_CLIENT_URL} in production`)
  }
  return clientUrl
}

function validateRuntimeConfig() {
  if (!process.env.MONGO_URI?.trim()) throw new Error('MONGO_URI is required')
  if (!process.env.JWT_SECRET?.trim()) throw new Error('JWT_SECRET is required')
  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters in production')
  }
}

const clientUrl = getClientUrl()
export const app = express()
app.set('trust proxy', 1)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origin === clientUrl) return callback(null, true)
      return callback(new Error('Origin is not allowed by CORS'))
    },
    credentials: true,
  })
)
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  })
)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

app.get('/api/health', (req, res) => {
  res.json({ ok: true, database: mongoose.connection.readyState === 1 ? 'connected' : 'unavailable' })
})

app.use('/api', authRoutes)
app.use('/api', userRoutes)
app.use('/api', gameRoutes)
app.use('/api', leaderboardRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 4000

export async function startServer() {
  validateRuntimeConfig()
  await connectDB()
  return app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

if (process.env.NODE_ENV !== 'test') {
  startServer().catch((error) => {
    console.error('Server startup failed', error)
    process.exit(1)
  })
}
