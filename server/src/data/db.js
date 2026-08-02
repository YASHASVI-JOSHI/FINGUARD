import { nanoid } from 'nanoid'

/**
 * In-memory "collections" that mimic the shape of a Mongoose model enough to
 * swap in real MongoDB later without touching route/service code:
 *   collection.find(predicate?)
 *   collection.findOne(predicate)
 *   collection.insertOne(doc)          -> returns doc with _id
 *   collection.updateOne(id, patch)    -> returns updated doc | null
 *   collection.deleteOne(id)           -> returns boolean
 *
 * Data resets whenever the server restarts. Structured so each store can
 * later become `mongoose.model('X', schema)` with the same call sites.
 */
function createCollection(name) {
  const store = new Map()

  return {
    name,
    find(predicate) {
      const all = [...store.values()]
      return predicate ? all.filter(predicate) : all
    },
    findOne(predicate) {
      return [...store.values()].find(predicate) ?? null
    },
    findById(id) {
      return store.get(id) ?? null
    },
    insertOne(doc) {
      const _id = doc._id ?? nanoid(12)
      const record = { ...doc, _id, createdAt: doc.createdAt ?? new Date().toISOString() }
      store.set(_id, record)
      return record
    },
    updateOne(id, patch) {
      const existing = store.get(id)
      if (!existing) return null
      const updated = { ...existing, ...patch, _id: id, updatedAt: new Date().toISOString() }
      store.set(id, updated)
      return updated
    },
    deleteOne(id) {
      return store.delete(id)
    },
    clear() {
      store.clear()
    },
    count() {
      return store.size
    },
  }
}

export const db = {
  users: createCollection('users'),
  transactions: createCollection('transactions'),
  budgets: createCollection('budgets'),
  loans: createCollection('loans'),
  creditReports: createCollection('creditReports'),
  fraudRecords: createCollection('fraudRecords'),
  investments: createCollection('investments'),
}
