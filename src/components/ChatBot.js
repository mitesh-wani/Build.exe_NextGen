import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Paper, Typography, IconButton, InputBase, Fab, Fade, Zoom, Chip, Avatar 
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Send as SendIcon 
} from '@mui/icons-material';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const messagesEndRef = useRef(null);

  // --- YOUR CUSTOM IMAGE URL ---
  const botImage = "https://files.bpcontent.cloud/2025/08/12/08/20250812085157-Y4781J4O.png";

  // FAQ Data (Core Functionality)
  const faqData = [
    { question: 'What is this platform?', answer: 'Civix connects citizens with local authorities to fix infrastructure issues efficiently.' },
    { question: 'How do I report an issue?', answer: 'Click the "Report Issue" button, snap a photo, and our AI will handle the rest.' },
    { question: 'How can I track my report?', answer: 'Go to your Dashboard or Profile to see real-time updates on your tickets.' },
    { question: 'Is it free?', answer: 'Yes, this is a free public service for all citizens.' }
  ];

  // Initialize Chat with Welcome Message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ text: "Hi! I'm CiviBot. How can I help you today?", isBot: true }]);
      setSuggestedQuestions(faqData.map(item => item.question).slice(0, 3));
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Sending Messages
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // 1. Add User Message
    const newMessages = [...messages, { text: inputValue, isBot: false }];
    setMessages(newMessages);
    setInputValue('');
    setSuggestedQuestions([]);

    // 2. Simulate Bot Response
    setTimeout(() => {
      const matched = faqData.find(q => 
        q.question.toLowerCase().includes(inputValue.toLowerCase()) || 
        inputValue.toLowerCase().includes(q.question.toLowerCase())
      );

      if (matched) {
        setMessages(prev => [...prev, { text: matched.answer, isBot: true }]);
      } else {
        setMessages(prev => [...prev, { text: "I'm still learning! Try picking a topic below:", isBot: true }]);
        setSuggestedQuestions(faqData.map(item => item.question).slice(0, 3));
      }
    }, 800);
  };

  // Handle Clicking Suggested Chips
  const handleSuggestedClick = (question) => {
    setMessages(prev => [...prev, { text: question, isBot: false }]);
    setTimeout(() => {
      const matched = faqData.find(item => item.question === question);
      if (matched) setMessages(prev => [...prev, { text: matched.answer, isBot: true }]);
    }, 600);
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 30, right: 30, zIndex: 9999 }}>
      
      {/* 1. CHAT WINDOW CONTAINER */}
      <Fade in={isOpen}>
        <Paper elevation={6} sx={{ 
          width: 320, height: 450, display: isOpen ? 'flex' : 'none', flexDirection: 'column', 
          borderRadius: 4, overflow: 'hidden', mb: 2 
        }}>
          
          {/* A. HEADER (With Custom Image) */}
          <Box sx={{ bgcolor: '#1976d2', color: 'white', p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar src={botImage} sx={{ width: 32, height: 32, bgcolor: 'white' }} />
              <Typography variant="subtitle1" fontWeight="bold">Civix Support</Typography>
            </Box>
            <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* B. MESSAGES AREA */}
          <Box sx={{ flex: 1, p: 2, overflowY: 'auto', bgcolor: '#f5f5f5' }}>
            {messages.map((msg, index) => (
              <Box key={index} sx={{ display: 'flex', justifyContent: msg.isBot ? 'flex-start' : 'flex-end', mb: 1.5 }}>
                {/* Show Avatar for Bot Messages */}
                {msg.isBot && (
                   <Avatar src={botImage} sx={{ width: 28, height: 28, mr: 1, mt: 0.5 }} />
                )}
                <Paper sx={{ 
                  p: 1.5, maxWidth: '75%', 
                  bgcolor: msg.isBot ? 'white' : '#1976d2', 
                  color: msg.isBot ? 'text.primary' : 'white',
                  borderRadius: msg.isBot ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                  boxShadow: 1
                }}>
                  <Typography variant="body2">{msg.text}</Typography>
                </Paper>
              </Box>
            ))}
            
            {/* Suggested Question Chips */}
            {suggestedQuestions.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {suggestedQuestions.map((q, idx) => (
                  <Chip 
                    key={idx} label={q} onClick={() => handleSuggestedClick(q)} 
                    color="primary" variant="outlined" size="small" 
                    sx={{ bgcolor: 'white', borderColor: '#1976d2', color: '#1976d2' }}
                  />
                ))}
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* C. INPUT AREA */}
          <Box sx={{ p: 1.5, bgcolor: 'white', borderTop: '1px solid #eee', display: 'flex' }}>
            <InputBase 
              fullWidth placeholder="Type a message..." 
              value={inputValue} onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              sx={{ ml: 1, flex: 1 }}
            />
            <IconButton color="primary" onClick={handleSendMessage}>
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </Fade>

      {/* 2. FLOATING TOGGLE BUTTON (With Custom Image) */}
      <Zoom in={!isOpen}>
        <Fab 
          aria-label="chat" 
          onClick={() => setIsOpen(true)}
          sx={{ 
            width: 65, height: 65, 
            display: isOpen ? 'none' : 'flex', 
            bgcolor: 'white', 
            '&:hover': { bgcolor: '#f5f5f5' } // Slight grey on hover
          }}
        >
          {/* The Custom Image Icon */}
          <Avatar 
            src={botImage} 
            sx={{ width: 45, height: 45 }} 
            variant="square" // Optional: remove this if you want it circular
          />
        </Fab>
      </Zoom>
    </Box>
  );
};

export default ChatBot;