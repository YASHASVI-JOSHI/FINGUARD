import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { authRouter } from './routes/auth.js'
import { financeRouter } from './routes/finance.js'
import { aiRouter } from './routes/ai.js'
import { usersRouter } from './routes/users.js'
import { adminRouter } from './routes/admin.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.use('/api/auth', authRouter)
app.use('/api', financeRouter)
app.use('/api/ai', aiRouter)
app.use('/api/users', usersRouter)
app.use('/api/admin', adminRouter)

app.use((req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.path}` })
})

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`FinGuard API listening on http://localhost:${PORT}`)
})
