import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { db } from '../data/db.js'
import { seedUserData } from '../data/seed.js'
import { signToken } from '../utils/token.js'
import { requireAuth } from '../middleware/auth.js'

export const authRouter = Router()

function toPublicUser(user) {
  const { passwordHash, ...publicUser } = user
  return publicUser
}

authRouter.post('/register', async (req, res) => {
  const { name, email, password } = req.body || {}

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  const existing = db.users.findOne((u) => u.email.toLowerCase() === email.toLowerCase())
  if (existing) {
    return res.status(409).json({ error: 'An account with that email already exists' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = db.users.insertOne({
    name,
    email,
    passwordHash,
    monthlyIncome: null,
    savingsTarget: null,
  })

  // give every new account realistic demo data so all pages have something to show
  seedUserData(user._id)

  const token = signToken({ sub: user._id })
  res.status(201).json({ token, user: toPublicUser(user) })
})

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' })
  }

  const user = db.users.findOne((u) => u.email.toLowerCase() === email.toLowerCase())
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const token = signToken({ sub: user._id })
  res.json({ token, user: toPublicUser(user) })
})

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: toPublicUser(req.user) })
})

authRouter.put('/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {}
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'currentPassword and newPassword are required' })
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' })
  }

  const valid = await bcrypt.compare(currentPassword, req.user.passwordHash)
  if (!valid) {
    return res.status(401).json({ error: 'Current password is incorrect' })
  }

  const passwordHash = await bcrypt.hash(newPassword, 10)
  db.users.updateOne(req.user._id, { passwordHash })
  res.json({ success: true })
})
