import mongoose from 'mongoose'

const gameSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    playId: { type: String, required: true },
    collectionId: { type: String, required: true },
    collectionLabel: { type: String, required: true },
    roundsPlayed: { type: Number, required: true },
    correctCount: { type: Number, required: true },
    score: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    mode: { type: String, enum: ['typing', 'multiple'], required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    streakMax: { type: Number, default: 0 },
    answers: [
      {
        prompt: String,
        guess: String,
        correct: Boolean,
        timeMs: Number,
        itemId: String,
      },
    ],
  },
  { timestamps: true }
)

gameSchema.index({ userId: 1, playId: 1 }, { unique: true })

export const Game = mongoose.model('Game', gameSchema)
