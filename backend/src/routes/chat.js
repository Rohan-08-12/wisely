const express = require('express')
const router = express.Router()
const axios = require('axios')
const { authenticateUser } = require('../middleware/auth')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

router.post('/', authenticateUser, async (req, res, next) => {
  try {
    const { message, conversation_history = [] } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    // Fetch user's recent transactions and goals for context
    const userId = req.user.id
    
    const [transactions, goals] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 20, // Last 20 transactions
        select: {
          id: true,
          amount: true,
          type: true,
          date: true,
          description: true,
          merchantName: true,
          category: true
        }
      }),
      prisma.goal.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          type: true,
          category: true,
          maxSpend: true,
          targetAmount: true,
          period: true,
          createdAt: true
        }
      })
    ])

    // Format data for AI context
    const transactionsSummary = transactions.slice(0, 10).map(t => 
      `${t.type} - $${Math.abs(t.amount)} - ${t.description || t.merchantName || 'Unknown'} (${t.category || 'Uncategorized'})`
    ).join('\n')

    const goalsSummary = goals.map(g => 
      g.type === 'LIMIT' 
        ? `${g.title} (${g.type}): Max $${g.maxSpend} per ${g.period} for ${g.category}`
        : `${g.title} (${g.type}): Target $${g.targetAmount}`
    ).join('\n')

    // Connect to Ollama API (running locally)
    const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'
    
    try {
      // Build enhanced system prompt with user data
      const systemPrompt = `You are a helpful financial assistant. You have access to the user's financial data:

RECENT TRANSACTIONS (last 10):
${transactionsSummary || 'No recent transactions'}

CURRENT GOALS:
${goalsSummary || 'No goals set'}

Use this information to provide personalized financial advice. Be concise, practical, and specific to their situation. You can reference specific transactions or goals when relevant.`
      
      // Build the conversation for Ollama
      const conversationMessages = [
        {
          role: 'system',
          content: systemPrompt
        },
        ...conversation_history,
        {
          role: 'user',
          content: message
        }
      ]

      const response = await axios.post(`${OLLAMA_URL}/api/chat`, {
        model: 'llama3.2',
        messages: conversationMessages,
        stream: false
      })

      const aiResponse = response.data.message.content

      return res.json({
        response: aiResponse,
        timestamp: new Date().toISOString()
      })
    } catch (axiosError) {
      console.error('Ollama API error:', axiosError.message)
      
      // Fallback: Return a mock response if Ollama is not available
      return res.json({
        response: `I understand you're asking: "${message}". This is a placeholder response. Please ensure Ollama is running on localhost:11434 and the model 'llama3.2' is downloaded.`,
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    next(error)
  }
})

module.exports = router

