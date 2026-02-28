import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String },
    stats: {
      totalGames: { type: Number, default: 0 },
      bestScore: { type: Number, default: 0 },
      avgAccuracy: { type: Number, default: 0 },
    },
    achievements: [{ type: String }],
  },
  { timestamps: true }
)

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash)
}

export const User = mongoose.model('User', userSchema)
