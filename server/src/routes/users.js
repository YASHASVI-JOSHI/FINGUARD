import { Router } from 'express'
import { db } from '../data/db.js'
import { requireAuth } from '../middleware/auth.js'

export const usersRouter = Router()
usersRouter.use(requireAuth)

function toPublicUser(user) {
  const { passwordHash, ...publicUser } = user
  return publicUser
}

const ALLOWED_FIELDS = ['name', 'monthlyIncome', 'savingsTarget', 'financialGoal', 'avatarUrl']

usersRouter.put('/me', (req, res) => {
  const patch = {}
  for (const field of ALLOWED_FIELDS) {
    if (req.body?.[field] !== undefined) patch[field] = req.body[field]
  }
  const updated = db.users.updateOne(req.user._id, patch)
  res.json({ user: toPublicUser(updated) })
})
