# AI Chat Integration Setup Guide

## ✅ What's Already Done

1. ✅ Frontend chat UI created (`frontend/src/pages/ChatPage.jsx`)
2. ✅ Backend API route created (`backend/src/routes/chat.js`)
3. ✅ Ollama installed and running on port 11434
4. ✅ Llama3.2 model downloaded (2GB)
5. ✅ Navigation link added to sidebar ("AI Assistant")
6. ✅ Authentication middleware integrated

## ✅ Setup Complete!

Your AI chat is now fully functional with Ollama!

### 1. Environment Variables

Add to `backend/.env`:

```env
OPENWEBUI_URL=http://localhost:3000
```

### 2. Access OpenWebUI Web Interface

Open in browser:
- URL: http://localhost:3000
- Create an account or login
- Connect your LLM (Ollama, OpenAI, etc.)

### 3. Configure Your LLM

#### Option A: Using Ollama (Free, Local)
```bash
# Install Ollama
brew install ollama

# Start Ollama
ollama serve

# Download a model
ollama pull llama2
ollama pull mistral
```

#### Option B: Using OpenAI
- Get API key from https://platform.openai.com
- Add to OpenWebUI settings

#### Option C: Using Other Providers
- Configure in OpenWebUI web interface

### 4. Test the Chat

1. Start backend: `cd backend && npm run dev`
2. Open AI Assistant page in the app
3. Type a message and send!

## 🎯 Current Status

The chat is now connected! When you send a message:
- Frontend sends request to backend at `/api/chat`
- Backend proxies to OpenWebUI API
- OpenWebUI processes with your configured LLM
- Response comes back to frontend

## 🔍 Troubleshooting

### Issue: "Cannot connect to OpenWebUI"
- Check if Docker container is running: `docker ps`
- Check if OpenWebUI is accessible: http://localhost:3000
- Restart container: `docker restart open-webui`

### Issue: "No LLM configured"
- Access OpenWebUI at http://localhost:3000
- Go to Settings → Models
- Connect your LLM provider

### Issue: Responses seem generic
- The fallback is active
- Configure OpenWebUI with a real LLM
- Check backend logs for errors

## 📝 Next Steps

1. **Connect a real LLM** in OpenWebUI
2. **Customize the system prompt** in `backend/src/routes/chat.js` (line 24)
3. **Add conversation history** (already implemented)
4. **Optional**: Add user context (goals, transactions) to AI responses

## 🚀 Alternative: Direct API Integration

If you prefer not to use OpenWebUI, you can connect directly to:
- OpenAI API
- Anthropic API
- Ollama (local)
- Other LLM providers

Just modify `backend/src/routes/chat.js` to call your preferred API.

