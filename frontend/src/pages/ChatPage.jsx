import { useState, useRef, useEffect } from 'react'
import { Send, MessageSquare, Bot } from 'lucide-react'
import api from '../services/api'

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI financial assistant. How can I help you manage your finances today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages([...messages, userMessage])
    const currentInput = input
    setInput('')
    setIsLoading(true)

    try {
      // Call the backend chat API
      const response = await api.post('/chat', {
        message: currentInput,
        conversation_history: messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))
      })

      const data = response.data

      const aiResponse = {
        id: messages.length + 2,
        text: data.response,
        sender: 'ai',
        timestamp: new Date(data.timestamp)
      }
      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('Chat error:', error)
      const aiResponse = {
        id: messages.length + 2,
        text: 'Sorry, I encountered an error. Please try again later.',
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 pt-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-orange-500 p-3 rounded-lg">
          <MessageSquare className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Financial Assistant</h1>
          <p className="text-gray-500">Get personalized financial advice and insights</p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-300px)]">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender === 'ai'
                    ? 'bg-orange-500'
                    : 'bg-orange-100'
                }`}
              >
                {message.sender === 'ai' ? (
                  <Bot className="h-5 w-5 text-white" />
                ) : (
                  <span className="text-sm font-medium text-orange-600">U</span>
                )}
              </div>
              <div
                className={`flex-1 rounded-lg p-4 ${
                  message.sender === 'ai'
                    ? 'bg-orange-50 text-gray-900'
                    : 'bg-orange-500 text-white'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <span className="text-xs opacity-70 mt-2 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 rounded-lg p-4 bg-orange-50">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSend} className="flex items-center space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about your finances..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                input.trim() && !isLoading
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <p className="text-sm text-orange-800">
          <strong>Powered by Ollama:</strong> This AI assistant uses Llama3.2 running locally on your machine. 
          Ask me anything about managing your finances, setting goals, or understanding spending patterns.
        </p>
      </div>
    </div>
  )
}

export default ChatPage

