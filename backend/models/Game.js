import mongoose from 'mongoose'

const gameSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    mode: { type: String, enum: ['typing', 'multiple'], required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    streakMax: { type: Number, default: 0 },
    answers: [
      {
        country: String,
        correct: Boolean,
        timeMs: Number,
      },
    ],
  },
  { timestamps: true }
)

export const Game = mongoose.model('Game', gameSchema)
