import { User } from '../models/User.js'
import { Game } from '../models/Game.js'

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      res.status(404)
      throw new Error('User not found')
    }
    const recentGames = await Game.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
    res.json({
      username: user.username,
      email: user.email,
      stats: user.stats,
      achievements: user.achievements,
      avatarUrl: user.avatarUrl,
      recentGames,
    })
  } catch (err) {
    next(err)
  }
}
