# Quick Start Guide - Polymind Telegram Mini App

## 🚀 Get Started in 5 Minutes

### Step 1: Setup Environment

```bash
cd temp_polymind
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_POLYMIND_API_URL=http://localhost:8000
```

### Step 2: Start Polymind Backend

```bash
# In your Polymind root directory
python app.py
```

Backend should be running at `http://localhost:8000`

### Step 3: Start Frontend

```bash
# In temp_polymind directory
npm run dev
```

Frontend will be at `http://localhost:3000`

### Step 4: Setup Telegram Bot

#### Option A: Development with ngrok

```bash
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

#### Option B: Local Testing

Open `http://localhost:3000` in browser (limited Telegram features)

### Step 5: Configure Bot in BotFather

1. Open [@BotFather](https://t.me/botfather) in Telegram

2. Create Mini App:
```
/newapp
- Select your bot
- Enter app title: Polymind
- Enter description: AI Chat Assistant
- Upload icon (512x512 PNG)
- Enter URL: https://your-ngrok-url.ngrok.io
- Enter short name: polymind
```

3. Get your bot token from BotFather

### Step 6: Test in Telegram

1. Open your bot in Telegram
2. Send `/start`
3. Click "Open App" button
4. Mini App should load with Telegram theme

## ✅ Verification Checklist

- [ ] Backend running at port 8000
- [ ] Frontend running at port 3000
- [ ] ngrok tunnel active (for Telegram testing)
- [ ] Bot configured in BotFather
- [ ] Mini App opens in Telegram
- [ ] User data detected from Telegram
- [ ] Can send messages to AI

## 🔧 Troubleshooting

### Backend not connecting

```bash
# Check backend is running
curl http://localhost:8000/webapp/models

# Should return JSON with models
```

### Telegram WebApp not loading

- Check ngrok URL is HTTPS
- Verify URL in BotFather matches ngrok
- Clear Telegram cache: Settings → Advanced → Clear Cache

### Models not showing

```bash
# Test backend endpoint
curl http://localhost:8000/webapp/models

# Check backend logs
```

### Streaming not working

- Ensure backend supports SSE
- Check browser console for errors
- Verify Content-Type: text/event-stream

## 📱 Development Workflow

### 1. Make Frontend Changes

```bash
# Edit files in temp_polymind/
# Hot reload will update automatically
```

### 2. Make Backend Changes

```bash
# Edit files in src/api/routes/webapp_streaming.py
# Restart backend: python app.py
```

### 3. Test in Telegram

- Refresh Mini App in Telegram
- Or reopen the app

### 4. Check Logs

```bash
# Frontend logs
npm run dev
# Check browser console

# Backend logs
# Check terminal running app.py
```

## 🎯 Next Steps

### Complete the Integration

See `INTEGRATION_SUMMARY.md` for detailed next steps:

1. Update Model Provider to fetch from backend
2. Update Chat Provider to use Polymind API
3. Integrate SSE streaming in chat components
4. Remove Supabase dependencies
5. Test end-to-end
6. Deploy to production

### Key Files to Modify

```
lib/model-store/provider.tsx    # Use polymindApi.getModels()
lib/chat-store/chats/provider.tsx # Use polymindApi functions
app/components/chat/*.tsx       # Add streaming support
```

## 📚 Documentation

- **Full Integration Plan:** `INTEGRATION_PLAN.md`
- **Complete Summary:** `INTEGRATION_SUMMARY.md`
- **Setup Guide:** `README_POLYMIND.md`

## 🆘 Need Help?

1. Check browser console for errors
2. Check backend logs
3. Verify environment variables
4. Review integration docs
5. Test with curl commands

## 🎉 Success!

If you can:
- ✅ See Telegram user data
- ✅ Load models from backend
- ✅ Send messages
- ✅ Receive streaming responses

**You're ready to continue development!**

---

**Happy coding! 🚀**
