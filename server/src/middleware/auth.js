import { verifyToken } from '../utils/token.js'
import { db } from '../data/db.js'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' })
  }

  try {
    const payload = verifyToken(token)
    const user = db.users.findById(payload.sub)
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' })
    }
    req.user = user
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
