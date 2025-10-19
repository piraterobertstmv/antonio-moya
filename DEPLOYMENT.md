# Deployment Instructions for Vercel

## Prerequisites
- Vercel account
- OpenAI API key

## Steps to Deploy

### 1. Install Vercel CLI (if not already installed)
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Add Environment Variable
In your Vercel dashboard:
- Go to your project Settings
- Navigate to Environment Variables
- Add: `VITE_OPENAI_API_KEY` with your OpenAI API key
- Make sure it's available for Production, Preview, and Development

### 4. Deploy
```bash
vercel --prod
```

## Testing Locally with Vercel
To test the serverless functions locally:
```bash
vercel dev
```

This will run your app with the serverless API functions working locally.

## How It Works
- The chatbot calls `/api/chat` endpoint
- This is a Vercel serverless function that securely calls OpenAI
- Your API key stays secure on the server and is never exposed to the client

## Security
✅ API key is stored as an environment variable in Vercel
✅ All OpenAI calls happen server-side
✅ No API key exposure in the frontend code

