import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, Plus, Bot, User, Trash2 } from 'lucide-react'
import { api } from '../api/client'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
}

const SUGGESTED_PROMPTS = [
  'How can I reduce my expenses?',
  'Should I invest in mutual funds?',
  'How do I improve my credit score?',
  'Am I on track with my budget?',
]

function newId() {
  return Math.random().toString(36).slice(2, 10)
}

function makeConversation(): Conversation {
  return { id: newId(), title: 'New conversation', messages: [] }
}

export default function Chatbot() {
  const [conversations, setConversations] = useState<Conversation[]>([makeConversation()])
  const [activeId, setActiveId] = useState(conversations[0].id)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const active = conversations.find((c) => c.id === activeId)!

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [active.messages, isTyping])

  function updateActive(updater: (c: Conversation) => Conversation) {
    setConversations((prev) => prev.map((c) => (c.id === activeId ? updater(c) : c)))
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isTyping) return

    const userMessage: Message = { id: newId(), role: 'user', content: trimmed }
    updateActive((c) => ({
      ...c,
      title: c.messages.length === 0 ? trimmed.slice(0, 40) : c.title,
      messages: [...c.messages, userMessage],
    }))
    setInput('')
    setIsTyping(true)

    try {
      // Stateless today (predefined intent-matching on the backend) — the
      // request/response shape here is exactly what a real LLM call would
      // use, so swapping chatbotReply() for a real API call later won't
      // require touching this component.
      const res = await api.post<{ reply: string }>('/ai/chat', { message: trimmed })
      const assistantMessage: Message = { id: newId(), role: 'assistant', content: res.reply }
      updateActive((c) => ({ ...c, messages: [...c.messages, assistantMessage] }))
    } catch (err) {
      const errorMessage: Message = {
        id: newId(),
        role: 'assistant',
        content: err instanceof Error ? `Something went wrong: ${err.message}` : 'Something went wrong. Please try again.',
      }
      updateActive((c) => ({ ...c, messages: [...c.messages, errorMessage] }))
    } finally {
      setIsTyping(false)
    }
  }

  function handleNewChat() {
    const c = makeConversation()
    setConversations((prev) => [c, ...prev])
    setActiveId(c.id)
  }

  function handleDelete(id: string) {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id)
      if (next.length === 0) {
        const fresh = makeConversation()
        setActiveId(fresh.id)
        return [fresh]
      }
      if (id === activeId) setActiveId(next[0].id)
      return next
    })
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      {/* Conversation history sidebar */}
      <div className="hidden w-64 shrink-0 flex-col rounded-2xl border border-white/5 bg-surface p-3 md:flex">
        <button
          onClick={handleNewChat}
          className="mb-3 flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-text transition-colors hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" /> New chat
        </button>
        <div className="flex-1 space-y-1 overflow-y-auto">
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
                c.id === activeId ? 'bg-card text-text' : 'text-muted hover:bg-card/60 hover:text-text'
              }`}
            >
              <span className="truncate">{c.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(c.id)
                }}
                className="ml-2 shrink-0 opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main conversation panel */}
      <div className="flex flex-1 flex-col rounded-2xl border border-white/5 bg-surface">
        <div className="flex items-center gap-2 border-b border-white/5 px-5 py-4">
          <MessageCircle className="h-5 w-5 text-accent" />
          <h1 className="text-sm font-semibold text-text">AI Financial Chatbot</h1>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6">
          {active.messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-card">
                <Bot className="h-6 w-6 text-accent" />
              </div>
              <h2 className="font-semibold text-text">Ask me anything about your money</h2>
              <p className="mt-1 text-sm text-muted">Try one of these to get started:</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="rounded-full border border-white/10 bg-card px-3.5 py-2 text-xs text-muted transition-colors hover:border-accent hover:text-text"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {active.messages.map((m) => (
                <ChatBubble key={m.id} message={m} />
              ))}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-card">
                      <Bot className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex gap-1 rounded-2xl bg-card px-4 py-3">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-muted"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage(input)
          }}
          className="flex items-center gap-2 border-t border-white/5 p-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about spending, budgets, credit, loans, investments…"
            className="flex-1 rounded-lg border border-white/10 bg-card px-4 py-2.5 text-sm text-text placeholder:text-muted/60 outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-text transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}

function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isUser ? 'bg-primary' : 'bg-card'}`}>
        {isUser ? <User className="h-4 w-4 text-text" /> : <Bot className="h-4 w-4 text-accent" />}
      </div>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser ? 'bg-primary text-text' : 'bg-card text-text'
        }`}
      >
        {message.content}
      </div>
    </motion.div>
  )
}
