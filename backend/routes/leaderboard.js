import { Router } from 'express'
import { leaderboard } from '../controllers/gameController.js'

const router = Router()

router.get('/leaderboard', leaderboard)

export default router
