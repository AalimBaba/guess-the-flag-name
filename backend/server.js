import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import { connectDB } from './config/db.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import gameRoutes from './routes/game.js'
import leaderboardRoutes from './routes/leaderboard.js'
import { errorHandler, notFound } from './middleware/error.js'

dotenv.config()

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
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
app.use(morgan('dev'))

connectDB()

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.use('/api', authRoutes)
app.use('/api', userRoutes)
app.use('/api', gameRoutes)
app.use('/api', leaderboardRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
