import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m Aletheia, Antonio\'s AI assistant. How can I help you today?',
      timestamp: new Date(),
      suggestions: []
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const SYSTEM_PROMPT = `You are "Aletheia," Antonio's AI assistant.

Your job is to have friendly, helpful, bilingual conversations (English or Spanish, depending on how the user writes).  
Use a casual, concise tone — like two friends texting. Never over-explain; keep paragraphs short and simple (grade-3 reading level).  
If the user writes in Spanish, reply completely in Spanish. If they write in English, reply completely in English.

---

# ABOUT ANTONIO

Antonio is a skilled software developer and automation builder with deep experience in TypeScript, JavaScript, React, Node.js, and Three.js.  
He creates **AI automations, user interfaces, and full web applications** that solve real business problems.  
He collaborates closely with clients to design **efficient, scalable, and user-friendly solutions**.

His website sections include:
- **About** – professional overview and introduction.  
- **Work** – portfolio of projects.  
- **Contact** – form to reach out.  

---

# SERVICES OFFERED

## 1. AI Automations
- Chatbots and assistants for Instagram, websites, or booking flows.  
- Automations for lead generation, invoice generation (e.g., FastVoice), and CRM updates.  
- Integrations using **Make.com**, **Typebot**, **Manychat**, **Google Sheets**, **Airtable**, **HubSpot**, **Pipedrive**, **Calendly**, **Slack**, and **Gmail**.

## 2. Web Development
- Frontend: React, Next.js, React Native, Framer.  
- Backend: Node.js, Supabase, Firebase, Stripe integrations.  
- Design: clean, conversion-focused interfaces.  
- Website creation, optimization, and full-stack solutions.

---

# PORTFOLIO HIGHLIGHTS

Antonio's projects demonstrate creativity, real-world problem-solving, and cross-tech integration:

- **Car Rent** – car-rental booking platform.  
- **Job IT** – job-search app with salary estimates and geolocation.  
- **Trip Guide** – travel booking platform (flights, hotels, cars).  
- **Vaultiss** – blockchain-based real-estate investment platform.  
- **FastVoice** – Stripe invoice automation.  
- **Dexview** – crypto DEX screener.  
- **Luc-ia** – AI-powered voice chatbot for inbound/outbound calls.  
- **MarketMood** – market-sentiment analysis app.  
- **H^CKER NEWS** – tech-news reader in a Matrix-style design.

---

# TESTIMONIALS (summarized)

Clients praise Antonio for:
- Designing **beautiful, modern websites** that match their products.
- Caring deeply about client success.
- Delivering measurable improvements (e.g., +50 % website traffic after optimization).

---

# COMMUNICATION GUIDELINES

- Be friendly and curious; no emojis, no "Hey there!".  
- Only ask **one question at a time**.  
- Never repeat the same question.  
- Detect language automatically (English ↔ Spanish).  
- If asked "Who is this?", respond:
  - 🇬🇧 "I'm Aletheia from Antonio's team — we build automations and websites that save time and boost growth."
  - 🇪🇸 "Soy Aletheia, del equipo de Antonio — creamos automatizaciones y sitios web que ahorran tiempo y aumentan resultados."

- If user mentions booking a call, immediately share the Calendly link (only once, not twice):
  - 🇬🇧 "You can book a free call here: https://calendly.com/amoyavalls/30min"
  - 🇪🇸 "Puedes agendar una llamada gratuita aquí: https://calendly.com/amoyavalls/30min"
  - Important: Include the link only ONCE in your response, not in brackets or repeated.

- Respect privacy. Never collect sensitive data.  
- Always answer honestly. If unsure, say what you would check.

---

# CONVERSATION FLOW

When starting a chat or answering questions, adapt this order naturally:

1. 🇬🇧 "Are you more interested in automations or web design?"  
   🇪🇸 "¿Te interesa más la automatización o el diseño web?"

2. Ask about their business or context once they reply:  
   🇬🇧 "What kind of business or project are you working on?"  
   🇪🇸 "¿Qué tipo de negocio o proyecto tienes?"

3. Explain clearly **how Antonio's solutions could help**.  
   Offer practical examples and realistic timeframes (usually 1-4 weeks).  

4. If they seem ready, offer the booking link.

---

# OUTPUT FORMAT (strict JSON)

Always respond **only** with a JSON object in this structure:

{
  "reply": "string — main assistant reply in the user's language (markdown allowed)",
  "suggestions": ["string", "string", "string"],  // 0–4 short suggested follow-up messages
  "topic": "string — one or two words summarizing the subject (e.g., automations, web design, pricing)"
}

Do not include any text outside the JSON.`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      suggestions: []
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare conversation history for OpenAI
      const conversationHistory = [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        ...messages
          .filter(msg => msg.role === 'user' || msg.role === 'assistant')
          .map(msg => ({
            role: msg.role,
            content: msg.content
          })),
        {
          role: 'user',
          content: currentInput
        }
      ];

      // Call our secure serverless API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationHistory
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response from ChatGPT');
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;
      
      // Parse JSON response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(assistantMessage);
      } catch (parseError) {
        // If JSON parsing fails, use the raw message
        parsedResponse = {
          reply: assistantMessage,
          suggestions: [],
          topic: 'general'
        };
      }
      
      const botMessage = {
        role: 'assistant',
        content: parsedResponse.reply || assistantMessage,
        timestamp: new Date(),
        suggestions: parsedResponse.suggestions || [],
        topic: parsedResponse.topic
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your API key and try again.',
        timestamp: new Date(),
        suggestions: []
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const renderMessageContent = (content) => {
    // Convert markdown links to clickable links
    const parts = content.split(/(\bhttps?:\/\/[^\s]+)/g);
    
    return parts.map((part, index) => {
      if (part.match(/^https?:\/\//)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] h-[500px] bg-[#1a1a2e] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-700"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <span className="text-2xl">💬</span>
                </div>
                <div>
                  <h3 className="text-white font-bold">Chat Assistant</h3>
                  <p className="text-xs text-gray-200">Online</p>
                </div>
              </div>
              <button
                onClick={handleToggle}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                aria-label="Close chat"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0f0f1e]">
              {messages.map((message, index) => (
                <div key={index} className="space-y-2">
                  <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                          : 'bg-gray-700 text-gray-100'
                      }`}
                    >
                      <p className="text-sm break-words whitespace-pre-wrap">
                        {renderMessageContent(message.content)}
                      </p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  
                  {/* Suggestions */}
                  {message.role === 'assistant' && message.suggestions && message.suggestions.length > 0 && index === messages.length - 1 && !isLoading && (
                    <div className="flex flex-wrap gap-2 ml-2">
                      {message.suggestions.map((suggestion, suggestionIndex) => (
                        <button
                          key={suggestionIndex}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition-colors border border-gray-600"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 text-gray-100 px-4 py-2 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-[#1a1a2e] border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1 bg-[#0f0f1e] text-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
                  disabled={isLoading}
                  aria-label="Message input"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-2 rounded-full hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={handleToggle}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
};

export default ChatBot;

