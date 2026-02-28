import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import { saveGame } from '../controllers/gameController.js'

const router = Router()

router.post('/game/save', protect, saveGame)

export default router
