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
    
    const [transactions, goalsList] = await Promise.all([
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

    // Calculate goal progress for each LIMIT goal
    const goalsWithProgress = await Promise.all(goalsList.map(async (goal) => {
      if (goal.type === 'LIMIT') {
        const startDate = new Date()
        if (goal.period === 'WEEK') startDate.setDate(startDate.getDate() - 7)
        else if (goal.period === 'MONTH') startDate.setMonth(startDate.getMonth() - 1)
        else if (goal.period === 'YEAR') startDate.setFullYear(startDate.getFullYear() - 1)
        
        const goalTransactions = await prisma.transaction.findMany({
          where: {
            userId,
            category: goal.category,
            type: 'DEBIT',
            date: { gte: startDate }
          }
        })
        
        const spent = goalTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
        const percent = (spent / goal.maxSpend) * 100
        
        return {
          ...goal,
          spent,
          percent,
          progress: { spent, percent }
        }
      }
      return goal
    }))

    // Format data for AI context
    const transactionsSummary = transactions.slice(0, 5).map(t => 
      `$${Math.abs(t.amount)} ${t.category || 'Other'}`
    ).join(', ')

    const goalsSummary = goalsWithProgress.map(g => {
      if (g.type === 'LIMIT') {
        return `${g.title}: $${g.maxSpend}/${g.period} (${g.percent.toFixed(0)}%)`
      }
      return `${g.title}: Target $${g.targetAmount}`
    }).join(' | ')

    // Store goals for potential updates
    const goals = goalsList

    // Connect to Ollama API (running locally)
    const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'
    
    try {
      // Analyze goals and detect issues
      const problematicGoals = goalsWithProgress.filter(g => 
        g.type === 'LIMIT' && g.percent > 100
      )
      const underusedGoals = goalsWithProgress.filter(g => 
        g.type === 'LIMIT' && g.percent < 50 && g.spent > 0
      )
      
      let suggestions = []
      if (problematicGoals.length > 0) {
        problematicGoals.forEach(goal => {
          const newLimit = Math.round(goal.maxSpend * 1.5)
          suggestions.push(`${goal.title}: $${goal.maxSpend} → $${newLimit} (${goal.percent.toFixed(0)}% used)`)
        })
      }
      if (underusedGoals.length > 0 && problematicGoals.length > 0) {
        underusedGoals.forEach(goal => {
          const newLimit = Math.round(goal.maxSpend * 0.7)
          suggestions.push(`${goal.title}: $${goal.maxSpend} → $${newLimit} (${goal.percent.toFixed(0)}% used)`)
        })
      }

      const suggestionsText = suggestions.length > 0 
        ? `\n\nGOAL ADJUSTMENT SUGGESTIONS:\n${suggestions.join('\n')}`
        : ''

      // Build enhanced system prompt with user data
      const systemPrompt = `You are a concise financial assistant. Keep responses SHORT (1-2 sentences max).

USER DATA:
Transactions: ${transactionsSummary || 'None'}
Goals: ${goalsSummary || 'None'}${suggestionsText}

RULES:
- Be brief and direct
- If LIMIT goal exceeded (>100%): suggest increase
- If underutilized (<50%): suggest decrease
- After suggesting changes, ask: "Should I apply these updates?"
- User will say "yes", "apply", or "update" to confirm`
      
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

      // Detect if user wants to update goals based on AI suggestions
      const lowerMessage = message.toLowerCase()
      let goalUpdates = []
      let updateMessage = ''
      
      // Check if user wants to apply updates with phrases like "and apply", "then update", etc.
      const comboRequest = lowerMessage.includes('and apply') || lowerMessage.includes('then update') ||
                           lowerMessage.includes('and update') || lowerMessage.includes('apply now') ||
                           lowerMessage.includes('update them') || lowerMessage.includes('apply changes')
      
      // Check for approval in current or previous message
      const userApproves = lowerMessage.includes('yes') || lowerMessage.includes('sure') || 
                          lowerMessage.includes('ok') || lowerMessage.includes('go ahead') ||
                          lowerMessage.includes('apply') || lowerMessage.includes('update')
      
      if ((comboRequest || userApproves) && (problematicGoals.length > 0 || underusedGoals.length > 0)) {
        
        // Update exceeded goals (increase limit by 50%)
        problematicGoals.forEach(goal => {
          const newLimit = Math.round(goal.maxSpend * 1.5)
          goalUpdates.push({
            id: goal.id,
            maxSpend: newLimit
          })
          updateMessage += `✅ Increased "${goal.title}" limit from $${goal.maxSpend} to $${newLimit}. `
        })
        
        // Update underused goals (decrease limit by 30%) only if there are problematic goals
        if (problematicGoals.length > 0) {
          underusedGoals.forEach(goal => {
            const newLimit = Math.round(goal.maxSpend * 0.7)
            goalUpdates.push({
              id: goal.id,
              maxSpend: newLimit
            })
            updateMessage += `✅ Reduced "${goal.title}" limit from $${goal.maxSpend} to $${newLimit}. `
          })
        }

        // Apply the updates to database
        if (goalUpdates.length > 0) {
          await Promise.all(goalUpdates.map(update =>
            prisma.goal.update({
              where: { id: update.id },
              data: { maxSpend: update.maxSpend }
            })
          ))
        }
      }

      return res.json({
        response: updateMessage || aiResponse,
        updatedGoals: goalUpdates,
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

