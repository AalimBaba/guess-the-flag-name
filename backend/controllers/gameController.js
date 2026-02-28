import { z } from 'zod'
import { Game } from '../models/Game.js'
import { User } from '../models/User.js'

const saveSchema = z.object({
  score: z.number().int().min(0),
  accuracy: z.number().min(0).max(100),
  mode: z.enum(['typing', 'multiple']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  streakMax: z.number().int().min(0),
  answers: z
    .array(
      z.object({
        country: z.string(),
        correct: z.boolean(),
        timeMs: z.number().int().min(0),
      })
    )
    .min(1),
})

export const saveGame = async (req, res, next) => {
  try {
    const parsed = saveSchema.parse(req.body)
    const game = await Game.create({
      ...parsed,
      userId: req.user.id,
    })
    const user = await User.findById(req.user.id)
    if (user) {
      const totalGames = user.stats.totalGames + 1
      const bestScore = Math.max(user.stats.bestScore, parsed.score)
      const avgAccuracy =
        (user.stats.avgAccuracy * user.stats.totalGames + parsed.accuracy) / totalGames
      user.stats.totalGames = totalGames
      user.stats.bestScore = bestScore
      user.stats.avgAccuracy = Math.round(avgAccuracy * 100) / 100
      await user.save()
    }
    res.json({ ok: true, gameId: game._id })
  } catch (err) {
    next(err)
  }
}

export const leaderboard = async (req, res, next) => {
  try {
    const { scope = 'all' } = req.query
    const from =
      scope === 'daily'
        ? new Date(Date.now() - 24 * 60 * 60 * 1000)
        : scope === 'weekly'
        ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        : new Date(0)
    const top = await Game.aggregate([
      { $match: { createdAt: { $gte: from } } },
      {
        $group: {
          _id: '$userId',
          bestScore: { $max: '$score' },
        },
      },
      { $sort: { bestScore: -1 } },
      { $limit: 10 },
    ])
    const users = await User.find({ _id: { $in: top.map((t) => t._id) } })
    const result = top.map((t) => ({
      userId: t._id,
      username: users.find((u) => String(u._id) === String(t._id))?.username || 'Unknown',
      score: t.bestScore,
    }))
    res.json(result)
  } catch (err) {
    next(err)
  }
}
