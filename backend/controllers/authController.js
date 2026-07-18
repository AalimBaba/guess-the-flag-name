import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { User } from '../models/User.js'

const baseCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
})

const cookieOptions = () => ({
  ...baseCookieOptions(),
  maxAge: 7 * 24 * 60 * 60 * 1000,
})

const registerSchema = z
  .object({
    username: z.string().min(3).max(32),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const register = async (req, res, next) => {
  try {
    const parsed = registerSchema.parse(req.body)
    const exists = await User.findOne({ $or: [{ email: parsed.email }, { username: parsed.username }] })
    if (exists) {
      res.status(409)
      throw new Error('User already exists')
    }
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(parsed.password, salt)
    const user = await User.create({
      username: parsed.username,
      email: parsed.email,
      passwordHash,
    })
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res
      .cookie('token', token, cookieOptions())
      .json({ user: { id: user._id, username: user.username, email: user.email } })
  } catch (err) {
    next(err)
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const login = async (req, res, next) => {
  try {
    const parsed = loginSchema.parse(req.body)
    const user = await User.findOne({ email: parsed.email })
    if (!user) {
      res.status(401)
      throw new Error('Invalid credentials')
    }
    const ok = await user.comparePassword(parsed.password)
    if (!ok) {
      res.status(401)
      throw new Error('Invalid credentials')
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res
      .cookie('token', token, cookieOptions())
      .json({ user: { id: user._id, username: user.username, email: user.email } })
  } catch (err) {
    next(err)
  }
}

export const logout = async (req, res) => {
  res.clearCookie('token', baseCookieOptions()).json({ ok: true })
}

export const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      res.status(404)
      throw new Error('User not found')
    }
    res.json({ user: { id: user._id, username: user.username, email: user.email } })
  } catch (err) {
    next(err)
  }
}
