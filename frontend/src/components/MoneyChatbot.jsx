import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, Smile, DollarSign } from 'lucide-react';

const MONEY_JOKES = [
  "Why did the dollar go to therapy? Because it was having an inflation crisis! 💸",
  "My wallet is like an onion. When I open it, it makes me cry! 🧅💰",
  "Why is money called 'dough'? Because we all knead it! 🥖",
  "If money doesn't grow on trees, why do banks have so many branches? 🌳🏦",
  "I'm in a committed relationship with my bank account... but it keeps cheating on me with my bills! 💔🧾",
  "Why don't skeletons play poker in the bank? Too much money at stake, and they have no guts! 💀🃏",
  "A bank is a place that will lend you money if you can prove that you don't need it! 🏦🤪",
  "Why did the rich man throw his clock out the window? He wanted to see time fly, but realized time is money! ⏰✈️",
  "What is the easiest way to double your money? Fold it in half and put it back in your pocket! 💵🔄",
  "They say money talks... but all mine ever says is 'Goodbye!' 👋💸"
];

const CHATBOT_RESPONSES = {
  greetings: [
    "Hey there! Sasu here, your friendly neighborhood money guru. Ready to save some serious dough? 🥐💵",
    "Hello! Sasu at your service. Let's talk money, budget, and maybe tell some jokes to keep our wallets smiling! 😄",
    "Welcome back! Sasu AI is online. I've audited the ledger and am ready to give you some premium financial laughs and savings tips! 🌟"
  ],
  saving_tips: [
    "Rule #1 of Sasu budgeting: Never buy things you don't need with money you don't have to impress people you don't like! 💡",
    "Try the 48-hour cooling-off rule on shopping. If you still want that neon green dinosaur lamp in 2 days, you have my permission! 🦖💡",
    "Want to save? Automate 15% of your income into savings on payday BEFORE you start spending. Treat savings like a bill you owe to your future self! 🛡️"
  ],
  general: [
    "Haha, that's a classic! Remember: money can't buy happiness, but it's much more comfortable to cry in a sports car. Let's get you there! 🏎️💨",
    "Intriguing question! Financial freedom isn't about having a lot of money; it's about having complete control over what you do have. Let's keep tracking! 📊",
    "You are doing great. Keep tracking your expenses on Sasu Spend and soon your savings goal progress bar will look as full as my stomach after pizza night! 🍕📈"
  ]
};

const MoneyChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hey! I am Sasu, your friendly AI Coach. I'm here to help you save money and keep you smiling. Ask me anything, or click a quick action below! 🤖✨",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputVal.trim();
    if (!text) return;

    // Add user message
    const userMsg = {
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputVal('');

    // Trigger typing state
    setIsTyping(true);

    setTimeout(() => {
      let botText = "";
      const cleanedText = text.toLowerCase();

      if (cleanedText.includes('joke') || cleanedText.includes('funny') || cleanedText.includes('laugh')) {
        botText = "🤣 Here's a good one for you:\n\n" + MONEY_JOKES[Math.floor(Math.random() * MONEY_JOKES.length)];
      } else if (cleanedText.includes('save') || cleanedText.includes('budget') || cleanedText.includes('reduce')) {
        const randomTip = CHATBOT_RESPONSES.saving_tips[Math.floor(Math.random() * CHATBOT_RESPONSES.saving_tips.length)];
        botText = "💡 **Sasu's Savings Tip:** " + randomTip + "\n\nRemember: 'A penny saved is a penny you can buy chocolate with later!' 🍫";
      } else if (cleanedText.includes('hello') || cleanedText.includes('hi') || cleanedText.includes('hey') || cleanedText.includes('sasu')) {
        botText = CHATBOT_RESPONSES.greetings[Math.floor(Math.random() * CHATBOT_RESPONSES.greetings.length)];
      } else {
        botText = CHATBOT_RESPONSES.general[Math.floor(Math.random() * CHATBOT_RESPONSES.general.length)];
      }

      const botMsg = {
        sender: 'bot',
        text: botText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000, fontFamily: 'Outfit, sans-serif' }}>
      
      {/* Floating Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)',
            border: 'none',
            outline: 'none',
            width: '60px',
            height: '60px',
            borderRadius: '30px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 30px rgba(99, 102, 241, 0.4)',
            color: '#fff',
            position: 'relative',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          className="hover-glow"
        >
          <MessageSquare size={26} />
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '12px',
            height: '12px',
            borderRadius: '6px',
            background: '#10b981',
            border: '2px solid #0f172a',
            boxShadow: '0 0 10px #10b981'
          }} />
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div style={{
          width: '360px',
          height: '500px',
          borderRadius: '24px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          
          {/* Header */}
          <div style={{
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(167, 139, 250, 0.05) 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)',
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(99, 102, 241, 0.3)'
              }}>
                <Sparkles size={16} color="#fff" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#f3f4f6' }}>Sasu AI Coach 🤖</h4>
                <p style={{ margin: 0, fontSize: '0.7rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '3px', background: '#10b981', display: 'inline-block' }} />
                  Online & Friendly
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                width: '28px',
                height: '28px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            padding: '1.25rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            background: 'rgba(0, 0, 0, 0.15)'
          }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  padding: '0.85rem 1rem',
                  borderRadius: msg.sender === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                  background: msg.sender === 'user' 
                    ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' 
                    : 'rgba(255, 255, 255, 0.04)',
                  border: msg.sender === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.06)',
                  color: msg.sender === 'user' ? '#fff' : '#e5e7eb',
                  fontSize: '0.85rem',
                  lineHeight: 1.4,
                  fontWeight: 500,
                  whiteSpace: 'pre-line',
                  boxShadow: msg.sender === 'user' ? '0 4px 15px rgba(99, 102, 241, 0.15)' : 'none'
                }}>
                  {msg.text}
                </div>
                <span style={{ fontSize: '0.65rem', color: '#6b7280', marginTop: '4px', padding: '0 4px' }}>
                  {msg.time}
                </span>
              </div>
            ))}
            
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '4px', padding: '10px 15px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <span className="dot" style={{ width: '6px', height: '6px', background: '#9ca3af', borderRadius: '30%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out' }} />
                <span className="dot" style={{ width: '6px', height: '6px', background: '#9ca3af', borderRadius: '30%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out 0.2s' }} />
                <span className="dot" style={{ width: '6px', height: '6px', background: '#9ca3af', borderRadius: '30%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out 0.4s' }} />
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestion Buttons */}
          <div style={{
            padding: '0.5rem 1rem',
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            background: 'rgba(0, 0, 0, 0.1)',
            whiteSpace: 'nowrap'
          }}>
            <button
              onClick={() => handleSendMessage("Tell me a money joke! 🤣")}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '20px',
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                color: '#818cf8',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s'
              }}
            >
              <Smile size={12} />
              Tell me a joke! 🤣
            </button>
            <button
              onClick={() => handleSendMessage("Give me a Sasu savings tip! 💡")}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '20px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#34d399',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s'
              }}
            >
              <DollarSign size={12} />
              How can I save? 💡
            </button>
          </div>

          {/* Inputs Bar */}
          <div style={{
            padding: '1rem',
            background: 'rgba(15, 23, 42, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center'
          }}>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask Sasu about savings or jokes..."
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
                transition: 'all 0.2s'
              }}
            />
            <button
              onClick={() => handleSendMessage()}
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                border: 'none',
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                transition: 'all 0.2s'
              }}
            >
              <Send size={16} />
            </button>
          </div>

        </div>
      )}

      {/* Global CSS Styles */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .hover-glow:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.6);
        }
      `}</style>

    </div>
  );
};

export default MoneyChatbot;
